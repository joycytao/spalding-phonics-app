import { readFile } from 'node:fs/promises';
import { runApprovedWordAudioBatch } from '../src/word-audio-generator.js';
import { DEFAULT_VOICEBOX_URL, PRODUCTION_PROFILE_ID } from '../src/audio-generator.js';

const catalog = JSON.parse(await readFile(new URL('../data/phonogram-word-lists.json', import.meta.url), 'utf8'));
const outputDirectory = new URL('../audio/', import.meta.url).pathname;
const manifestPath = new URL('../audio/word-audio-manifest.json', import.meta.url).pathname;
let existingMetadata = [];
try {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  existingMetadata = Array.isArray(manifest) ? manifest : manifest.entries ?? [];
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const report = await runApprovedWordAudioBatch({
  catalog,
  baseUrl: process.env.VOICEBOX_URL ?? DEFAULT_VOICEBOX_URL,
  profileId: process.env.VOICEBOX_PROFILE_ID ?? PRODUCTION_PROFILE_ID,
  outputDirectory,
  existingMetadata,
  manifestEntries: existingMetadata,
  manifestWriter: async (entries) => {
    const { writeFile } = await import('node:fs/promises');
    await writeFile(manifestPath, `${JSON.stringify(entries, null, 2)}\n`);
  }
});

for (const path of report.generated) console.log(`Generated ${path}`);
for (const path of report.skipped) console.log(`Skipped current ${path}`);
for (const failure of report.failures) console.error(`Failed ${failure.audioPath}: ${failure.error}`);
if (report.failures.length > 0) process.exitCode = 1;
