export async function playAudio(item) {
  const audio = new Audio(item.audioPath);
  await audio.play();
}
