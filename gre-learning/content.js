import { approvedEntries, revision } from './approved-content.js';
import { validateEntry } from './schema.js';
const entries = new Map();
for (const entry of approvedEntries) {
  validateEntry(entry);
  if (entries.has(entry.number)) throw new TypeError('Duplicate learning entry number');
  entries.set(entry.number, entry);
}
export { revision };
export const approvedCount = entries.size;
export function getLearningRevision(number, baselineLesson) {
  const entry = entries.get(Number(number));
  return entry ? validateEntry(entry, baselineLesson) : null;
}
export function getLearningEntries() { return [...entries.values()].sort((a, b) => a.number - b.number); }
