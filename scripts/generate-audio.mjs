import { generateApprovedAudio, PRODUCTION_PROFILE_ID, DEFAULT_VOICEBOX_URL } from '../src/audio-generator.js';

const generated = await generateApprovedAudio({
  baseUrl: process.env.VOICEBOX_URL ?? DEFAULT_VOICEBOX_URL,
  profileId: process.env.VOICEBOX_PROFILE_ID ?? PRODUCTION_PROFILE_ID,
  outputDirectory: new URL('../audio/', import.meta.url).pathname
});

for (const audioPath of generated) console.log(`Generated ${audioPath}`);
