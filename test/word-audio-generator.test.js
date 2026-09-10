import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createApprovedWordAudioPlan,
  validateWordAudioAssets,
  runApprovedWordAudioBatch
} from '../src/word-audio-generator.js';

const catalog = {
  phonograms: [
    { id: 1, symbol: 'a', reviewStatus: 'approved', words: ['apple', 'apron'] },
    { id: 2, symbol: 'b', reviewStatus: 'pending_review', words: ['bat', 'baby'] }
  ]
};

test('plans deterministic audio paths only for approved word-list entries', () => {
  assert.deepEqual(createApprovedWordAudioPlan(catalog), [
    { id: 1, symbol: 'a', word: 'apple', text: 'apple', profileId: 'a07dbe47-2f91-4c2b-88df-0551bdaebc99', audioPath: 'audio/words/01-a-apple.mp3' },
    { id: 1, symbol: 'a', word: 'apron', text: 'apron', profileId: 'a07dbe47-2f91-4c2b-88df-0551bdaebc99', audioPath: 'audio/words/01-a-apron.mp3' }
  ]);
});

test('rejects missing, duplicate, and orphaned word audio assets', () => {
  const plan = createApprovedWordAudioPlan(catalog);
  assert.throws(() => validateWordAudioAssets(plan, ['audio/words/01-a-apple.mp3']), /missing/);
  assert.throws(() => validateWordAudioAssets(plan, [
    'audio/words/01-a-apple.mp3',
    'audio/words/01-a-apron.mp3',
    'audio/words/01-a-apron.mp3'
  ]), /duplicate/);
  assert.throws(() => validateWordAudioAssets(plan, [
    'audio/words/01-a-apple.mp3',
    'audio/words/01-a-apron.mp3',
    'audio/words/99-extra.mp3'
  ]), /orphan/);
});

test('generates approved word audio with the word as Voicebox text', async () => {
  const writes = [];
  const fetchImpl = async (url, options) => {
    if (url.endsWith('/generate')) {
      const body = JSON.parse(options.body);
      return { ok: true, json: async () => ({ id: body.text, status: 'completed', model: 'qwen' }) };
    }
    if (url.includes('/audio/')) return { ok: true, arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer };
    throw new Error(`Unexpected URL: ${url}`);
  };

  const report = await runApprovedWordAudioBatch({
    catalog,
    fetchImpl,
    mkdirImpl: async () => {},
    writeFileImpl: async (path, data) => writes.push({ path, data: [...data] }),
    outputDirectory: '/audio/'
  });

  assert.deepEqual(report.generated, ['audio/words/01-a-apple.mp3', 'audio/words/01-a-apron.mp3']);
  assert.deepEqual(writes, [
    { path: '/audio/words/01-a-apple.mp3', data: [1, 2, 3] },
    { path: '/audio/words/01-a-apron.mp3', data: [1, 2, 3] }
  ]);
});
