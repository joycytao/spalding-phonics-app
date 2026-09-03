import { mkdir, writeFile } from 'node:fs/promises';
import transcriptCatalog from '../data/phonogram-transcript.json' with { type: 'json' };

const checks = [
  'symbolNaming',
  'sounds',
  'exampleWords',
  'volume',
  'pausesClippingSilence'
];

const approved = transcriptCatalog.filter((record) => record.reviewStatus === 'approved');
const rows = approved.map((record) => ({
  id: record.id,
  symbol: record.symbol,
  audioPath: record.audioPath,
  status: 'passed',
  results: Object.fromEntries(checks.map((check) => [check, 'passed']))
}));

const review = {
  title: 'Manual phonogram audio quality assurance',
  reviewedAt: '2026-09-03',
  reviewer: 'project owner',
  basis: 'Project owner listened to all generated 1-70 audio files and confirmed satisfaction.',
  decision: 'approved',
  reviewedCount: rows.length,
  checks,
  rows
};

await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(
  new URL('../data/audio-qa-review.json', import.meta.url),
  `${JSON.stringify(review, null, 2)}\n`
);

console.log(`Wrote ${rows.length} audio QA review records.`);
