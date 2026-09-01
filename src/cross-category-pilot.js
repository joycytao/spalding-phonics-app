import {
  DEFAULT_NARRATION_INSTRUCT,
  PRODUCTION_ENGINE,
  PRODUCTION_MODEL,
  PRODUCTION_PROFILE_ID,
  PRODUCTION_PROFILE_NAME,
  transcriptVersion
} from './audio-generator.js';
import { phonogramTranscripts } from './phonogram-transcripts.js';

export const CROSS_CATEGORY_PILOT_SYMBOLS = Object.freeze(['a', 'th', 'oo', 'ew', 'ough']);

export const CROSS_CATEGORY_PILOT_CATEGORIES = Object.freeze({
  a: 'single-letter',
  th: 'multi-letter',
  oo: 'multi-sound',
  ew: 'multi-sound',
  ough: 'complex'
});

export function selectCrossCategoryPilotTranscripts(transcripts = phonogramTranscripts) {
  const bySymbol = new Map(transcripts.map((transcript) => [transcript.symbol, transcript]));
  const selected = CROSS_CATEGORY_PILOT_SYMBOLS.map((symbol) => bySymbol.get(symbol));
  const missing = CROSS_CATEGORY_PILOT_SYMBOLS.filter((symbol, index) => !selected[index]);
  if (missing.length > 0) throw new Error(`Missing cross-category pilot transcript(s): ${missing.join(', ')}`);

  const unapproved = selected.filter((transcript) => transcript.reviewStatus !== 'approved');
  if (unapproved.length > 0) {
    throw new Error(`Cross-category pilot requires approved transcripts: ${unapproved.map(({ symbol }) => symbol).join(', ')}`);
  }
  return selected;
}

export function createCrossCategoryPilotReview({
  transcripts = phonogramTranscripts,
  manifestEntries = [],
  generatedAt = new Date().toISOString()
} = {}) {
  const selected = selectCrossCategoryPilotTranscripts(transcripts);
  const metadataByPath = new Map(manifestEntries.map((entry) => [entry.outputPath, entry]));
  return {
    referenceIssue: 14,
    generatedAt,
    reviewStatus: 'pending_human_review',
    productionSettings: {
      profileName: PRODUCTION_PROFILE_NAME,
      profileId: PRODUCTION_PROFILE_ID,
      engine: PRODUCTION_ENGINE,
      model: PRODUCTION_MODEL,
      instruct: DEFAULT_NARRATION_INSTRUCT
    },
    humanChecks: ['pronunciation', 'pace', 'volume', 'cross-category consistency'],
    samples: selected.map((transcript) => ({
      id: transcript.id,
      symbol: transcript.symbol,
      category: CROSS_CATEGORY_PILOT_CATEGORIES[transcript.symbol],
      transcriptVersion: transcriptVersion(transcript),
      audioPath: transcript.audioPath,
      generationId: metadataByPath.get(transcript.audioPath)?.generationId ?? null,
      reviewStatus: 'pending_human_review',
      checks: {
        pronunciation: 'pending',
        pace: 'pending',
        volume: 'pending',
        consistency: 'pending'
      }
    }))
  };
}
