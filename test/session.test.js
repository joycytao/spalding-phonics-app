import test from 'node:test';
import assert from 'node:assert/strict';
import { advance, createSession, orderedSelection, recordExamDecision } from '../src/session.js';

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

test('adds correct answer to an exam score', () => {
  const session = createSession([1], phonograms, 'exam');
  assert.deepEqual(recordExamDecision(session, true).score, { correct: 1, total: 1 });
});

test('records an incorrect phonogram for review', () => {
  const session = createSession([2], phonograms, 'exam');
  assert.deepEqual(recordExamDecision(session, false).incorrectIds, [2]);
});
