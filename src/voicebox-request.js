export function createGenerationRequest(profileId, text) {
  return { profile_id: profileId, text, language: 'en' };
}

export function createPhonogramGenerationRequest(profileId, phonogram) {
  return createGenerationRequest(profileId, phonogram.ttsText);
}
