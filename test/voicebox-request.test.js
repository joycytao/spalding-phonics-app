import test from 'node:test';
import assert from 'node:assert/strict';
import { createGenerationRequest } from '../src/voicebox-request.js';

test('builds a Voicebox generation request with the selected voice profile', () => {
  assert.deepEqual(createGenerationRequest('voice-42', 'ew: oo as in grew.'), {
    profile_id: 'voice-42',
    text: 'ew: oo as in grew.',
    language: 'en'
  });
});
