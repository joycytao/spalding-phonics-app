import { readFile, writeFile } from 'node:fs/promises';
import { createCrossCategoryPilotReview, selectCrossCategoryPilotTranscripts } from '../src/cross-category-pilot.js';
import { DEFAULT_VOICEBOX_URL, PRODUCTION_PROFILE_ID, runApprovedAudioBatch, writeRenderManifest } from '../src/audio-generator.js';

const baseUrl = process.env.VOICEBOX_URL ?? DEFAULT_VOICEBOX_URL;
const outputDirectory = new URL('../audio/', import.meta.url).pathname;
const manifestUrl = new URL('../audio/render-manifest.json', import.meta.url);
const reviewUrl = new URL('../data/cross-category-pilot-review.json', import.meta.url);
let existingMetadata = [];

try {
  const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
  existingMetadata = Array.isArray(manifest) ? manifest : manifest.entries ?? [];
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const transcripts = selectCrossCategoryPilotTranscripts();
const report = await runApprovedAudioBatch({
  transcripts,
  baseUrl,
  profileId: process.env.VOICEBOX_PROFILE_ID ?? PRODUCTION_PROFILE_ID,
  outputDirectory,
  existingMetadata,
  manifestEntries: existingMetadata,
  manifestWriter: (entries) => writeRenderManifest(manifestUrl.pathname, entries)
});

let latestManifest = existingMetadata;
try {
  const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
  latestManifest = Array.isArray(manifest) ? manifest : manifest.entries ?? [];
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

await writeFile(reviewUrl, `${JSON.stringify(createCrossCategoryPilotReview({ transcripts, manifestEntries: latestManifest }), null, 2)}\n`);
for (const audioPath of report.generated) console.log(`Generated cross-category pilot ${audioPath}`);
for (const audioPath of report.skipped) console.log(`Skipped current cross-category pilot ${audioPath}`);
for (const failure of report.failures) console.error(`Pilot failed ${failure.audioPath}: ${failure.error}`);
if (report.failures.length > 0) process.exitCode = 1;
