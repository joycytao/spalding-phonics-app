import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRODUCTION_PROFILE_ID,
  createApprovedAudioPlan,
  generateApprovedAudio,
  runApprovedAudioBatch
} from '../src/audio-generator.js';

test('skips an approved row when its transcript metadata and output are current', async () => {
  const requests = [];
  const report = await runApprovedAudioBatch({
    transcripts: [{ id: 1, symbol: 'a', reviewStatus: 'approved', ttsText: 'A.', audioPath: 'audio/01-a.mp3' }],
    existingMetadata: [{
      transcriptVersion: '1:A.',
      profileId: PRODUCTION_PROFILE_ID,
      audioPath: 'audio/01-a.mp3',
      status: 'completed'
    }],
    fileExistsImpl: async () => true,
    fetchImpl: async (url) => {
      requests.push(url);
      throw new Error('Voicebox should not be called for current output');
    },
    mkdirImpl: async () => {}
  });

  assert.deepEqual(report, {
    generated: [],
    skipped: ['audio/01-a.mp3'],
    failures: []
  });
  assert.deepEqual(requests, []);
});

test('continues after a failed row and reports an actionable per-item error', async () => {
  const report = await runApprovedAudioBatch({
    transcripts: [
      { id: 1, symbol: 'a', reviewStatus: 'approved', ttsText: 'A.', audioPath: 'audio/01-a.mp3' },
      { id: 2, symbol: 'b', reviewStatus: 'approved', ttsText: 'B.', audioPath: 'audio/02-b.mp3' }
    ],
    fetchImpl: async (url) => {
      if (url.endsWith('/generate')) return { ok: false, status: 503, statusText: 'Unavailable' };
      throw new Error(`Unexpected URL: ${url}`);
    },
    mkdirImpl: async () => {}
  });

  assert.deepEqual(report.generated, []);
  assert.deepEqual(report.skipped, []);
  assert.deepEqual(report.failures, [
    { audioPath: 'audio/01-a.mp3', symbol: 'a', error: 'Voicebox failed for a: 503 Unavailable' },
    { audioPath: 'audio/02-b.mp3', symbol: 'b', error: 'Voicebox failed for b: 503 Unavailable' }
  ]);
});

test('plans generation only for approved transcript rows and keeps their audio paths', () => {
  const plan = createApprovedAudioPlan([
    { id: 2, symbol: 'c', reviewStatus: 'pending_approval', ttsText: 'C.', audioPath: 'audio/02-c.mp3' },
    { id: 1, symbol: 'a', reviewStatus: 'approved', ttsText: 'A.', audioPath: 'audio/01-a.mp3' }
  ]);

  assert.deepEqual(plan, [{
    id: 1,
    symbol: 'a',
    text: 'A.',
    profileId: PRODUCTION_PROFILE_ID,
    audioPath: 'audio/01-a.mp3'
  }]);
});

test('generates approved rows with the production profile and fixed transcript paths', async () => {
  const requests = [];
  const writes = [];
  const statuses = new Map();
  const fetchImpl = async (url, options) => {
    requests.push({ url, options });
    if (url.endsWith('/generate')) {
      const body = JSON.parse(options.body);
      statuses.set(body.text, 'completed');
      return { ok: true, json: async () => ({ id: body.text }) };
    }
    if (url.includes('/history/')) return { ok: true, json: async () => ({ status: statuses.get(url.split('/').pop()) }) };
    if (url.includes('/audio/')) return { ok: true, arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer };
    throw new Error(`Unexpected URL: ${url}`);
  };

  const generated = await generateApprovedAudio({
    transcripts: [
      { id: 1, symbol: 'a', reviewStatus: 'approved', ttsText: 'A.', audioPath: 'audio/01-a.mp3' },
      { id: 2, symbol: 'c', reviewStatus: 'pending_approval', ttsText: 'C.', audioPath: 'audio/02-c.mp3' }
    ],
    fetchImpl,
    writeFileImpl: async (path, data) => writes.push({ path, data: [...data] }),
    mkdirImpl: async () => {}
  });

  assert.deepEqual(generated, ['audio/01-a.mp3']);
  assert.equal(requests.filter(({ url }) => url.endsWith('/generate')).length, 1);
  assert.deepEqual(JSON.parse(requests[0].options.body), {
    profile_id: PRODUCTION_PROFILE_ID,
    text: 'A.',
    language: 'en'
  });
  assert.deepEqual(writes, [{ path: 'audio/01-a.mp3', data: [1, 2, 3] }]);
});
