import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALLOWED_TRANSCRIPT_STATUSES,
  phonogramTranscripts,
  validateTranscriptCatalog
} from '../src/phonogram-transcripts.js';
import { phonograms } from '../src/phonograms.js';

test('phonogram transcripts expose the required audio review contract', () => {
  assert.deepEqual(ALLOWED_TRANSCRIPT_STATUSES, [
    'pending_approval',
    'approved',
    'needs_revision',
    'blocked'
  ]);
  assert.equal(phonogramTranscripts.length, 87);

  for (const transcript of phonogramTranscripts) {
    assert.equal(typeof transcript.id, 'number');
    assert.equal(typeof transcript.symbol, 'string');
    assert.match(transcript.group, /^(single|multi|advanced)$/);
    assert.equal(typeof transcript.cuePhrases, 'object');
    assert.ok(Array.isArray(transcript.examples));
    assert.equal(typeof transcript.ttsText, 'string');
    assert.equal(typeof transcript.source, 'string');
    assert.match(transcript.reviewStatus, /^(pending_approval|approved|needs_revision|blocked)$/);
    assert.match(transcript.audioPath, /^audio\/\d{2}-.+\.mp3$/);
  }
});

test('ew and kn transcripts keep cues separate from approved Voicebox text', () => {
  const ew = phonogramTranscripts.find((item) => item.symbol === 'ew');
  const kn = phonogramTranscripts.find((item) => item.symbol === 'kn');

  assert.deepEqual(ew.cuePhrases.sounds, ['/oo/', '/yoo/']);
  assert.deepEqual(ew.examples, [
    { sound: '/oo/', word: 'grew' },
    { sound: '/yoo/', word: 'new' }
  ]);
  assert.equal(ew.ttsText, 'E W. Two letters. /oo/ as in grew. /yoo/ as in new.');

  assert.equal(kn.cuePhrases.letterCount, 'two letters');
  assert.equal(kn.cuePhrases.position, 'beginning');
  assert.deepEqual(kn.examples, [{ sound: '/n/', word: 'knee' }]);
  assert.equal(kn.ttsText, 'K N. Two letters. /n/ as in knee. Beginning.');
});

test('published phonograms use approved ttsText as narration', () => {
  const ew = phonograms.find((item) => item.symbol === 'ew');
  const kn = phonograms.find((item) => item.symbol === 'kn');

  assert.equal(ew.narration, 'E W. Two letters. /oo/ as in grew. /yoo/ as in new.');
  assert.equal(kn.narration, 'K N. Two letters. /n/ as in knee. Beginning.');
});

test('validateTranscriptCatalog rejects missing required fields and invalid statuses', () => {
  const invalid = [{
    id: 1,
    symbol: 'a',
    group: 'single',
    cuePhrases: {},
    ttsText: 'A.',
    examples: [],
    source: 'https://example.com',
    reviewStatus: 'waiting',
    audioPath: 'audio/01-a.mp3'
  }];

  assert.throws(
    () => validateTranscriptCatalog(invalid),
    /Transcript 1 uses unsupported reviewStatus "waiting"/
  );

  assert.throws(
    () => validateTranscriptCatalog([{ ...invalid[0], reviewStatus: 'approved', ttsText: '' }]),
    /Transcript 1 is missing required field "ttsText"/
  );
});
