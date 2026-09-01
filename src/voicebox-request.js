export function createGenerationRequest(profileId, text, engine, instruct) {
  return {
    profile_id: profileId,
    text,
    language: 'en',
    ...(engine ? { engine } : {}),
    ...(instruct ? { instruct } : {})
  };
}

export function createPhonogramGenerationRequest(profileId, phonogram, engine, instruct) {
  return createGenerationRequest(profileId, phonogram.ttsText, engine, instruct);
}
