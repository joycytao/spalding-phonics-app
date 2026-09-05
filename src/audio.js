export function playAudio(item, {
  AudioClass = globalThis.Audio,
  onStart = () => {}
} = {}) {
  const audio = new AudioClass(item.audioPath);

  return new Promise((resolve, reject) => {
    const finish = () => {
      audio.removeEventListener('ended', finish);
      audio.removeEventListener('error', fail);
      resolve();
    };
    const fail = () => {
      audio.removeEventListener('ended', finish);
      audio.removeEventListener('error', fail);
      reject(new Error(`Audio playback failed for ${item.audioPath}`));
    };

    audio.addEventListener('ended', finish);
    audio.addEventListener('error', fail);
    Promise.resolve(audio.play()).then(onStart).catch(fail);
  });
}
