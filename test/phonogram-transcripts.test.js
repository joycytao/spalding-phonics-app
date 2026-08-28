import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ALLOWED_TRANSCRIPT_STATUSES,
  phonogramTranscripts,
  validateTranscriptCatalog
} from '../src/phonogram-transcripts.js';
import { phonograms } from '../src/phonograms.js';

const transcriptSkeleton = JSON.parse(
  readFileSync(new URL('../data/phonogram-transcript.json', import.meta.url), 'utf8')
);

const expectedSkeletonSymbols = [
  'a', 'c', 'd', 'f', 'g', 'o', 's', 'qu', 'b', 'e', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  'sh', 'ee', 'th', 'ow', 'ou', 'oo', 'ch', 'ar', 'ay', 'ai', 'oy', 'oi', 'er', 'ir', 'ur', 'wor', 'ear', 'ng', 'ea', 'aw', 'au', 'or', 'ck', 'wh', 'ed', 'ew', 'ui', 'oa', 'gu', 'ph', 'ough', 'oe', 'ey', 'igh', 'kn', 'gn', 'wr', 'ie', 'dge', 'ei', 'eigh', 'ti', 'si', 'ci',
  'sci', 'our', 'eu', 'augh', 'gh', 'que', 'bu', 'lk', 'mb', 'mn', 'st', 'the', 'arr', 'err', 'ssi', 'te', 'dg'
];

test('data transcript skeleton fixes the 87-item curriculum order before narration approval', () => {
  assert.equal(transcriptSkeleton.length, 87);
  assert.deepEqual(transcriptSkeleton.map((record) => record.symbol), expectedSkeletonSymbols);
  assert.equal(new Set(transcriptSkeleton.map((record) => record.symbol)).size, 87);

  transcriptSkeleton.forEach((record, index) => {
    const id = index + 1;
    const group = index < 26 ? 'single' : index < 70 ? 'multi' : 'advanced';

    assert.equal(record.id, id);
    assert.equal(record.group, group);
    assert.equal(record.audioPath, `audio/${String(id).padStart(2, '0')}-${record.symbol}.mp3`);
    assert.equal(record.reviewStatus, 'pending_approval');
  });
});

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
  assert.equal(ew.ttsText, 'E W. Two letters. /oo/ as in grew. /yoo/ as in new. Used at the end of a word.');

  assert.equal(kn.cuePhrases.letterCount, 'two letters');
  assert.equal(kn.cuePhrases.position, 'beginning');
  assert.deepEqual(kn.examples, [{ sound: '/n/', word: 'knee' }]);
  assert.equal(kn.ttsText, 'K N. Two letters. /n/ as in knee. Beginning.');
});

test('phonograms 1 through 70 have sourced draft narration and examples', () => {
  const drafts = transcriptSkeleton.filter((item) => item.id <= 70);

  assert.equal(drafts.length, 70);
  for (const draft of drafts) {
    assert.equal(draft.reviewStatus, 'pending_approval');
    assert.ok(draft.examples.length > 0, `${draft.symbol} needs an example`);
    assert.ok(!draft.ttsText.includes('Listen for this phonogram sound.'));
    assert.match(draft.source, /^https?:\/\//);
    assert.match(draft.ttsText, new RegExp(draft.examples[0].word));
  }
});

test('published phonograms use approved ttsText as narration', () => {
  const ew = phonograms.find((item) => item.symbol === 'ew');
  const kn = phonograms.find((item) => item.symbol === 'kn');

  assert.equal(ew.narration, 'E W. Two letters. /oo/ as in grew. /yoo/ as in new. Used at the end of a word.');
  assert.equal(kn.narration, 'K N. Two letters. /n/ as in knee. Beginning.');
});

test('known narrations are migrated into the canonical transcript records', () => {
  const expected = {
    a: {
      sounds: ['/ă/', '/ā/', '/ah/'],
      examples: [
        { sound: '/ă/', word: 'apple' },
        { sound: '/ā/', word: 'apron' },
        { sound: '/ah/', word: 'father' }
      ]
    },
    th: {
      sounds: ['/th/', '/th/'],
      examples: [
        { sound: '/th/', word: 'thin' },
        { sound: '/th/', word: 'this' }
      ]
    },
    oo: {
      sounds: ['/oo/', '/oo/'],
      examples: [
        { sound: '/oo/', word: 'moon' },
        { sound: '/oo/', word: 'book' }
      ]
    },
    ew: {
      sounds: ['/oo/', '/yoo/'],
      examples: [
        { sound: '/oo/', word: 'grew' },
        { sound: '/yoo/', word: 'new' }
      ]
    },
    ui: {
      sounds: ['/oo/', '/yoo/'],
      examples: [
        { sound: '/oo/', word: 'fruit' },
        { sound: '/yoo/', word: 'suit' }
      ]
    },
    ough: {
      sounds: ['/ō/', '/oo/', '/ŭf/', '/ŏf/', '/aw/', '/ow/'],
      examples: [
        { sound: '/ō/', word: 'though' },
        { sound: '/oo/', word: 'through' },
        { sound: '/ŭf/', word: 'rough' },
        { sound: '/ŏf/', word: 'cough' },
        { sound: '/aw/', word: 'thought' },
        { sound: '/ow/', word: 'bough' }
      ]
    },
    wr: {
      sounds: ['/r/'],
      examples: [{ sound: '/r/', word: 'write' }]
    }
  };

  for (const [symbol, details] of Object.entries(expected)) {
    const transcript = phonogramTranscripts.find((item) => item.symbol === symbol);
    assert.deepEqual(transcript.cuePhrases.sounds, details.sounds);
    assert.deepEqual(transcript.examples, details.examples);
    assert.equal(transcript.reviewStatus, 'pending_approval');
    assert.doesNotMatch(transcript.ttsText, /Listen for this phonogram sound/);
  }
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

test('validateTranscriptCatalog rejects duplicate symbols and unstable ordering', () => {
  const [first, second] = transcriptSkeleton;

  assert.throws(
    () => validateTranscriptCatalog([
      { ...first, id: 1, audioPath: 'audio/01-a.mp3' },
      { ...second, id: 2, symbol: first.symbol, audioPath: 'audio/02-a.mp3' }
    ]),
    /Transcript 2 duplicates symbol "a"/
  );

  assert.throws(
    () => validateTranscriptCatalog([{ ...first, id: 2 }]),
    /Transcript at position 1 must use id 1/
  );

  assert.throws(
    () => validateTranscriptCatalog([{ ...first, audioPath: 'audio/a.mp3' }]),
    /Transcript 1 audioPath must be "audio\/01-a\.mp3"/
  );
});
