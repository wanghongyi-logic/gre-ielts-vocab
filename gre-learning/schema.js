/** Public learning content only. Review questions and progress records use their existing schemas. */
export const SCHEMA_VERSION = 2;
const fields = {
  entry: ['number','word','ipa','pos','coreMeaningZh','coreEn','coreImageZh','mnemonics','usage','examples','equivalents'],
  mnemonic: ['method','textZh','original','kind'],
  usage: ['senseZh','explanationZh','collocations'],
  collocation: ['phrase','meaningZh','usageZh'],
  example: ['textEn','translationZh','explanationZh'],
  equivalent: ['word','sharedSenseZh','distinctionZh','substitutionLimitZh']
};
const text = value => typeof value === 'string' && value.trim().length > 0;
function shape(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`Invalid ${name}`);
  if (Object.keys(value).some(key => !fields[name].includes(key))) throw new TypeError(`Unknown ${name} field`);
}
function required(value, keys, label) {
  for (const key of keys) if (!text(value[key])) throw new TypeError(`Missing ${label}.${key}`);
}
function list(value, label, minimum = 1) {
  if (!Array.isArray(value) || value.length < minimum) throw new TypeError(`Invalid ${label}`);
}
export function validateEntry(entry, baselineLesson) {
  shape(entry, 'entry');
  if (!Number.isSafeInteger(entry.number) || entry.number < 1) throw new TypeError('Invalid stable number');
  required(entry, ['word','ipa','pos','coreMeaningZh','coreEn','coreImageZh'], 'entry');
  if (baselineLesson && (baselineLesson.number !== entry.number || baselineLesson.word !== entry.word)) throw new TypeError('Baseline identity mismatch');
  list(entry.mnemonics, 'mnemonics', 2);
  if (entry.mnemonics.length > 3 || !entry.mnemonics.some(item => item.original === true)) throw new TypeError('Expected 2–3 mnemonics including an original');
  for (const item of entry.mnemonics) {
    shape(item, 'mnemonic'); required(item, ['method','textZh'], 'mnemonic');
    if (typeof item.original !== 'boolean' || !['invented_association','etymology','semantic_image','word_family','word_components','phrase_anchor'].includes(item.kind)) throw new TypeError('Invalid mnemonic attribution');
  }
  list(entry.usage, 'usage');
  for (const item of entry.usage) {
    if (item.explanationZh !== undefined && !text(item.explanationZh)) throw new TypeError('Invalid usage explanation');
    shape(item, 'usage'); required(item, ['senseZh'], 'usage'); list(item.collocations, 'collocations', 0);
    for (const collocation of item.collocations) { shape(collocation, 'collocation'); if (collocation.usageZh !== undefined && !text(collocation.usageZh)) throw new TypeError('Invalid collocation note'); required(collocation, ['phrase','meaningZh'], 'collocation'); }
  }
  list(entry.examples, 'examples');
  for (const item of entry.examples) {
    if (item.explanationZh !== undefined && !text(item.explanationZh)) throw new TypeError('Invalid example explanation');
    shape(item, 'example'); required(item, ['textEn','translationZh'], 'example');
  }
  list(entry.equivalents, 'equivalents');
  for (const item of entry.equivalents) { shape(item, 'equivalent'); if (item.distinctionZh !== undefined && !text(item.distinctionZh)) throw new TypeError('Invalid distinction'); required(item, ['word','sharedSenseZh','substitutionLimitZh'], 'equivalent'); }
  if (!entry.usage.some(item => item.collocations.length)) throw new TypeError('Missing collocations');
  return entry;
}
