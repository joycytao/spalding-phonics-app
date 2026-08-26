const REVIEW_KEY = 'phonograms.review-queue';

export function createProgressStore(storage) {
  function getReviewQueue() {
    try {
      return JSON.parse(storage.getItem(REVIEW_KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  function save(queue) {
    storage.setItem(REVIEW_KEY, JSON.stringify(queue));
  }

  return {
    getReviewQueue,
    recordIncorrect(id) {
      save([...new Set([...getReviewQueue(), id])]);
    },
    removeReviewedCorrect(id) {
      save(getReviewQueue().filter((queuedId) => queuedId !== id));
    }
  };
}
