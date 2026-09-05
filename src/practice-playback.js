export const PRACTICE_AUTOPLAY_DELAY_MS = 1000;

export function schedulePracticePlayback(play, { delay = PRACTICE_AUTOPLAY_DELAY_MS } = {}) {
  const timer = setTimeout(play, delay);
  return () => clearTimeout(timer);
}

export function shouldShowPracticePlaybackControl(audioState) {
  return audioState === 'complete' || audioState === 'failed';
}
