import test from 'node:test';
import assert from 'node:assert/strict';
import { createProgressStore } from '../src/progress-store.js';

function memoryStorage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test('does not duplicate an incorrect phonogram in the review queue', () => {
  const store = createProgressStore(memoryStorage());
  store.recordIncorrect(52);
  store.recordIncorrect(52);
  assert.deepEqual(store.getReviewQueue(), [52]);
});

test('removes a correctly answered review phonogram', () => {
  const store = createProgressStore(memoryStorage());
  store.recordIncorrect(52);
  store.removeReviewedCorrect(52);
  assert.deepEqual(store.getReviewQueue(), []);
});
