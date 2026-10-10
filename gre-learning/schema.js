/** Public learning content only. Review questions and progress records use their existing schemas. */
export const SCHEMA_VERSION = 3;
// Exact user-approved single-method R2 samples; no global count/attribution relaxation.
const reviewedSingleMethods = {"175":{"word":"avarice","mnemonic":{"method":"拼写联想｜avaRICE，米仓满了还要抢","textZh":"抓住词尾 RICE（米）：米商的仓库已经塞满，他还把别人待售的米袋往怀里抢，眼里想的全是钱。米越囤越多，贪心没有尽头。这里借拼写记忆；词尾读 /rɪs/。","original":false,"kind":"invented_association"}},"176":{"word":"aver","mnemonic":{"method":"熟词联想｜VERy sure，aVER","textZh":"very 和 aver 同出表示“真实”的词根。借 very sure（非常肯定）记 aVER：别人再三追问，他依然直视对方说“我确定，就是这样”——郑重断言。","original":false,"kind":"word_family"}}};
const fields = {
  entry: ['number','word','ipa','pos','coreMeaningZh','coreEn','coreImageZh','mnemonics','usage','examples','equivalents'],
  mnemonic: ['method','textZh','original','kind'],
  usage: ['senseZh','explanationZh','collocations'],
  collocation: ['phrase','meaningZh','usageZh'],
  example: ['textEn','translationZh','explanationZh'],
  equivalent: ['word','comparisonZh']
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
  const exception=reviewedSingleMethods[entry.number];
  const reviewedSingleMethod=exception?.word===entry.word&&Array.isArray(entry.mnemonics)&&entry.mnemonics.length===1&&Object.entries(exception.mnemonic).every(([key,value])=>entry.mnemonics[0]?.[key]===value);
  list(entry.mnemonics, 'mnemonics', reviewedSingleMethod?1:2);
  if (entry.mnemonics.length > 3 || (!reviewedSingleMethod&&!entry.mnemonics.some(item => item.original === true))) throw new TypeError('Mnemonic count or attribution requirement not met');
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
  // Qualified editorial exception: no verified GRE equivalent pair for awning.
  const reviewedEmptyEquivalents=entry.number===182&&entry.word==='awning';
  list(entry.equivalents, 'equivalents', reviewedEmptyEquivalents?0:1);
  for (const item of entry.equivalents) { shape(item, 'equivalent'); required(item, ['word','comparisonZh'], 'equivalent'); }
  if (!entry.usage.some(item => item.collocations.length)) throw new TypeError('Missing collocations');
  return entry;
}
