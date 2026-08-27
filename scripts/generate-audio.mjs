import { mkdir, writeFile } from 'node:fs/promises';
import { phonograms } from '../src/phonograms.js';
import { createPhonogramGenerationRequest } from '../src/voicebox-request.js';

const baseUrl = process.env.VOICEBOX_URL ?? 'http://127.0.0.1:17493';
const profileId = process.env.VOICEBOX_PROFILE_ID;
const outputDirectory = new URL('../audio/', import.meta.url);

if (!profileId) {
  throw new Error('Set VOICEBOX_PROFILE_ID to the Voicebox profile that should narrate the phonograms.');
}

await mkdir(outputDirectory, { recursive: true });

for (const item of phonograms) {
  const response = await fetch(`${baseUrl}/generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(createPhonogramGenerationRequest(profileId, item))
  });

  if (!response.ok) {
    throw new Error(`Voicebox failed for ${item.symbol}: ${response.status} ${response.statusText}`);
  }

  const generation = await response.json();
  let status = generation.status;
  while (!['completed', 'failed'].includes(status)) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const poll = await fetch(`${baseUrl}/history/${generation.id}`);
    if (!poll.ok) throw new Error(`Voicebox could not read generation ${generation.id}.`);
    status = (await poll.json()).status;
  }
  if (status === 'failed') throw new Error(`Voicebox generation failed for ${item.symbol}.`);

  const audioResponse = await fetch(`${baseUrl}/audio/${generation.id}`);
  if (!audioResponse.ok) throw new Error(`Voicebox could not download audio for ${item.symbol}.`);
  const data = await audioResponse.arrayBuffer();
  await writeFile(new URL(`../${item.audioPath}`, import.meta.url), new Uint8Array(data));
  console.log(`Generated ${item.audioPath}`);
}
