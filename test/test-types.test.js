import test from 'node:test';
import assert from 'node:assert/strict';
import { getTestTypeSelection } from '../src/test-types.js';

const phonograms = [
  { id: 1, symbol: 'a' },
  { id: 70, symbol: 'ough' },
  { id: 71, symbol: 'extra' }
];

test('selecting WPR preserves the existing choose-a-set flow', () => {
  assert.deepEqual(getTestTypeSelection('wpr', phonograms), {
    mode: 'exam',
    screen: 'groups',
    group: null,
    selectedIds: []
  });
});

test('selecting Spelling Tests opens the supported 1-to-70 picker', () => {
  assert.deepEqual(getTestTypeSelection('spelling', phonograms), {
    mode: 'spelling-test',
    screen: 'picker',
    group: 'all',
    selectedIds: [1, 70]
  });
});
