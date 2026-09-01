import { access, mkdir, writeFile } from 'node:fs/promises';
import { phonogramTranscripts } from './phonogram-transcripts.js';
import { createPhonogramGenerationRequest } from './voicebox-request.js';

export const DEFAULT_VOICEBOX_URL = 'http://127.0.0.1:17493';
export const PRODUCTION_PROFILE_ID = 'a07dbe47-2f91-4c2b-88df-0551bdaebc99';
export const PRODUCTION_PROFILE_NAME = 'story-narrator-01';
export const PRODUCTION_ENGINE = 'qwen_custom_voice';
export const DEFAULT_NARRATION_INSTRUCT = 'Speak slowly and clearly, especially when pronouncing phonogram sounds.';

export function transcriptVersion(transcript) {
  return `${transcript.id}:${transcript.ttsText ?? transcript.text}`;
}

export function createRenderManifestEntry({
  transcript,
  generation = {},
  status,
  timestamp = new Date().toISOString(),
  error,
  profileName = PRODUCTION_PROFILE_NAME,
  profileId = PRODUCTION_PROFILE_ID,
  engine = PRODUCTION_ENGINE
}) {
  const entry = {
    transcriptId: transcript.id,
    transcriptVersion: transcriptVersion(transcript),
    symbol: transcript.symbol,
    profileName,
    profileId,
    engine,
    model: generation.model ?? generation.model_name ?? null,
    generationId: generation.id ?? null,
    outputPath: transcript.audioPath,
    timestamp,
    status
  };
  if (error) entry.error = error;
  return entry;
}

export function upsertRenderManifest(entries, entry) {
  const next = entries.filter(({ outputPath }) => outputPath !== entry.outputPath);
  next.push(entry);
  return next.sort((left, right) => left.outputPath.localeCompare(right.outputPath));
}

export async function writeRenderManifest(path, entries, writeFileImpl = writeFile) {
  await writeFileImpl(path, `${JSON.stringify(entries, null, 2)}\n`);
}

export function createApprovedAudioPlan(transcripts, profileId = PRODUCTION_PROFILE_ID) {
  return transcripts
    .filter((transcript) => transcript.reviewStatus === 'approved')
    .sort((left, right) => left.id - right.id)
    .map((transcript) => ({
      id: transcript.id,
      symbol: transcript.symbol,
      text: transcript.ttsText,
      profileId,
      audioPath: transcript.audioPath
    }));
}

async function requestJson(fetchImpl, url, options, description) {
  const response = await fetchImpl(url, options);
  if (!response.ok) throw new Error(`${description}: ${response.status} ${response.statusText ?? ''}`.trim());
  return response.json();
}

function outputPathFor(item, outputDirectory) {
  return outputDirectory
    ? `${outputDirectory.replace(/\/?$/, '/').replace(/\/\/$/, '/')}${item.audioPath.replace(/^audio\//, '')}`
    : item.audioPath;
}

export function hasCurrentRenderMetadata(item, metadata) {
  return metadata?.transcriptVersion === transcriptVersion(item)
    && metadata.profileId === item.profileId
    && (metadata.outputPath ?? metadata.audioPath) === item.audioPath
    && metadata.status === 'completed';
}

export async function runApprovedAudioBatch({
  transcripts = phonogramTranscripts,
  baseUrl = DEFAULT_VOICEBOX_URL,
  profileId = PRODUCTION_PROFILE_ID,
  fetchImpl = fetch,
  mkdirImpl = mkdir,
  writeFileImpl = writeFile,
  fileExistsImpl = async (path) => access(path).then(() => true, () => false),
  existingMetadata = [],
  manifestEntries = existingMetadata,
  manifestWriter = async () => {},
  now = () => new Date().toISOString(),
  outputDirectory = ''
} = {}) {
  const plan = createApprovedAudioPlan(transcripts, profileId);
  const metadataByPath = new Map(existingMetadata.map((metadata) => [metadata.outputPath ?? metadata.audioPath, metadata]));
  let manifest = [...manifestEntries];
  await mkdirImpl(outputDirectory, { recursive: true });
  const report = { generated: [], skipped: [], failures: [] };

  const saveManifestEntry = async (entry) => {
    manifest = upsertRenderManifest(manifest, entry);
    await manifestWriter(manifest);
  };

  for (const item of plan) {
    if (hasCurrentRenderMetadata(item, metadataByPath.get(item.audioPath)) && await fileExistsImpl(outputPathFor(item, outputDirectory))) {
      report.skipped.push(item.audioPath);
      continue;
    }

    let generation = {};
    try {
      generation = await requestJson(
        fetchImpl,
        `${baseUrl}/generate`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(createPhonogramGenerationRequest(
            item.profileId,
            { ttsText: item.text },
            PRODUCTION_ENGINE,
            DEFAULT_NARRATION_INSTRUCT
          ))
        },
        `Voicebox failed for ${item.symbol}`
      );

      let status = generation.status;
      while (!['completed', 'failed'].includes(status)) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const history = await requestJson(
          fetchImpl,
          `${baseUrl}/history/${generation.id}`,
          undefined,
          `Voicebox could not read generation ${generation.id}`
        );
        generation = { ...generation, ...history };
        status = history.status;
      }
      if (!generation.model && generation.id) {
        const details = await requestJson(
          fetchImpl,
          `${baseUrl}/history/${generation.id}`,
          undefined,
          `Voicebox could not read generation ${generation.id}`
        );
        generation = { ...generation, ...details };
        status = details.status ?? status;
      }
      if (status === 'failed') throw new Error(`Voicebox generation failed for ${item.symbol}.`);

      const audioResponse = await fetchImpl(`${baseUrl}/audio/${generation.id}`);
      if (!audioResponse.ok) throw new Error(`Voicebox could not download audio for ${item.symbol}.`);
      const data = new Uint8Array(await audioResponse.arrayBuffer());
      await writeFileImpl(outputPathFor(item, outputDirectory), data);
      report.generated.push(item.audioPath);
      await saveManifestEntry(createRenderManifestEntry({
        transcript: item,
        generation,
        status: 'completed',
        timestamp: now(),
        profileId
      }));
    } catch (error) {
      report.failures.push({
        audioPath: item.audioPath,
        symbol: item.symbol,
        error: error instanceof Error ? error.message : String(error)
      });
      await saveManifestEntry(createRenderManifestEntry({
        transcript: item,
        generation,
        status: 'failed',
        timestamp: now(),
        profileId,
        error: error instanceof Error ? error.message : String(error)
      }));
    }
  }

  return report;
}

export async function generateApprovedAudio({
  transcripts = phonogramTranscripts,
  baseUrl = DEFAULT_VOICEBOX_URL,
  profileId = PRODUCTION_PROFILE_ID,
  fetchImpl = fetch,
  mkdirImpl = mkdir,
  writeFileImpl = writeFile,
  outputDirectory = ''
} = {}) {
  const report = await runApprovedAudioBatch({
    transcripts,
    baseUrl,
    profileId,
    fetchImpl,
    mkdirImpl,
    writeFileImpl,
    outputDirectory
  });
  if (report.failures.length > 0) {
    throw new Error(report.failures.map(({ symbol, error }) => `${symbol}: ${error}`).join('\n'));
  }
  return report.generated;
}
