export function createGenerationRequest(profileId, text) {
  return { profile_id: profileId, text, language: 'en' };
}
