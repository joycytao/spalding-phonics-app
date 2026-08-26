const first70 = [
  'a', 'c', 'd', 'f', 'g', 'o', 's', 'qu', 'b', 'e', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  'sh', 'ee', 'th', 'ow', 'ou', 'oo', 'ch', 'ar', 'ay', 'ai', 'oy', 'oi', 'er', 'ir', 'ur', 'wor', 'ear', 'ng', 'ea', 'aw', 'au', 'or', 'ck', 'wh', 'ed', 'ew', 'ui', 'oa', 'gu', 'ph', 'ough', 'oe', 'ey', 'igh', 'kn', 'gn', 'wr', 'ie', 'dge', 'ei', 'eigh', 'ti', 'si', 'ci'
];

// Advanced entries remain explicitly marked for instructional review before audio release.
const advanced = ['sci', 'our', 'eu', 'augh', 'gh', 'que', 'bu', 'lk', 'mb', 'mn', 'st', 'the', 'arr', 'err', 'ssi', 'te', 'dg'];

const cues = {
  a: 'a: apple, acorn, father.', c: 'c: cat, cent.', e: 'e: echo, equal.', i: 'i: itch, ice.', o: 'o: octopus, open, moon.',
  u: 'u: up, unicorn, rule.', th: 'th: thin, then.', ow: 'ow: cow, snow.', oo: 'oo: moon, book.', ch: 'ch: chin, chorus, chef.',
  ew: 'ew: oo as in grew; yoo as in new.', ui: 'ui: oo as in fruit; yoo as in suit.', ough: 'ough: though, through, rough, cough, thought, bough.'
};

export const phonograms = [...first70, ...advanced].map((symbol, index) => ({
  id: index + 1,
  symbol,
  group: index < 26 ? 'single' : index < 70 ? 'multi' : 'advanced',
  narration: cues[symbol] ?? `${symbol}: listen for this phonogram sound.`,
  audioPath: `audio/${String(index + 1).padStart(2, '0')}-${symbol}.mp3`,
  source: 'https://valleyacademy.com/parents/student-resources/phonogram-helper/',
  reviewNeeded: index >= 70
}));

export const groups = [
  { id: 'single', label: 'Phonograms 1 to 26', detail: 'Single-letter phonograms' },
  { id: 'multi', label: 'Phonograms 27 to 70', detail: 'Multi-letter phonograms' },
  { id: 'advanced', label: 'Phonograms 71 to 87', detail: 'Advanced/additional phonograms' },
  { id: 'all', label: 'Phonograms 1 to 87', detail: 'Complete phonogram sequence' }
];
