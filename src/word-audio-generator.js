import { access, mkdir, writeFile } from 'node:fs/promises';
import { createGenerationRequest } from './voicebox-request.js';
import { getWordAudioPath } from './word-lists.js';
import { PRODUCTION_ENGINE, PRODUCTION_PROFILE_ID, PRODUCTION_PROFILE_NAME, DEFAULT_NARRATION_INSTRUCT, DEFAULT_VOICEBOX_URL, createRenderManifestEntry, upsertRenderManifest, writeRenderManifest } from './audio-generator.js';

function outputPathFor(item, outputDirectory) {
  return outputDirectory
    ? `${outputDirectory.replace(/\/?$/, '/').replace(/\/\/$/, '/')}${item.audioPath.replace(/^audio\//, '')}`
    : item.audioPath;
}

export function createApprovedWordAudioPlan(catalog, profileId = PRODUCTION_PROFILE_ID) {
  return catalog.phonograms
    .filter((entry) => entry.reviewStatus === 'approved')
    .flatMap((entry) => entry.words.map((word) => ({
      id: entry.id,
      symbol: entry.symbol,
      word,
      text: word,
      profileId,
      audioPath: getWordAudioPath(entry, word)
    })));
}

export function validateWordAudioAssets(plan, assetPaths) {
  const expected = new Set(plan.map(({ audioPath }) => audioPath));
  const seen = new Set();
  for (const path of assetPaths) {
    if (seen.has(path)) throw new Error(`duplicate word audio asset: ${path}`);
    seen.add(path);
    if (!expected.has(path)) throw new Error(`orphan word audio asset: ${path}`);
  }
  for (const path of expected) {
    if (!seen.has(path)) throw new Error(`missing word audio asset: ${path}`);
  }
  return true;
}

async function requestJson(fetchImpl, url, options, description) {
  const response = await fetchImpl(url, options);
  if (!response.ok) throw new Error(`${description}: ${response.status} ${response.statusText ?? ''}`.trim());
  return response.json();
}

export async function runApprovedWordAudioBatch({
  catalog,
  baseUrl = DEFAULT_VOICEBOX_URL,
  profileId = PRODUCTION_PROFILE_ID,
  fetchImpl = fetch,
  mkdirImpl = mkdir,
  writeFileImpl = writeFile,
  existingMetadata = [],
  manifestEntries = existingMetadata,
  manifestWriter = async () => {},
  now = () => new Date().toISOString(),
  outputDirectory = ''
} = {}) {
  const plan = createApprovedWordAudioPlan(catalog, profileId);
  const metadataByPath = new Map(existingMetadata.map((metadata) => [metadata.outputPath ?? metadata.audioPath, metadata]));
  let manifest = [...manifestEntries];
  await mkdirImpl(outputDirectory, { recursive: true });
  const report = { generated: [], skipped: [], failures: [] };
  const saveManifestEntry = async (entry) => {
    manifest = upsertRenderManifest(manifest, entry);
    await manifestWriter(manifest);
  };

  for (const item of plan) {
    const current = metadataByPath.get(item.audioPath);
    if (current?.transcriptVersion === `${item.id}:${item.text}` && current.profileId === profileId && current.outputPath === item.audioPath && current.status === 'completed' && await access(outputPathFor(item, outputDirectory)).then(() => true, () => false)) {
      report.skipped.push(item.audioPath);
      continue;
    }
    let generation = {};
    try {
      generation = await requestJson(fetchImpl, `${baseUrl}/generate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(createGenerationRequest(profileId, item.text, PRODUCTION_ENGINE, DEFAULT_NARRATION_INSTRUCT))
      }, `Voicebox failed for ${item.word}`);
      let status = generation.status;
      while (!['completed', 'failed'].includes(status)) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const history = await requestJson(fetchImpl, `${baseUrl}/history/${generation.id}`, undefined, `Voicebox could not read generation ${generation.id}`);
        generation = { ...generation, ...history };
        status = history.status;
      }
      if (status === 'failed') throw new Error(`Voicebox generation failed for ${item.word}.`);
      const audioResponse = await fetchImpl(`${baseUrl}/audio/${generation.id}`);
      if (!audioResponse.ok) throw new Error(`Voicebox could not download audio for ${item.word}.`);
      await writeFileImpl(outputPathFor(item, outputDirectory), new Uint8Array(await audioResponse.arrayBuffer()));
      report.generated.push(item.audioPath);
      await saveManifestEntry(createRenderManifestEntry({
        transcript: { ...item, ttsText: item.text, audioPath: item.audioPath },
        generation,
        status: 'completed',
        timestamp: now(),
        profileId,
        profileName: PRODUCTION_PROFILE_NAME
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      report.failures.push({ audioPath: item.audioPath, word: item.word, error: message });
      await saveManifestEntry(createRenderManifestEntry({
        transcript: { ...item, ttsText: item.text, audioPath: item.audioPath },
        generation,
        status: 'failed',
        timestamp: now(),
        profileId,
        profileName: PRODUCTION_PROFILE_NAME,
        error: message
      }));
    }
  }
  return report;
}
