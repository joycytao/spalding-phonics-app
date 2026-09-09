import test from 'node:test';
import assert from 'node:assert/strict';
import wordListCatalog from '../data/phonogram-word-lists.json' with { type: 'json' };
import { validateWordListCatalog } from '../src/word-lists.js';

test('contains a validated second-grade word list for every phonogram 1 through 70', () => {
  const validated = validateWordListCatalog(wordListCatalog);

  assert.equal(validated.gradeLevel, 2);
  assert.equal(validated.minimumWordsPerPhonogram, 8);
  assert.equal(validated.phonograms.length, 70);
  assert.deepEqual(validated.phonograms.map((entry) => entry.id), Array.from({ length: 70 }, (_, index) => index + 1));

  for (const entry of validated.phonograms) {
    assert.equal(entry.words.length >= 8, true, `${entry.symbol} needs at least 8 words`);
    assert.equal(entry.reviewStatus, 'pending_review');
    assert.equal(new Set(entry.words).size, entry.words.length, `${entry.symbol} contains duplicate words`);
  }
});

test('rejects malformed or incorrectly mapped word-list entries', () => {
  assert.throws(
    () => validateWordListCatalog({ ...wordListCatalog, phonograms: wordListCatalog.phonograms.slice(0, 69) }),
    /exactly 70/
  );

  const malformed = structuredClone(wordListCatalog);
  malformed.phonograms[0].words[0] = 'week';
  assert.throws(() => validateWordListCatalog(malformed), /does not contain phonogram/);
});
