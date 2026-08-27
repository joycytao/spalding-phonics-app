export const ALLOWED_TRANSCRIPT_STATUSES = [
  'pending_approval',
  'approved',
  'needs_revision',
  'blocked'
];

export const TRANSCRIPT_SCHEMA = {
  id: 'number: 1-based curriculum order',
  symbol: 'string: displayed phonogram',
  group: 'single | multi | advanced',
  cuePhrases: {
    letterCount: 'optional string, such as "two letters"',
    useRestriction: 'optional string, such as "not used"',
    position: 'optional string, such as "beginning"',
    sounds: 'optional array of slash-delimited sounds'
  },
  ttsText: 'string: reviewed narration text; the only text sent to Voicebox',
  examples: 'array of { sound, word } example pairs',
  source: 'string: source URL for the record',
  reviewStatus: 'pending_approval | approved | needs_revision | blocked',
  audioPath: 'string: local MP3 path'
};

const source = 'https://valleyacademy.com/parents/student-resources/phonogram-helper/';

const first70 = [
  'a', 'c', 'd', 'f', 'g', 'o', 's', 'qu', 'b', 'e', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  'sh', 'ee', 'th', 'ow', 'ou', 'oo', 'ch', 'ar', 'ay', 'ai', 'oy', 'oi', 'er', 'ir', 'ur', 'wor', 'ear', 'ng', 'ea', 'aw', 'au', 'or', 'ck', 'wh', 'ed', 'ew', 'ui', 'oa', 'gu', 'ph', 'ough', 'oe', 'ey', 'igh', 'kn', 'gn', 'wr', 'ie', 'dge', 'ei', 'eigh', 'ti', 'si', 'ci'
];

const advanced = ['sci', 'our', 'eu', 'augh', 'gh', 'que', 'bu', 'lk', 'mb', 'mn', 'st', 'the', 'arr', 'err', 'ssi', 'te', 'dg'];

const reviewedTranscripts = {
  ew: {
    cuePhrases: {
      letterCount: 'two letters',
      sounds: ['/oo/', '/yoo/']
    },
    examples: [
      { sound: '/oo/', word: 'grew' },
      { sound: '/yoo/', word: 'new' }
    ],
    ttsText: 'E W. Two letters. /oo/ as in grew. /yoo/ as in new.',
    reviewStatus: 'approved'
  },
  kn: {
    cuePhrases: {
      letterCount: 'two letters',
      position: 'beginning',
      sounds: ['/n/']
    },
    examples: [{ sound: '/n/', word: 'knee' }],
    ttsText: 'K N. Two letters. /n/ as in knee. Beginning.',
    reviewStatus: 'approved'
  },
  wr: {
    cuePhrases: {
      letterCount: 'two letters',
      useRestriction: 'not used',
      position: 'beginning',
      sounds: ['/r/']
    },
    examples: [{ sound: '/r/', word: 'write' }],
    ttsText: 'W R. Two letters. /r/ as in write. Not used at the end of a word. Beginning.',
    reviewStatus: 'pending_approval'
  }
};

function spokenSymbol(symbol) {
  return symbol.toUpperCase().split('').join(' ');
}

function defaultTranscript(symbol) {
  return {
    cuePhrases: symbol.length > 1 ? { letterCount: `${symbol.length} letters` } : {},
    examples: [],
    ttsText: `${spokenSymbol(symbol)}. Listen for this phonogram sound.`,
    reviewStatus: 'pending_approval'
  };
}

function buildTranscript(symbol, index) {
  const id = index + 1;
  const override = reviewedTranscripts[symbol] ?? {};

  return {
    id,
    symbol,
    group: index < 26 ? 'single' : index < 70 ? 'multi' : 'advanced',
    ...defaultTranscript(symbol),
    ...override,
    source,
    audioPath: `audio/${String(id).padStart(2, '0')}-${symbol}.mp3`
  };
}

export function validateTranscriptCatalog(transcripts) {
  if (!Array.isArray(transcripts)) {
    throw new Error('Transcript catalog must be an array.');
  }

  transcripts.forEach((transcript, index) => {
    const id = transcript?.id ?? index + 1;
    for (const field of ['id', 'symbol', 'group', 'cuePhrases', 'ttsText', 'examples', 'source', 'reviewStatus', 'audioPath']) {
      if (
        transcript?.[field] === undefined ||
        transcript[field] === null ||
        transcript[field] === '' ||
        (typeof transcript[field] === 'string' && !transcript[field].trim())
      ) {
        throw new Error(`Transcript ${id} is missing required field "${field}".`);
      }
    }

    if (!['single', 'multi', 'advanced'].includes(transcript.group)) {
      throw new Error(`Transcript ${id} uses unsupported group "${transcript.group}".`);
    }

    if (!ALLOWED_TRANSCRIPT_STATUSES.includes(transcript.reviewStatus)) {
      throw new Error(`Transcript ${id} uses unsupported reviewStatus "${transcript.reviewStatus}".`);
    }

    if (typeof transcript.cuePhrases !== 'object' || Array.isArray(transcript.cuePhrases)) {
      throw new Error(`Transcript ${id} cuePhrases must be an object.`);
    }

    if (!Array.isArray(transcript.examples)) {
      throw new Error(`Transcript ${id} examples must be an array.`);
    }

    if (!transcript.audioPath.startsWith('audio/') || !transcript.audioPath.endsWith('.mp3')) {
      throw new Error(`Transcript ${id} audioPath must point to a local MP3 file.`);
    }
  });

  return transcripts;
}

export const phonogramTranscripts = validateTranscriptCatalog([...first70, ...advanced].map(buildTranscript));
