import { readFile } from 'node:fs/promises';
import { runApprovedAudioBatch, PRODUCTION_PROFILE_ID, DEFAULT_VOICEBOX_URL } from '../src/audio-generator.js';

const outputDirectory = new URL('../audio/', import.meta.url).pathname;
let existingMetadata = [];
try {
  const manifest = JSON.parse(await readFile(new URL('../audio/render-manifest.json', import.meta.url), 'utf8'));
  existingMetadata = Array.isArray(manifest) ? manifest : manifest.entries ?? [];
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const report = await runApprovedAudioBatch({
  baseUrl: process.env.VOICEBOX_URL ?? DEFAULT_VOICEBOX_URL,
  profileId: process.env.VOICEBOX_PROFILE_ID ?? PRODUCTION_PROFILE_ID,
  outputDirectory,
  existingMetadata
});

for (const audioPath of report.generated) console.log(`Generated ${audioPath}`);
for (const audioPath of report.skipped) console.log(`Skipped current ${audioPath}`);
for (const failure of report.failures) console.error(`Failed ${failure.audioPath}: ${failure.error}`);
if (report.failures.length > 0) process.exitCode = 1;
