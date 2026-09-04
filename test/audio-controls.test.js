import test from 'node:test';
import assert from 'node:assert/strict';
import { isExamCheckDisabled, isPracticeNextDisabled } from '../src/audio-controls.js';

test('Practice Next is enabled before playback starts', () => {
  assert.equal(isPracticeNextDisabled('idle'), false);
});

test('Practice Next is disabled while playback is active', () => {
  assert.equal(isPracticeNextDisabled('playing'), true);
});

test('Practice Next is enabled after playback completes', () => {
  assert.equal(isPracticeNextDisabled('complete'), false);
});

test('Practice Next is enabled after playback fails so the learner can continue', () => {
  assert.equal(isPracticeNextDisabled('failed'), false);
});

test('Exam Check is disabled before playback starts', () => {
  assert.equal(isExamCheckDisabled('idle'), true);
});

test('Exam Check is disabled while playback is active', () => {
  assert.equal(isExamCheckDisabled('playing'), true);
});

test('Exam Check is enabled after playback completes', () => {
  assert.equal(isExamCheckDisabled('complete'), false);
});

test('Exam Check remains disabled after playback fails', () => {
  assert.equal(isExamCheckDisabled('failed'), true);
});
