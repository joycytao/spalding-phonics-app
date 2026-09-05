export function orderedSelection(ids, phonograms) {
  const selected = new Set(ids);
  return phonograms.filter((item) => selected.has(item.id));
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
