import { mkdir, writeFile } from 'node:fs/promises';
import { phonogramTranscripts } from './phonogram-transcripts.js';
import { createPhonogramGenerationRequest } from './voicebox-request.js';

export const DEFAULT_VOICEBOX_URL = 'http://127.0.0.1:17493';
export const PRODUCTION_PROFILE_ID = 'a07dbe47-2f91-4c2b-88df-0551bdaebc99';

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

export async function generateApprovedAudio({
  transcripts = phonogramTranscripts,
  baseUrl = DEFAULT_VOICEBOX_URL,
  profileId = PRODUCTION_PROFILE_ID,
  fetchImpl = fetch,
  mkdirImpl = mkdir,
  writeFileImpl = writeFile,
  outputDirectory = ''
} = {}) {
  const plan = createApprovedAudioPlan(transcripts, profileId);
  await mkdirImpl(outputDirectory, { recursive: true });
  const generated = [];

  for (const item of plan) {
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
    const outputPath = outputDirectory
      ? `${outputDirectory.replace(/\/?$/, '/').replace(/\/\/$/, '/')}${item.audioPath.replace(/^audio\//, '')}`
      : item.audioPath;
    await writeFileImpl(outputPath, data);
    generated.push(item.audioPath);
  }

  return generated;
}
