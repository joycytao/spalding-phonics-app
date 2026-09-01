export function createGenerationRequest(profileId, text, engine, instruct, model) {
  return {
    profile_id: profileId,
    text,
    language: 'en',
    ...(engine ? { engine } : {}),
    ...(instruct ? { instruct } : {}),
    ...(model ? { model } : {})
  };
}

export function createPhonogramGenerationRequest(profileId, phonogram, engine, instruct, model) {
  return createGenerationRequest(profileId, phonogram.ttsText, engine, instruct, model);
}
