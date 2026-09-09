import test from 'node:test';
import assert from 'node:assert/strict';
import { groups, phonograms } from '../src/phonograms.js';

test('exposes only supported phonogram ranges in Choose a set', () => {
  assert.deepEqual(groups.map(({ id, label }) => ({ id, label })), [
    { id: 'single', label: 'Phonograms 1 to 26' },
    { id: 'multi', label: 'Phonograms 27 to 70' },
    { id: 'all', label: 'Phonograms 1 to 70' }
  ]);
});

test('keeps the supported all-range selection within phonograms 1 through 70', () => {
  const supported = phonograms.filter((item) => item.id <= 70);

  assert.equal(supported.length, 70);
  assert.equal(Math.max(...supported.map((item) => item.id)), 70);
});
