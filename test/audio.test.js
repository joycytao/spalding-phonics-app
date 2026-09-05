import test from 'node:test';
import assert from 'node:assert/strict';
import { playAudio } from '../src/audio.js';

class FakeAudio {
  static instances = [];

  constructor(path) {
    this.path = path;
    this.listeners = new Map();
    this.playCalls = 0;
    FakeAudio.instances.push(this);
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  removeEventListener(type) {
    this.listeners.delete(type);
  }

  play() {
    this.playCalls += 1;
    return Promise.resolve();
  }

  emit(type) {
    this.listeners.get(type)?.();
  }
}

test('resolves only after audio playback ends and reports when playback starts', async () => {
  const lifecycle = [];
  const playback = playAudio(
    { audioPath: 'audio/01-a.mp3' },
    { AudioClass: FakeAudio, onStart: () => lifecycle.push('start') }
  );

  await Promise.resolve();
  const audio = FakeAudio.instances.at(-1);
  assert.equal(audio.path, 'audio/01-a.mp3');
  assert.equal(audio.playCalls, 1);
  assert.deepEqual(lifecycle, ['start']);

  let ended = false;
  playback.then(() => { ended = true; });
  await Promise.resolve();
  assert.equal(ended, false);

  audio.emit('ended');
  await playback;
  assert.equal(ended, true);
});

test('rejects when audio playback fails', async () => {
  const playback = playAudio({ audioPath: 'audio/01-a.mp3' }, { AudioClass: FakeAudio });
  const audio = FakeAudio.instances.at(-1);

  audio.emit('error');
  await assert.rejects(playback, /Audio playback failed/);
});
