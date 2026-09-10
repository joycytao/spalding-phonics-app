export function orderedSelection(ids, phonograms) {
  const selected = new Set(ids);
  return phonograms.filter((item) => selected.has(item.id));
}

export function chooseSpellingWord(words, previousWord, random = Math.random) {
  if (!words.length) return null;
  const candidates = words.length > 1 ? words.filter((word) => word !== previousWord) : words;
  return candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))];
}

export function createSpellingSession(ids, phonograms, wordListCatalog, random = Math.random) {
  let previousWord = null;
  const items = orderedSelection(ids, phonograms).map((item) => {
    const entry = wordListCatalog.phonograms.find((candidate) => candidate.id === item.id);
    const words = entry?.reviewStatus === 'approved' && Array.isArray(entry.words) ? entry.words : [];
    const word = chooseSpellingWord(words, previousWord, random);
    previousWord = word;
    return {
      ...item,
      word: word ?? null,
      audioPath: word ? `audio/words/${String(item.id).padStart(2, '0')}-${item.symbol.toLowerCase()}-${word.toLowerCase()}.mp3` : null
    };
  });
  return {
    mode: 'spelling-test',
    items,
    index: 0,
    isComplete: false,
    score: { correct: 0, total: 0 },
    incorrectIds: []
  };
}

export function createSession(ids, phonograms, mode) {
  return {
    mode,
    items: orderedSelection(ids, phonograms),
    index: 0,
    isComplete: false,
    score: { correct: 0, total: 0 },
    incorrectIds: []
  };
}

export function advance(session) {
  if (session.index >= session.items.length - 1) {
    return { ...session, isComplete: true };
  }

  return { ...session, index: session.index + 1 };
}

export function getPracticeNavigationAction(session) {
  return session.mode === 'practice' && session.index === session.items.length - 1 ? 'finish' : 'next';
}

export function getReviewPracticeNavigationAction(session) {
  return session.mode === 'review-practice' && session.index === session.items.length - 1 ? 'finish' : 'next';
}

export function recordExamDecision(session, isCorrect) {
  const current = session.items[session.index];
  return {
    ...session,
    score: {
      correct: session.score.correct + (isCorrect ? 1 : 0),
      total: session.score.total + 1
    },
    incorrectIds: isCorrect ? session.incorrectIds : [...new Set([...session.incorrectIds, current.id])]
  };
}

export function advanceExamDecision(session, isCorrect) {
  return advance(recordExamDecision(session, isCorrect));
}
