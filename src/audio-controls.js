export function isPracticeNextDisabled(audioState) {
  return audioState === 'playing';
}

export function isPlaybackButtonDisabled(audioState) {
  return audioState === 'playing';
}

export function isExamCheckDisabled(audioState) {
  return audioState !== 'complete';
}
