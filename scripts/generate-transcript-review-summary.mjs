import { readFile, writeFile } from 'node:fs/promises';

const inputPath = new URL('../data/phonogram-transcript.json', import.meta.url);
const outputPath = new URL('../data/transcript-review-summary.json', import.meta.url);
const transcripts = JSON.parse(await readFile(inputPath, 'utf8'));

const convention = {
  multiLetterOrder: 'phonogram sound(s) before the letter-count explanation',
  distinctSoundPause: 'full-stop punctuation between distinct phonogram sounds',
  singleLetterOrder: 'letter name before sound examples, matching the approved a sample',
  finalApproval: 'human instructional reviewer must confirm every row before release audio'
};

function letterNamePrefix(transcript) {
  return `${transcript.symbol.toUpperCase().split('').join(' ')}.`;
}

function reviewRow(transcript) {
  if (transcript.reviewStatus === 'blocked') {
    return {
      id: transcript.id,
      symbol: transcript.symbol,
      currentStatus: transcript.reviewStatus,
      decision: 'blocked',
      reason: 'Existing transcript is blocked and is not eligible for release audio.',
      evidence: transcript.source
    };
  }

  if (transcript.group === 'multi' && transcript.ttsText.startsWith(letterNamePrefix(transcript))) {
    return {
      id: transcript.id,
      symbol: transcript.symbol,
      currentStatus: transcript.reviewStatus,
      decision: 'revise',
      reason: 'Multi-letter narration starts with letter names; review against the phonogram-first convention and confirm any exception.',
      evidence: transcript.source
    };
  }

  return {
    id: transcript.id,
    symbol: transcript.symbol,
    currentStatus: transcript.reviewStatus,
    decision: 'approved',
    reason: transcript.group === 'single'
      ? 'Matches the single-letter sample convention; human reviewer must confirm the sound and example wording.'
      : 'Matches the preliminary phonogram-first order; human reviewer must confirm notation, examples, and pauses.',
    evidence: transcript.source
  };
}

const summary = {
  title: 'Transcript narration convention re-review',
  basis: 'Preliminary consistency pass after the ew phonogram-first review; decisions are not final release approval.',
  convention,
  rows: transcripts.map(reviewRow)
};

await writeFile(outputPath, `${JSON.stringify(summary, null, 2)}\n`);
console.log(`Wrote ${summary.rows.length} transcript review rows to ${outputPath.pathname}`);
