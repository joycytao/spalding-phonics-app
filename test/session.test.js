import test from 'node:test';
import assert from 'node:assert/strict';
import { advance, createSession, getPracticeNavigationAction, getReviewPracticeNavigationAction, orderedSelection, recordExamDecision } from '../src/session.js';

const phonograms = [
  { id: 1, symbol: 'a' },
  { id: 2, symbol: 'b' },
  { id: 3, symbol: 'sh' }
];

test('orders a custom selection by curriculum number', () => {
  assert.deepEqual(orderedSelection([3, 1], phonograms).map((item) => item.id), [1, 3]);
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
