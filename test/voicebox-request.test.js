import test from 'node:test';
import assert from 'node:assert/strict';
import { createGenerationRequest, createPhonogramGenerationRequest } from '../src/voicebox-request.js';
import { runVoiceboxPreflight } from '../src/voicebox-preflight.js';

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

test('accepts an idle downloaded model and validates the production profile', async () => {
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url, options });
    const body = url.endsWith('/health')
      ? { model_loaded: false, model_downloaded: true }
      : [{
          id: 'a07dbe47-2f91-4c2b-88df-0551bdaebc99',
          name: 'story-narrator-01',
          preset_engine: 'qwen_custom_voice'
        }];
    return { ok: true, status: 200, statusText: 'OK', json: async () => body };
  };

  const result = await runVoiceboxPreflight({
    baseUrl: 'http://voicebox.test',
    fetchImpl
  });

  assert.equal(result.ok, true);
  assert.equal(result.modelState, 'idle');
  assert.equal(result.profile.name, 'story-narrator-01');
  assert.deepEqual(requests.map(({ url, options }) => [url, options?.method]), [
    ['http://voicebox.test/health', 'GET'],
    ['http://voicebox.test/profiles', 'GET']
  ]);
});

test('rejects a missing or mismatched production profile', async () => {
  const fetchImpl = async (url) => {
    const body = url.endsWith('/health')
      ? { model_loaded: true, model_downloaded: true }
      : [{ id: 'other-profile', name: 'other', preset_engine: 'kokoro' }];
    return { ok: true, status: 200, statusText: 'OK', json: async () => body };
  };

  await assert.rejects(
    runVoiceboxPreflight({ fetchImpl }),
    /production profile.*a07dbe47-2f91-4c2b-88df-0551bdaebc99.*qwen_custom_voice/i
  );
});
