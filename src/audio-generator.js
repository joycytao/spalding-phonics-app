import { access, mkdir, writeFile } from 'node:fs/promises';
import { phonogramTranscripts } from './phonogram-transcripts.js';
import { createPhonogramGenerationRequest } from './voicebox-request.js';

export const DEFAULT_VOICEBOX_URL = 'http://127.0.0.1:17493';
export const PRODUCTION_PROFILE_ID = 'a07dbe47-2f91-4c2b-88df-0551bdaebc99';

export function transcriptVersion(transcript) {
  return `${transcript.id}:${transcript.ttsText ?? transcript.text}`;
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
    && metadata.audioPath === item.audioPath
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
  outputDirectory = ''
} = {}) {
  const plan = createApprovedAudioPlan(transcripts, profileId);
  const metadataByPath = new Map(existingMetadata.map((metadata) => [metadata.audioPath, metadata]));
  await mkdirImpl(outputDirectory, { recursive: true });
  const report = { generated: [], skipped: [], failures: [] };

  for (const item of plan) {
    if (hasCurrentRenderMetadata(item, metadataByPath.get(item.audioPath)) && await fileExistsImpl(outputPathFor(item, outputDirectory))) {
      report.skipped.push(item.audioPath);
      continue;
    }

    try {
      const generation = await requestJson(
        fetchImpl,
        `${baseUrl}/generate`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(createPhonogramGenerationRequest(item.profileId, { ttsText: item.text }))
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
        status = history.status;
      }
      if (status === 'failed') throw new Error(`Voicebox generation failed for ${item.symbol}.`);

      const audioResponse = await fetchImpl(`${baseUrl}/audio/${generation.id}`);
      if (!audioResponse.ok) throw new Error(`Voicebox could not download audio for ${item.symbol}.`);
      const data = new Uint8Array(await audioResponse.arrayBuffer());
      await writeFileImpl(outputPathFor(item, outputDirectory), data);
      report.generated.push(item.audioPath);
    } catch (error) {
      report.failures.push({
        audioPath: item.audioPath,
        symbol: item.symbol,
        error: error instanceof Error ? error.message : String(error)
      });
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
