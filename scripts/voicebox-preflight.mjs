import {
  DEFAULT_VOICEBOX_URL,
  PRODUCTION_ENGINE,
  PRODUCTION_PROFILE_ID,
  PRODUCTION_PROFILE_NAME,
  runVoiceboxPreflight
} from '../src/voicebox-preflight.js';

try {
  const result = await runVoiceboxPreflight();
  console.log(`Voicebox reachable: ${result.baseUrl}`);
  console.log(`Health: model ${result.modelState} (downloaded=${result.health.model_downloaded}, loaded=${result.health.model_loaded})`);
  console.log(`Profile: ${result.profile.name ?? result.profile.display_name} (${result.profile.id ?? result.profile.profile_id})`);
  console.log(`Engine: ${result.profile.engine ?? result.profile.preset_engine ?? result.profile.model_name}`);
  console.log('Render readiness: ready');
} catch (error) {
  console.error('Voicebox preflight failed:', error.message);
  console.error(`Expected profile: ${PRODUCTION_PROFILE_NAME} (${PRODUCTION_PROFILE_ID}), engine ${PRODUCTION_ENGINE}`);
  console.error(`Voicebox URL: ${process.env.VOICEBOX_URL ?? DEFAULT_VOICEBOX_URL}`);
  process.exitCode = 1;
}
