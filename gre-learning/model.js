export function resolveWordNumber(hash, entries, remembered) {
  const match = /^#\/?(?:learn\/)?(\d+)$/.exec(hash);
  const requested = Number(match?.[1] || remembered);
  return entries.some(entry => entry.number === requested) ? requested : entries[0]?.number;
}
export function filterEntries(entries, query) {
  const term = query.trim().toLocaleLowerCase();
  return entries.filter(entry => `${entry.word} ${entry.coreMeaningZh}`.toLocaleLowerCase().includes(term));
}
export function neighboringNumbers(entries, number) {
  const index = entries.findIndex(entry => entry.number === number);
  return { previous: entries[index - 1]?.number, next: entries[index + 1]?.number, index };
}
