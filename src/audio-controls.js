export function isPracticeNextDisabled(audioState) {
  return audioState === 'playing';
}

export function isExamCheckDisabled(audioState) {
  return audioState !== 'complete';
}
