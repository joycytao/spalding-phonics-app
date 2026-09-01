export function createGenerationRequest(profileId, text, engine) {
  return {
    profile_id: profileId,
    text,
    language: 'en',
    ...(engine ? { engine } : {})
  };
}

export function createPhonogramGenerationRequest(profileId, phonogram, engine) {
  return createGenerationRequest(profileId, phonogram.ttsText, engine);
}
