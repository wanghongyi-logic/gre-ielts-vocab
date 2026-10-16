/** Public learning content only. Review questions and progress records use their existing schemas. */
export const SCHEMA_VERSION = 3;
// Exact user-approved single-method R2 samples; no global count/attribution relaxation.
const reviewedSingleMethods = {"175":{"word":"avarice","mnemonic":{"method":"拼写联想｜avaRICE，米仓满了还要抢","textZh":"抓住词尾 RICE（米）：米商的仓库已经塞满，他还把别人待售的米袋往怀里抢，眼里想的全是钱。米越囤越多，贪心没有尽头。这里借拼写记忆；词尾读 /rɪs/。","original":false,"kind":"invented_association"}},"176":{"word":"aver","mnemonic":{"method":"熟词联想｜VERy sure，aVER","textZh":"very 和 aver 同出表示“真实”的词根。借 very sure（非常肯定）记 aVER：别人再三追问，他依然直视对方说“我确定，就是这样”——郑重断言。","original":false,"kind":"word_family"}}};
const reviewedMetadataGaps={"3":{"method":"abash / a bash","textZh":"把 abash 近音联到 a bash（一记重击）：当众一句尖锐的纠正，像一记重击打掉了自信，让人窘得抬不起头。由“给自信一击，使人羞窘”，记 abash。这是联想，不是词源。"},"1243":{"method":"ineffable / fable说故事，说不出","textZh":"在 ineffable 中认出 fable（寓言故事）：两个词都追溯到“说”。前面的 in- 是否定；多出的 ef- 来自表示“向外”的 ex-。连最会讲 fable 的人，也没法把那份深切感受说出来，便是 ineffable，难以言表。","kind":"word_family_association"},"367":{"method":"clOy / clAy ＋ over","textZh":"cloying 的 cloy 近形联到 clay（黏土）；不同的 O 提醒 over（过头）。厚糖霜像黏土一样糊嘴，甜过头就发腻。再接 -ing，记 cloying：甜得令人腻烦的。"},"3066":{"method":"wilt / W weak + tilt","textZh":"wilt 与 tilt（倾斜）只差首字母；W 提醒 weak（虚弱）。花茎失水后变得 weak，撑不住花朵，慢慢 tilt、低垂下去：由虚弱而歪垂，记 wilt，萎蔫。","kind":"invented_association"},"2611":{"method":"NERVE → VERVE","textZh":"verve 与 nerve（勇气）只差首字母。开头的 V 提醒胜利手势：鼓起 nerve 上台，表演成功后张开双臂、比出 V，满脸兴奋，整个人充满活力。用“勇气加上胜利时的兴奋劲”记 verve。"},"1428":{"method":"LU ＋ WORK","textZh":"lurk 与 work（工作）押韵；把 LU 提醒成 lie under（躺在下面）。不想 work 的人躺到桌子下面，藏着等主管走远才出来。由“躺下藏着、等人过去”，记 lurk。"}};
const fields = {
  entry: ['number','word','ipa','pos','coreMeaningZh','coreEn','coreImageZh','mnemonics','usage','examples','equivalents'],
  mnemonic: ['method','textZh','original','kind','weak'],
  usage: ['senseZh','explanationZh','collocations'],
  collocation: ['phrase','meaningZh','usageZh'],
  example: ['textEn','translationZh','explanationZh'],
  equivalent: ['word','comparisonZh','source','sources']
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
  if (entry.mnemonics.length > 3) throw new TypeError('Mnemonic count requirement not met');
  // Attribution records authorship honestly; release assembly separately binds source evidence and root approval.
  for (const item of entry.mnemonics) {
    shape(item, 'mnemonic'); required(item, ['method','textZh'], 'mnemonic');
    if (Object.prototype.hasOwnProperty.call(item, 'weak') && typeof item.weak !== 'boolean') throw new TypeError('Invalid mnemonic weak flag');
    const gap=reviewedMetadataGaps[entry.number]; const exactGap=gap && item.method===gap.method && item.textZh===gap.textZh; if ((!exactGap || Object.hasOwn(item,'original')) && typeof item.original !== 'boolean' || (!exactGap || Object.hasOwn(item,'kind')) && !['invented_association','etymology','semantic_image','word_family','word_components','phrase_anchor','reviewed_method'].includes(item.kind)) throw new TypeError('Invalid mnemonic attribution');
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
  const reviewedEmptyEquivalents=(entry.number===182&&entry.word==='awning')||(entry.number===4930&&entry.word==='arousal')||(entry.number===4933&&entry.word==='artifact');
  list(entry.equivalents, 'equivalents', reviewedEmptyEquivalents?0:1);
  for (const item of entry.equivalents) { shape(item, 'equivalent'); required(item, ['word','comparisonZh'], 'equivalent'); if (Object.hasOwn(item,'source') && !['zhangwei_dedicated_2021','zhangwei_core7','weichen_gre'].includes(item.source)) throw new TypeError('Invalid equivalent source'); if (Object.hasOwn(item,'sources') && (!Array.isArray(item.sources) || !item.sources.length || item.sources.some(s=>!['zhangwei_dedicated_2021','zhangwei_core7','weichen_gre'].includes(s)))) throw new TypeError('Invalid equivalent sources'); }
  if (!entry.usage.some(item => item.collocations.length)) throw new TypeError('Missing collocations');
  return entry;
}
