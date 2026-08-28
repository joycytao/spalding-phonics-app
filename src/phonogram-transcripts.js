import transcriptSkeleton from '../data/phonogram-transcript.json' with { type: 'json' };

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

function buildTranscript(record) {
  const override = reviewedTranscripts[record.symbol] ?? {};
  return {
    ...record,
    ...override
  };
}

export function validateTranscriptCatalog(transcripts) {
  if (!Array.isArray(transcripts)) {
    throw new Error('Transcript catalog must be an array.');
  }

  const symbols = new Set();

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

    if (transcript.id !== index + 1) {
      throw new Error(`Transcript at position ${index + 1} must use id ${index + 1}.`);
    }

    if (symbols.has(transcript.symbol)) {
      throw new Error(`Transcript ${id} duplicates symbol "${transcript.symbol}".`);
    }
    symbols.add(transcript.symbol);

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

    const expectedAudioPath = `audio/${String(id).padStart(2, '0')}-${transcript.symbol}.mp3`;
    if (transcript.audioPath !== expectedAudioPath) {
      throw new Error(`Transcript ${id} audioPath must be "${expectedAudioPath}".`);
    }
  });

  return transcripts;
}

export function validateCompleteTranscriptCatalog(transcripts) {
  const validated = validateTranscriptCatalog(transcripts);
  if (validated.length !== 87) {
    throw new Error(`Transcript catalog must include exactly 87 records, received ${validated.length}.`);
  }
  return validated;
}

export const phonogramTranscripts = validateCompleteTranscriptCatalog(transcriptSkeleton.map(buildTranscript));
