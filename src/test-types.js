export function getTestTypeSelection(testType, phonograms) {
  if (testType === 'wpr') return { mode: 'exam', screen: 'groups', group: null, selectedIds: [] };
  if (testType === 'spelling') return {
    mode: 'spelling-test',
    screen: 'picker',
    group: 'all',
    selectedIds: phonograms.filter((item) => item.id <= 70).map((item) => item.id)
  };
  throw new Error(`Unknown test type: ${testType}`);
}
