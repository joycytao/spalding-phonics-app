import test from 'node:test';
import assert from 'node:assert/strict';
import { advance, advanceExamDecision, chooseSpellingWord, createSession, createSpellingSession, getPracticeNavigationAction, getReviewPracticeNavigationAction, orderedSelection, recordExamDecision } from '../src/session.js';

const phonograms = [
  { id: 1, symbol: 'a' },
  { id: 2, symbol: 'b' },
  { id: 3, symbol: 'sh' }
];

test('orders a custom selection by curriculum number', () => {
  assert.deepEqual(orderedSelection([3, 1], phonograms).map((item) => item.id), [1, 3]);
});

test('avoids the immediately previous spelling word when alternatives exist', () => {
  assert.equal(chooseSpellingWord(['cat', 'cot'], 'cat', () => 0), 'cot');
  assert.equal(chooseSpellingWord(['cat'], 'cat', () => 0), 'cat');
});

test('creates spelling prompts from approved words and safe missing-data items', () => {
  const catalog = { phonograms: [
    { id: 1, reviewStatus: 'approved', words: ['apple', 'apron'] },
    { id: 2, reviewStatus: 'pending_review', words: ['bat', 'boat'] }
  ] };
  const session = createSpellingSession([1, 2], phonograms, catalog, () => 0);
  assert.equal(session.mode, 'spelling-test');
  assert.equal(session.items[0].word, 'apple');
  assert.equal(session.items[0].audioPath, 'audio/words/01-a-apple.mp3');
  assert.equal(session.items[1].word, null);
  assert.equal(session.items[1].audioPath, null);
});

test('does not advance past the final phonogram', () => {
  const session = createSession([3], phonograms, 'practice');
  assert.equal(advance(session).index, 0);
  assert.equal(advance(session).isComplete, true);
});

test('uses Finish on the final single-letter Practice card', () => {
  const phonograms = [{ id: 26, symbol: 'z' }];
  const session = createSession([26], phonograms, 'practice');
  assert.equal(getPracticeNavigationAction(session), 'finish');
});

test('uses Finish on the final multi-letter Practice card', () => {
  const phonograms = [{ id: 69, symbol: 'ce' }, { id: 70, symbol: 'ci' }];
  const session = createSession([69, 70], phonograms, 'practice');
  assert.equal(getPracticeNavigationAction({ ...session, index: 1 }), 'finish');
});

test('keeps Next for non-final and review-practice cards', () => {
  const phonograms = [{ id: 26, symbol: 'z' }, { id: 70, symbol: 'ci' }];
  assert.equal(getPracticeNavigationAction(createSession([26, 70], phonograms, 'practice')), 'next');
  assert.equal(getPracticeNavigationAction(createSession([70], phonograms, 'review-practice')), 'next');
});

test('uses Finish on the final Review Practice card', () => {
  const session = createSession([1], phonograms, 'review-practice');
  assert.equal(getReviewPracticeNavigationAction(session), 'finish');
});

test('adds correct answer to an exam score', () => {
  const session = createSession([1], phonograms, 'exam');
  assert.deepEqual(recordExamDecision(session, true).score, { correct: 1, total: 1 });
});

test('records an incorrect phonogram for review', () => {
  const session = createSession([2], phonograms, 'exam');
  assert.deepEqual(recordExamDecision(session, false).incorrectIds, [2]);
});

test('advances immediately after an incorrect exam decision', () => {
  const session = createSession([1, 2], phonograms, 'exam');
  const next = advanceExamDecision(session, false);
  assert.equal(next.index, 1);
  assert.deepEqual(next.incorrectIds, [1]);
  assert.deepEqual(next.score, { correct: 0, total: 1 });
});

test('completes the exam immediately after the final decision', () => {
  const session = createSession([1], phonograms, 'exam');
  const next = advanceExamDecision(session, true);
  assert.equal(next.isComplete, true);
  assert.deepEqual(next.score, { correct: 1, total: 1 });
});
