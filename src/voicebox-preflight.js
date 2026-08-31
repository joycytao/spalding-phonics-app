export const DEFAULT_VOICEBOX_URL = 'http://127.0.0.1:17493';
export const PRODUCTION_PROFILE_ID = 'a07dbe47-2f91-4c2b-88df-0551bdaebc99';
export const PRODUCTION_PROFILE_NAME = 'story-narrator-01';
export const PRODUCTION_ENGINE = 'qwen_custom_voice';

async function getJson(fetchImpl, url) {
  let response;
  try {
    response = await fetchImpl(url, { method: 'GET' });
  } catch (error) {
    throw new Error(`Voicebox is unreachable at ${url}: ${error.message}`);
  }

  if (!response.ok) {
    throw new Error(`Voicebox request failed at ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function profileEngine(profile) {
  return profile.engine ?? profile.preset_engine ?? profile.model_name;
}

function findProductionProfile(profiles) {
  if (!Array.isArray(profiles)) {
    throw new Error('Voicebox /profiles returned an invalid response; expected an array.');
  }

  const profile = profiles.find((candidate) => (
    (candidate.id ?? candidate.profile_id) === PRODUCTION_PROFILE_ID
  ));

  if (!profile || (profile.name ?? profile.display_name) !== PRODUCTION_PROFILE_NAME || profileEngine(profile) !== PRODUCTION_ENGINE) {
    throw new Error(
      `Voicebox production profile is missing or mismatched: expected ${PRODUCTION_PROFILE_NAME} (${PRODUCTION_PROFILE_ID}) using ${PRODUCTION_ENGINE}.`
    );
  }

  return profile;
}

function modelState(health) {
  if (health.model_loaded === true) return 'ready';
  if (health.model_loaded === false && health.model_downloaded === true) return 'idle';
  return 'unavailable';
}

export async function runVoiceboxPreflight({
  baseUrl = process.env.VOICEBOX_URL ?? DEFAULT_VOICEBOX_URL,
  fetchImpl = globalThis.fetch
} = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('A fetch implementation is required to run the Voicebox preflight.');
  }

  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  const health = await getJson(fetchImpl, `${normalizedBaseUrl}/health`);
  const profiles = await getJson(fetchImpl, `${normalizedBaseUrl}/profiles`);
  const profile = findProductionProfile(profiles);
  const state = modelState(health);

  if (state === 'unavailable') {
    throw new Error(
      'Voicebox model is unavailable: expected model_loaded=true or the idle state model_loaded=false with model_downloaded=true.'
    );
  }

  return {
    ok: true,
    baseUrl: normalizedBaseUrl,
    modelState: state,
    health,
    profile
  };
}
