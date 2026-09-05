let activePlayback = null;

function releasePlayback(playback) {
  if (activePlayback !== playback) return;
  activePlayback = null;
  playback.audio.removeEventListener('ended', playback.finish);
  playback.audio.removeEventListener('error', playback.fail);
}

export function playAudio(item, {
  AudioClass = globalThis.Audio,
  onStart = () => {}
} = {}) {
  if (activePlayback) return activePlayback.promise;

  const audio = new AudioClass(item.audioPath);
  let resolvePromise;
  let rejectPromise;
  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
  const playback = {
    audio,
    promise,
    finish: null,
    fail: null,
    resolve: resolvePromise,
    reject: rejectPromise
  };
  playback.finish = () => {
    releasePlayback(playback);
    playback.resolve();
  };
  playback.fail = () => {
    releasePlayback(playback);
    playback.reject(new Error(`Audio playback failed for ${item.audioPath}`));
  };

  // Set the lock before calling play() so a synchronous or same-turn second
  // request cannot create another Audio instance.
  activePlayback = playback;
  audio.addEventListener('ended', playback.finish);
  audio.addEventListener('error', playback.fail);
  try {
    Promise.resolve(audio.play()).then(onStart).catch(playback.fail);
  } catch (error) {
    playback.fail(error);
  }
  return promise;
}

export function isAudioPlaying() {
  return Boolean(activePlayback);
}

export function stopAudio() {
  if (!activePlayback) return;
  const playback = activePlayback;
  playback.audio.pause();
  releasePlayback(playback);
  playback.reject(new Error('Audio playback was cancelled.'));
}
