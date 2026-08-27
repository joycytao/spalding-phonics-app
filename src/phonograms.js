import { phonogramTranscripts } from './phonogram-transcripts.js';

export const phonograms = phonogramTranscripts.map((transcript) => ({
  id: transcript.id,
  symbol: transcript.symbol,
  group: transcript.group,
  cuePhrases: transcript.cuePhrases,
  narration: transcript.ttsText,
  ttsText: transcript.ttsText,
  examples: transcript.examples,
  audioPath: transcript.audioPath,
  source: transcript.source,
  reviewStatus: transcript.reviewStatus,
  reviewNeeded: transcript.reviewStatus !== 'approved'
}));

export const groups = [
  { id: 'single', label: 'Phonograms 1 to 26', detail: 'Single-letter phonograms' },
  { id: 'multi', label: 'Phonograms 27 to 70', detail: 'Multi-letter phonograms' },
  { id: 'advanced', label: 'Phonograms 71 to 87', detail: 'Advanced/additional phonograms' },
  { id: 'all', label: 'Phonograms 1 to 87', detail: 'Complete phonogram sequence' }
];
