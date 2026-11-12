const SLOTS = [
  'Morning (fasting)',
  'After breakfast',
  'After lunch',
  'After dinner'
];

/**
 * Returns formatted slot article prefix (e.g. "an After lunch" vs "a Morning (fasting)")
 */
function formatSlotError(slot) {
  const vowels = ['A', 'E', 'I', 'O', 'U'];
  const firstLetter = slot.charAt(0).toUpperCase();
  const article = vowels.includes(firstLetter) ? 'an' : 'a';
  return `You already have ${article} ${slot} reading for this date.`;
}

module.exports = {
  SLOTS,
  formatSlotError
};

