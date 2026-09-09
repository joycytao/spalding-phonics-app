const REQUIRED_PHONOGRAM_COUNT = 70;

function fail(message) {
  throw new Error(`Word-list catalog ${message}`);
}

export function validateWordListCatalog(catalog) {
  if (!catalog || typeof catalog !== 'object' || Array.isArray(catalog)) {
    fail('must be an object.');
  }
  if (catalog.gradeLevel !== 2) fail('must target grade level 2.');
  if (!Number.isInteger(catalog.minimumWordsPerPhonogram) || catalog.minimumWordsPerPhonogram < 8) {
    fail('minimumWordsPerPhonogram must be at least 8.');
  }
  if (typeof catalog.source !== 'string' || !catalog.source.trim()) fail('must include a source note.');
  if (!Array.isArray(catalog.phonograms) || catalog.phonograms.length !== REQUIRED_PHONOGRAM_COUNT) {
    fail(`must contain exactly ${REQUIRED_PHONOGRAM_COUNT} phonograms.`);
  }

  const symbols = new Set();
  catalog.phonograms.forEach((entry, index) => {
    const expectedId = index + 1;
    if (!entry || typeof entry !== 'object') fail(`entry ${expectedId} must be an object.`);
    if (entry.id !== expectedId) fail(`entry ${expectedId} must use id ${expectedId}.`);
    if (typeof entry.symbol !== 'string' || !entry.symbol.trim()) fail(`entry ${expectedId} must include a symbol.`);
    const symbol = entry.symbol.toLowerCase();
    if (symbols.has(symbol)) fail(`duplicates symbol "${entry.symbol}".`);
    symbols.add(symbol);
    if (!Array.isArray(entry.words) || entry.words.length < catalog.minimumWordsPerPhonogram) {
      fail(`${entry.symbol} must contain at least ${catalog.minimumWordsPerPhonogram} words.`);
    }
    if (entry.reviewStatus !== 'pending_review') fail(`${entry.symbol} must remain pending_review.`);

    const words = new Set();
    entry.words.forEach((word) => {
      if (typeof word !== 'string' || !/^[a-z]+$/i.test(word)) {
        fail(`${entry.symbol} contains a malformed word.`);
      }
      const normalizedWord = word.toLowerCase();
      if (words.has(normalizedWord)) fail(`${entry.symbol} contains duplicate word "${word}".`);
      words.add(normalizedWord);
      if (!normalizedWord.includes(symbol)) fail(`word "${word}" does not contain phonogram "${entry.symbol}".`);
    });
  });

  return catalog;
}
