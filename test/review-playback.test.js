import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRACTICE_AUTOPLAY_DELAY_MS,
  schedulePracticePlayback,
  shouldAutoPlayForMode,
  shouldShowPracticePlaybackControl
} from '../src/practice-playback.js';

test('Review Practice uses the one-second auto-play delay', () => {
  assert.equal(PRACTICE_AUTOPLAY_DELAY_MS, 1000);
  assert.equal(shouldAutoPlayForMode('review-practice'), true);
});

test('cancels scheduled Review Practice playback when leaving a card', async () => {
  let calls = 0;
  const cancel = schedulePracticePlayback(() => { calls += 1; }, { delay: 10 });
  cancel();

  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(calls, 0);
});

test('shows Review playback control only after playback completes or fails', () => {
  assert.equal(shouldShowPracticePlaybackControl('idle'), false);
  assert.equal(shouldShowPracticePlaybackControl('playing'), false);
  assert.equal(shouldShowPracticePlaybackControl('complete'), true);
  assert.equal(shouldShowPracticePlaybackControl('failed'), true);
});
