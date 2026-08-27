import test from 'node:test';
import assert from 'node:assert/strict';
import { createGenerationRequest, createPhonogramGenerationRequest } from '../src/voicebox-request.js';

test('builds a Voicebox generation request with the selected voice profile', () => {
  assert.deepEqual(createGenerationRequest('voice-42', 'ew: oo as in grew.'), {
    profile_id: 'voice-42',
    text: 'ew: oo as in grew.',
    language: 'en'
  });
});

test('uses approved ttsText as the phonogram Voicebox input', () => {
  assert.deepEqual(
    createPhonogramGenerationRequest('voice-42', {
      symbol: 'ew',
      narration: 'legacy narration should not be used',
      ttsText: 'E W. Two letters. /oo/ as in grew. /yoo/ as in new.'
    }),
    {
      profile_id: 'voice-42',
      text: 'E W. Two letters. /oo/ as in grew. /yoo/ as in new.',
      language: 'en'
    }
  );
});
