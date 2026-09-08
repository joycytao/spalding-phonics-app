import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRACTICE_AUTOPLAY_DELAY_MS,
  schedulePracticePlayback,
  shouldShowPracticePlaybackControl
} from '../src/practice-playback.js';

test('uses a one-second delay for Practice auto-play', () => {
  assert.equal(PRACTICE_AUTOPLAY_DELAY_MS, 1000);
});

test('schedules one Practice playback callback', async () => {
  let calls = 0;
  schedulePracticePlayback(() => { calls += 1; }, { delay: 10 });

  assert.equal(calls, 0);
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(calls, 1);
});

test('cancels scheduled Practice playback when leaving a card', async () => {
  let calls = 0;
  const cancel = schedulePracticePlayback(() => { calls += 1; }, { delay: 10 });
  cancel();

  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(calls, 0);
});

test('shows Practice playback control only after playback completes or fails', () => {
  assert.equal(shouldShowPracticePlaybackControl('idle'), false);
  assert.equal(shouldShowPracticePlaybackControl('playing'), false);
  assert.equal(shouldShowPracticePlaybackControl('complete'), true);
  assert.equal(shouldShowPracticePlaybackControl('failed'), true);
});
