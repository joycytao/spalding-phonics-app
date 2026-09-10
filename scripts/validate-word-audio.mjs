import { readdir } from 'node:fs/promises';
import { validateWordAudioAssets, createApprovedWordAudioPlan } from '../src/word-audio-generator.js';
import { readFile } from 'node:fs/promises';

const catalog = JSON.parse(await readFile(new URL('../data/phonogram-word-lists.json', import.meta.url), 'utf8'));
const plan = createApprovedWordAudioPlan(catalog);
const files = (await readdir(new URL('../audio/words/', import.meta.url), { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith('.mp3'))
  .map((entry) => `audio/words/${entry.name}`);

validateWordAudioAssets(plan, files);
console.log(`Validated ${files.length} word audio assets.`);
