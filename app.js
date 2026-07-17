import { getLessonByNumber, getSet, getSetForLesson, lessons, markedStory, sets } from "./content.js";
import { getLookalikePack } from "./data/lookalike-packs.js";
import {
  ielts538Entries,
  ielts538GroupStories,
  ielts538Manifest,
  ielts538SynonymGroups,
  getIelts538SynonymGroup,
  getIelts538LookalikePack,
} from "./data/ielts-538/index.js";
import {
  QUESTION_MODES,
  buildPracticeSession,
  createSeededRandom,
  isQuestionCorrect,
} from "./practice-engine.js";

document.documentElement.dataset.greBoot = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

const STORAGE_KEY = "gre-300-progress-v4";
const PREVIOUS_STORAGE_KEY = "gre-100-progress-v3";
const V2_KEY = "gre-20-progress-v2";
const LEGACY_KEY = "gre-five-progress-v1";
const RATINGS = ["Again", "Hard", "Good", "Easy"];
const BUCKET_META = {
  again: { label: "Again", zh: "优先重学", detail: "没想起；下一轮显著提高抽取概率" },
  hard: { label: "Hard", zh: "困难词", detail: "勉强想起；进入困难词专项" },
  good: { label: "Good", zh: "常规巩固", detail: "正常想起；进入常规巩固" },
  easy: { label: "Easy", zh: "快速巡检", detail: "毫不费力；以后快速抽查" },
};
const REVIEW_FILTERS = [
  ["all", "全部词"], ["wrong", "错题"], ["again", "Again"], ["hard", "Hard"], ["good", "Good"],
  ["easy", "Easy"], ["favorite", "收藏"], ["learned", "全部已学"], ["unlearned", "未学"],
];
const PRACTICE_SCOPES = [
  ["set", "当前 5 词组"],
  ["chapter", "当前 20 词章节"],
  ["all", "全部词库"],
];
const QUESTION_COUNTS = [5, 10, 20, 30, 0];
const ALL_MODE_IDS = QUESTION_MODES.map((mode) => mode.id);
const IELTS_PROGRESS_KEY = "ielts-538-progress-v2";
const IELTS_PREVIEW_PROGRESS_KEY = "ielts-538-preview-progress-v1";
const IELTS_REVIEW_COUNT = 10;
const ieltsEntryById = new Map(ielts538Entries.map((entry) => [entry.appId, entry]));
const ieltsGroups = ielts538SynonymGroups.map((group, index) => ({ ...group, number: index + 1 }));
const ieltsGroupById = new Map(ieltsGroups.map((group) => [group.groupId, group]));

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function ieltsVerbPattern(base) {
  const irregular = {
    underlie: "(?:underlie|underlies|underlay|underlain|underlying)",
    rely: "(?:rely|relies|relied|relying)",
    identify: "(?:identify|identifies|identified|identifying)",
    modify: "(?:modify|modifies|modified|modifying)",
    stem: "(?:stem|stems|stemmed|stemming)",
  };
  if (irregular[base]) return irregular[base];
  if (base.endsWith("e")) return `${escapeRegex(base.slice(0, -1))}(?:e|es|ed|ing)`;
  return `${escapeRegex(base)}(?:s|es|ed|ing)?`;
}

function clozeIeltsHeadword(text, rawWord) {
  const source = String(text || "");
  const word = String(rawWord || "").replaceAll("*", "").trim();
  if (!source || !word) return source;
  const exact = new RegExp(`\\b${escapeRegex(word)}\\b`, "i");
  if (exact.test(source)) return source.replace(exact, "_____");
  const base = word.split(/\s+/)[0].toLowerCase();
  const remainder = word.split(/\s+/).slice(1).join(" ");
  const phrase = remainder
    ? new RegExp(`\\b${ieltsVerbPattern(base)}\\s+${escapeRegex(remainder)}\\b`, "i")
    : new RegExp(`\\b${ieltsVerbPattern(base)}\\b`, "i");
  return phrase.test(source) ? source.replace(phrase, "_____") : source;
}

const ieltsLessons = ielts538Entries.map((entry) => {
  const synonymGroup = getIelts538SynonymGroup(entry.synonymGroupId);
  const allMembers = synonymGroup?.members || [];
  const comparisonMembers = allMembers.filter((member) => Number(member.appId) !== entry.appId && member.word !== entry.word);
  const members = comparisonMembers.length ? comparisonMembers : allMembers;
  const currentComparisonMember = allMembers.find((member) => Number(member.appId) === entry.appId || member.word === entry.word);
  const currentComparisonFocus = currentComparisonMember?.focusZh;
  const entryType = entry.entryType || entry.source?.entry_type || "primary";
  const linkedPrimaryWord = entry.linkedPrimaryWord ?? entry.source?.linked_primary_word ?? null;
  const morphology = entry.morphology || {};
  const memory = entry.memory || {};
  const senses = (entry.senses || []).map((sense) => ({
    label: sense.label,
    title: sense.titleZh,
    explanation: sense.explanationZh,
    collocations: sense.collocations || [],
  }));
  const firstCollocation = senses.flatMap((sense) => sense.collocations)[0];
  const contextSentence = firstCollocation?.example?.en || entry.ieltsExamples?.[0]?.en || entry.coreEn;
  const clozedContext = clozeIeltsHeadword(contextSentence, entry.word);
  const comparisonOptions = [entry.word, ...comparisonMembers.map((item) => item.word)].slice(0, 4);
  return {
  number: entry.appId,
  appId: entry.appId,
  setId: ieltsGroupById.get(entry.synonymGroupId)?.number || null,
  word: entry.word,
  displayVariants: entry.displayVariants || [entry.word],
  ipa: entry.ipa,
  pos: entry.pos,
  register: entry.register,
  coreEn: entry.coreEn,
  coreZh: entry.coreZh,
  imageZh: entry.imageZh,
  grammarZh: entry.grammarZh,
  source: { ...entry.source, entryType, linkedPrimaryWord },
  synonymGroupId: entry.synonymGroupId,
  synonymGroup,
  groupStory: ielts538GroupStories[entry.synonymGroupId] || null,
  sourceMethodAudit: synonymGroup?.sourceMethodAudit || entry.sourceMethodAudit || { noteZh: synonymGroup?.groupRuleZh },
  groupRuleZh: synonymGroup?.groupRuleZh || "意思相关并不等于所有语境可互换。",
  senses,
  comparisons: members.map((item) => {
    const relatedEntry = ieltsEntryById.get(Number(item.appId));
    const directContrast = item.focusZh && currentComparisonFocus
      ? `${item.word} ${String(item.focusZh).replace(/[。；;]+$/u, "")}；${entry.word} ${String(currentComparisonFocus).replace(/[。；;]+$/u, "")}。`
      : item.boundaryZh || synonymGroup?.groupRuleZh || "只在部分语境相关，不能机械互换。";
    return {
    role: item.role || (Number(item.appId) === synonymGroup?.primaryAppId ? "组内主词" : "近义 / 替换边界"),
    word: item.word,
    ipa: relatedEntry?.ipa || item.ipa || "",
    meaningZh: `${relatedEntry?.pos || item.pos || ""}${relatedEntry?.pos || item.pos ? " · " : ""}${item.coreZh || item.meaningZh || relatedEntry?.coreZh || ""}`,
    contrast: directContrast,
    examples: item.example ? [item.example] : [],
  };
  }),
  morphology: {
    ...morphology,
    soundHookZh: morphology.nonEtymologicalHookZh || morphology.soundHookZh || "",
    trapZh: memory.confusionBrakeZh || memory.trapZh || morphology.associationWarningZh || morphology.trapZh || "",
  },
  memory: {
    ...memory,
    soundZh: morphology.nonEtymologicalHookZh || morphology.soundHookZh || "",
    rootZh: morphology.originZh || "",
    englishHookZh: morphology.familiarBridgeZh || memory.tenSecondSentence?.en || memory.tenSecondEn || "",
    bridgeZh: [memory.semanticLandingZh, memory.confusionBrakeZh || memory.trapZh, morphology.associationWarningZh].filter(Boolean).join(" "),
    sceneZh: memory.absurdSceneZh || memory.sceneZh || entry.imageZh,
  },
  recall: entry.recall,
  ieltsExamples: entry.ieltsExamples || [],
  ieltsEvidence: entry.officialEvidence || [],
  lookalikePack: getIelts538LookalikePack(entry.appId),
  checks: entry.checks || [],
  acceptedAnswers: [entry.word.replaceAll("*", "")],
  context: {
    prompt: clozedContext.includes("_____") ? clozedContext : `Complete the core phrase “${firstCollocation?.zh || entry.coreZh}”: _____.`,
    promptZh: `根据完整语境选择主词；放入句中时可按语法变形。${firstCollocation?.example?.zh ? ` 例句义：${firstCollocation.example.zh}` : ""}`,
    explanation: firstCollocation?.example?.en || entry.coreEn,
    explanationZh: `${entry.word}：${entry.coreZh}。${entry.grammarZh}`,
  },
  contrastQuiz: comparisonOptions.length > 1 ? {
    prompt: clozedContext.includes("_____")
      ? `Which headword is most precise in this sentence? ${clozedContext}`
      : `Which headword best matches this boundary: ${memory.confusionBrakeZh || entry.grammarZh}`,
    promptZh: `在本组近义／替换候选中选择最准确的一项。当前辨析线索：${memory.confusionBrakeZh || entry.grammarZh}`,
    options: comparisonOptions,
    answer: 0,
    explanation: entry.coreEn,
    explanationZh: `${entry.word}：${entry.coreZh}。${memory.confusionBrakeZh || synonymGroup?.groupRuleZh}`,
  } : null,
  };
});

const app = document.querySelector("#app");
const lessonList = document.querySelector("#lesson-list");
const contextRail = document.querySelector("#context-rail");
const layoutModeButton = document.querySelector("#layout-mode-button");
const progressLabel = document.querySelector("#progress-label");
const progressFill = document.querySelector("#progress-fill");
const toast = document.querySelector("#toast");
const installButton = document.querySelector("#install-button");
const brandTitle = document.querySelector("#brand-title");
const brandSubtitle = document.querySelector("#brand-subtitle");
const brandMark = document.querySelector("#brand-mark");

let progress = loadProgress();
let installPrompt = null;
let quizSession = null;
let reviewSession = null;
let testConfig = { scope: "set", filter: "all", count: 5, modes: [...ALL_MODE_IDS] };
let reviewConfig = { scope: "all", filter: "all", count: 10, modes: [...ALL_MODE_IDS] };
let libraryQuery = "";
let libraryStatusFilter = "all";
let librarySelectedNumber = progress.lastWord || 1;
let reviewSelection = new Set();
let toastTimer = null;
let railSignature = "";
let railsCollapsed = loadRailsCollapsed();
let learningPanel = "memory";
let ieltsProgress = loadIeltsProgress();
let ieltsLibrarySelectedNumber = ieltsProgress.lastWord || 1;
let ieltsLibraryQuery = "";
let ieltsLibraryCategory = ieltsCategoryForLesson(ieltsProgress.lastWord || 1);
let ieltsLibraryStatusFilter = "all";
let ieltsReviewConfig = { scope: "all", filter: "all", count: 10, modes: [...ALL_MODE_IDS] };
let ieltsReviewSelection = new Set();
let ieltsQuizSession = null;
let cachedSpeechVoices = [];
const dictionaryAudioCache = new Map();
const neuralAudioCache = new Map();
const neuralAudioPending = new Map();
const speechPreloadQueue = [];
const speechPreloadQueued = new Set();
let activePronunciationAudio = null;
let prefetchedPronunciation = null;
let activeSpeechRequest = 0;
let neuralSpeechRetryAfter = 0;
let speechPreloadRunning = 0;

function loadRailsCollapsed() {
  try { return localStorage.getItem("gre-rails-collapsed") === "1"; }
  catch { return false; }
}

function applyRailsCollapsed() {
  document.body.classList.toggle("rails-collapsed", railsCollapsed);
  if (!layoutModeButton) return;
  layoutModeButton.setAttribute("aria-pressed", String(railsCollapsed));
  layoutModeButton.setAttribute("aria-label", railsCollapsed ? "展开左右边栏" : "收起左右边栏，进入专注模式");
  layoutModeButton.title = railsCollapsed ? "显示边栏" : "专注模式";
  const label = layoutModeButton.querySelector("span");
  if (label) label.textContent = railsCollapsed ? "显示边栏" : "专注模式";
}

function defaultProgress() {
  return {
    version: 4,
    records: {},
    selectedSet: 1,
    selectedChapter: 1,
    lastWord: 1,
    setScores: {},
    quizHistory: [],
    recentQuestionWords: [],
  };
}

function makeRecord(number) {
  return {
    number,
    status: "new",
    bucket: null,
    favorite: false,
    reviews: 0,
    lapses: 0,
    lastRating: null,
    lastReviewedAt: null,
    lastSource: null,
    correctCount: 0,
    wrongCount: 0,
    testCorrect: 0,
    testTotal: 0,
    lastTestWrong: false,
    needsCorrection: false,
  };
}

function normalizeRecord(number, record = {}) {
  const rating = record.lastRating || null;
  const bucket = record.bucket || (rating ? rating.toLowerCase() : null);
  return {
    ...makeRecord(Number(number)),
    ...record,
    number: Number(number),
    bucket: ["again", "hard", "good", "easy"].includes(bucket) ? bucket : null,
    status: record.reviews > 0 || bucket ? "learned" : "new",
    favorite: Boolean(record.favorite),
    correctCount: Number(record.correctCount || record.testCorrect || 0),
    wrongCount: Number(record.wrongCount || Math.max(0, (record.testTotal || 0) - (record.testCorrect || 0))),
    needsCorrection: Boolean(record.needsCorrection ?? record.lastTestWrong ?? (Number(record.wrongCount || 0) > 0)),
  };
}

function defaultIeltsProgress() {
  return { version: 2, records: {}, lastWord: 1, quizHistory: [] };
}

function loadIeltsProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem(IELTS_PROGRESS_KEY) || localStorage.getItem(IELTS_PREVIEW_PROGRESS_KEY) || "null");
    if (!stored) return defaultIeltsProgress();
    const merged = { ...defaultIeltsProgress(), ...stored, records: {} };
    Object.entries(stored.records || {}).forEach(([number, record]) => {
      if (Number(number) >= 1 && Number(number) <= ieltsLessons.length) merged.records[number] = normalizeRecord(number, record);
    });
    merged.lastWord = Math.min(ieltsLessons.length, Math.max(1, Number(stored.lastWord || 1)));
    return merged;
  } catch {
    return defaultIeltsProgress();
  }
}

function getIeltsRecord(number) { return ieltsProgress.records[number] || null; }
function ensureIeltsRecord(number) {
  if (!ieltsProgress.records[number]) ieltsProgress.records[number] = makeRecord(number);
  return ieltsProgress.records[number];
}
function saveIeltsProgress() {
  localStorage.setItem(IELTS_PROGRESS_KEY, JSON.stringify(ieltsProgress));
  updateProgressUI();
}
function scheduleIeltsWord(number, rating, source = "lesson", outcome = null) {
  const record = ensureIeltsRecord(number);
  record.bucket = rating.toLowerCase();
  record.lastRating = rating;
  record.lastReviewedAt = new Date().toISOString();
  record.lastSource = source;
  record.status = "learned";
  record.reviews += 1;
  if (rating === "Again") record.lapses += 1;
  if (outcome === true) { record.correctCount += 1; record.needsCorrection = false; }
  if (outcome === false) { record.wrongCount += 1; record.needsCorrection = true; }
  return record;
}

function recordIeltsTestOutcome(number, correct, source = "review") {
  const record = ensureIeltsRecord(number);
  record.lastSource = source;
  record.lastTestedAt = new Date().toISOString();
  record.testTotal += 1;
  record.lastTestWrong = !correct;
  record.needsCorrection = !correct;
  if (correct) {
    record.correctCount += 1;
    record.testCorrect += 1;
  } else {
    record.wrongCount += 1;
  }
  return record;
}
function ieltsLearnedCount() { return ieltsLessons.filter((lesson) => getIeltsRecord(lesson.number)?.reviews).length; }
function ieltsBucketCount(bucket) { return ieltsLessons.filter((lesson) => getIeltsRecord(lesson.number)?.bucket === bucket).length; }
function ieltsFavoriteCount() { return ieltsLessons.filter((lesson) => getIeltsRecord(lesson.number)?.favorite).length; }
function ieltsWrongCount() { return ieltsLessons.filter((lesson) => getIeltsRecord(lesson.number)?.needsCorrection).length; }
function getIeltsLesson(number) { return ieltsLessons[Math.min(ieltsLessons.length, Math.max(1, Number(number))) - 1]; }
function getIeltsGroup(groupNumber) { return ieltsGroups[Math.min(ieltsGroups.length, Math.max(1, Number(groupNumber))) - 1]; }
function ieltsGroupForLesson(number) { return ieltsGroupById.get(getIeltsLesson(number).synonymGroupId) || ieltsGroups[0]; }
function ieltsGroupLessons(groupOrNumber) {
  const group = typeof groupOrNumber === "object" ? groupOrNumber : getIeltsGroup(groupOrNumber);
  return (group?.entryAppIds || []).map((appId) => getIeltsLesson(appId)).filter(Boolean);
}
function ieltsCategoryForLesson(number) { return Number(getIeltsLesson(number).source.category || 1); }
function ieltsCategories() { return [...new Set(ieltsLessons.map((lesson) => Number(lesson.source.category || 1)))].sort((a, b) => a - b); }
function ieltsCategoryCount() { return ieltsCategories().length; }
function ieltsCategoryLessons(category) { return ieltsLessons.filter((lesson) => ieltsCategoryForLesson(lesson.number) === Number(category)); }
function ieltsCategoryGroups(category) { return ieltsGroups.filter((group) => ieltsCategoryForLesson(group.primaryAppId) === Number(category)); }
function ieltsLessonsForScope(scope) {
  if (scope === "set") return ieltsGroupLessons(ieltsGroupForLesson(ieltsProgress.lastWord));
  if (scope === "chapter") return ieltsCategoryLessons(ieltsCategoryForLesson(ieltsProgress.lastWord));
  return [...ieltsLessons];
}
function ieltsLessonsForFilter(filter, source = ieltsLessons) {
  return source.filter((lesson) => {
    const record = getIeltsRecord(lesson.number);
    if (filter === "all") return true;
    if (filter === "wrong") return Boolean(record?.needsCorrection);
    if (["again", "hard", "good", "easy"].includes(filter)) return record?.bucket === filter;
    if (filter === "favorite") return Boolean(record?.favorite);
    if (filter === "learned") return (record?.reviews || 0) > 0;
    if (filter === "unlearned") return !record?.reviews;
    return false;
  });
}
function ieltsPracticeCandidates(config = ieltsReviewConfig) {
  return ieltsLessonsForFilter(config.filter, ieltsLessonsForScope(config.scope));
}
function ieltsScopeLabel(scope) {
  return ({ set: "当前原表组", chapter: "当前类别", all: "全部词库" })[scope] || scope;
}
function ieltsGroupRange(group) {
  const members = ieltsGroupLessons(group);
  if (!members.length) return "—";
  return members.length === 1 ? `${members[0].number}` : `${members[0].number}—${members.at(-1).number}`;
}

function loadProgress() {
  try {
    const v3 = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(PREVIOUS_STORAGE_KEY) || "null");
    if (v3) {
      const merged = { ...defaultProgress(), ...v3, records: {} };
      Object.entries(v3.records || {}).forEach(([number, record]) => { merged.records[number] = normalizeRecord(number, record); });
      merged.recentQuestionWords = normalizeRecentWords(v3.recentQuestionWords);
      return merged;
    }
    const v2 = JSON.parse(localStorage.getItem(V2_KEY) || "null");
    if (v2) {
      const migrated = { ...defaultProgress(), ...v2, version: 4, records: {} };
      Object.entries(v2.records || {}).forEach(([number, record]) => { migrated.records[number] = normalizeRecord(number, record); });
      migrated.recentQuestionWords = normalizeRecentWords(v2.recentQuestionWords);
      return migrated;
    }
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || "null");
    if (!legacy) return defaultProgress();
    const migrated = defaultProgress();
    for (const number of legacy.completed || []) {
      migrated.records[number] = normalizeRecord(number, { reviews: 1, lastRating: legacy.ratings?.[number] || "Good" });
    }
    migrated.lastWord = Math.min(lessons.length, Number(legacy.lastWord || 0) + 11);
    return migrated;
  } catch {
    return defaultProgress();
  }
}

function normalizeRecentWords(values = []) {
  const valid = new Set(lessons.map((lesson) => lesson.number));
  return [...new Set((Array.isArray(values) ? values : []).map(Number).filter((number) => valid.has(number)))].slice(0, 60);
}

function getRecord(number) { return progress.records[number] || null; }
function ensureRecord(number) {
  if (!progress.records[number]) progress.records[number] = makeRecord(number);
  return progress.records[number];
}

function saveProgress({ rail = true } = {}) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  updateProgressUI();
  if (rail) renderRail();
}

function rememberQuestionWords(questions) {
  const newest = [...new Set(questions.map((question) => Number(question.wordNumber)))].reverse();
  const selected = new Set(newest);
  progress.recentQuestionWords = [
    ...newest,
    ...normalizeRecentWords(progress.recentQuestionWords).filter((number) => !selected.has(number)),
  ].slice(0, Math.min(60, Math.max(20, lessons.length)));
}

function scheduleWord(number, rating, source = "lesson", outcome = null) {
  const record = ensureRecord(number);
  record.bucket = rating.toLowerCase();
  record.lastRating = rating;
  record.lastReviewedAt = new Date().toISOString();
  record.lastSource = source;
  record.status = "learned";
  record.reviews += 1;
  if (rating === "Again") record.lapses += 1;
  if (outcome === true) {
    record.correctCount += 1;
    if (rating !== "Again") {
      record.needsCorrection = false;
      record.lastTestWrong = false;
    }
  }
  if (outcome === false) {
    record.wrongCount += 1;
    record.needsCorrection = true;
  }
  return record;
}

function recordTestOutcome(number, correct, source = "review") {
  const record = ensureRecord(number);
  record.lastSource = source;
  record.lastTestedAt = new Date().toISOString();
  record.testTotal += 1;
  record.lastTestWrong = !correct;
  record.needsCorrection = !correct;
  if (correct) {
    record.correctCount += 1;
    record.testCorrect += 1;
  } else {
    record.wrongCount += 1;
  }
  return record;
}

function learnedCount() { return lessons.filter((lesson) => getRecord(lesson.number)?.reviews > 0).length; }
function bucketCount(bucket) { return lessons.filter((lesson) => getRecord(lesson.number)?.bucket === bucket).length; }
function favoriteCount() { return lessons.filter((lesson) => getRecord(lesson.number)?.favorite).length; }
function wrongCount() { return lessons.filter((lesson) => getRecord(lesson.number)?.needsCorrection).length; }
function reviewedTodayCount() {
  const today = new Date().toLocaleDateString("en-CA");
  return lessons.filter((lesson) => {
    const value = getRecord(lesson.number)?.lastReviewedAt;
    return value && new Date(value).toLocaleDateString("en-CA") === today;
  }).length;
}
function chapterCount() { return Math.ceil(lessons.length / 20); }
function chapterForSet(setId) { return Math.floor((Number(setId) - 1) / 4) + 1; }
function chapterForLesson(number) { return Math.floor((Number(number) - 1) / 20) + 1; }
function chapterSets(chapter) { return sets.slice((chapter - 1) * 4, chapter * 4); }
function chapterRange(chapter) {
  const first = (chapter - 1) * 20 + 1;
  const last = Math.min(chapter * 20, lessons.length);
  return `${first}—${last}`;
}

function bucketLabel(record) {
  if (!record?.bucket) return "未分组";
  const meta = BUCKET_META[record.bucket];
  return `${meta.label} · ${meta.zh}`;
}

function parseRoute() {
  const value = location.hash.replace(/^#\/?/, "") || "home";
  const parts = value.split("/");
  const corpus = parts[0] === "ielts" ? "ielts" : "gre";
  const [name, parameter] = corpus === "ielts" ? [parts[1] || "learn", parts[2]] : parts;
  if (corpus === "ielts") {
    if (name === "learn") return { corpus, name, number: Math.min(ieltsLessons.length, Math.max(1, Number(parameter) || ieltsProgress.lastWord)) };
    if (name === "story") return { corpus, name, groupNumber: Math.min(ieltsGroups.length, Math.max(1, Number(parameter) || ieltsGroupForLesson(ieltsProgress.lastWord).number)) };
    if (name === "test") return { corpus, name: "review" };
    if (name === "library") return { corpus, name, chapter: Math.min(ieltsCategoryCount(), Math.max(1, Number(parameter) || ieltsLibraryCategory)) };
    if (name === "review") return { corpus, name };
    return { corpus, name: "learn", number: ieltsProgress.lastWord };
  }
  if (name === "learn") return { name, number: clampNumber(Number(parameter) || progress.lastWord) };
  if (name === "story") return { name, setId: clampSet(Number(parameter) || progress.selectedSet) };
  if (name === "test") return { name: "review" };
  if (name === "library") return { name, chapter: clampChapter(Number(parameter) || progress.selectedChapter) };
  if (name === "review") return { name };
  return { name: "home" };
}

function clampNumber(number) { return Math.min(lessons.length, Math.max(1, number)); }
function clampSet(id) { return Math.min(sets.length, Math.max(1, id)); }
function clampChapter(id) { return Math.min(chapterCount(), Math.max(1, id)); }
function navigate(route, { replace = false } = {}) {
  const target = `#${route}`;
  if (location.hash === target) return render({ scroll: false });
  if (replace) history.replaceState({ route }, "", target);
  else history.pushState({ route }, "", target);
  render();
}

function activeSetId(route = parseRoute()) {
  if (route.name === "learn") return getSetForLesson(route.number)?.id || sets.at(-1).id;
  if (route.setId) return route.setId;
  return clampSet(progress.selectedSet);
}

function render({ forceRail = false, scroll = true } = {}) {
  const route = parseRoute();
  document.body.dataset.route = route.name;
  document.body.dataset.corpus = route.corpus || "gre";
  updateCorpusChrome(route);
  applyRailsCollapsed();
  if (route.corpus === "ielts") {
    renderIeltsApp(route, { scroll });
    return;
  }
  if (route.name === "learn") {
    if (progress.lastWord !== route.number) learningPanel = "memory";
    progress.lastWord = route.number;
    const currentSet = getSetForLesson(route.number);
    if (currentSet) progress.selectedSet = currentSet.id;
    progress.selectedChapter = chapterForLesson(route.number);
  } else if (route.setId) {
    progress.selectedSet = route.setId;
    progress.selectedChapter = chapterForSet(route.setId);
  } else if (route.name === "library") progress.selectedChapter = route.chapter;
  saveProgress({ rail: false });
  renderRail(forceRail);
  updateBottomNavigation(route);

  if (route.name === "learn") {
    const lesson = getLessonByNumber(route.number);
    app.innerHTML = renderLesson(route.number);
    queueSpeechPreload(lesson.word, { priority: true });
    scheduleNeighborPronunciationPreloads([
      route.number > 1 ? getLessonByNumber(route.number - 1).word : "",
      route.number < lessons.length ? getLessonByNumber(route.number + 1).word : "",
    ]);
  }
  else if (route.name === "story") app.innerHTML = renderStory(route.setId);
  else if (route.name === "test") app.innerHTML = renderTest(route.setId);
  else if (route.name === "review") app.innerHTML = reviewSession ? renderReviewSession() : renderReviewCenter();
  else if (route.name === "library") app.innerHTML = renderLibrary(route.chapter);
  else app.innerHTML = renderHome();

  renderContextRail(route);
  if (route.name === "learn") keepCurrentRailWordVisible();

  document.title = titleForRoute(route);
  if (scroll) window.scrollTo({ top: 0, behavior: "instant" });
  scheduleVisibleSpeechPreloads();
}

function titleForRoute(route) {
  if (route.name === "learn") return `${getLessonByNumber(route.number).word} · GRE 词汇精学`;
  if (route.name === "story") return `Story ${getSet(route.setId).range} · GRE 词汇精学`;
  if (route.name === "test") return `Test ${getSet(route.setId).range} · GRE 词汇精学`;
  if (route.name === "review") return "统一复习中心 · GRE 词汇精学";
  if (route.name === "library") return `词库 ${chapterRange(route.chapter)} · GRE 词汇精学`;
  return `GRE 词汇精学 · Words 1—${lessons.length}`;
}

function updateCorpusChrome(route) {
  const isIelts = route.corpus === "ielts";
  if (brandTitle) brandTitle.textContent = isIelts ? "雅思必背词 538" : "GRE 词汇精学";
  if (brandSubtitle) brandSubtitle.textContent = isIelts ? `标题 538 · ${ieltsLessons.length} 条源表记录` : `再要你命 3000 · ${lessons.length} 词`;
  if (brandMark) brandMark.textContent = isIelts ? "I" : "G";
  document.querySelectorAll("[data-action='select-corpus']").forEach((button) => button.classList.toggle("is-current", button.dataset.corpus === (isIelts ? "ielts" : "gre")));
  const search = document.querySelector("#global-search");
  if (search) search.placeholder = isIelts ? "搜索雅思单词、释义或替换词" : "搜索单词、中文释义或注解词";
}

function updateProgressUI() {
  const isIelts = parseRoute().corpus === "ielts";
  const learned = isIelts ? ieltsLearnedCount() : learnedCount();
  const total = isIelts ? ieltsLessons.length : lessons.length;
  if (!progressLabel || !progressFill) return;
  progressLabel.textContent = `${learned} / ${total}`;
  progressFill.style.width = `${total ? (learned / total) * 100 : 0}%`;
}

function renderRail(force = false) {
  const route = parseRoute();
  const reviewState = reviewSession ? `${reviewSession.index}:${reviewSession.answered}:${reviewSession.correct}:${reviewSession.questions.length}` : "idle";
  const routeSignature = `${route.corpus || "gre"}:${route.name}:${route.number || route.setId || route.chapter || 0}:${libraryQuery}:${libraryStatusFilter}:${librarySelectedNumber}:${reviewConfig.scope}:${reviewConfig.filter}:${reviewConfig.count}:${reviewConfig.modes.join(",")}:${reviewState}:${testConfig.scope}:${testConfig.filter}:${testConfig.count}:${testConfig.modes.join(",")}:${reviewSelection.size}:${learnedCount()}:${wrongCount()}:${favoriteCount()}`;
  if (!force && routeSignature === railSignature) return;
  railSignature = routeSignature;
  lessonList.dataset.renderCount = String(Number(lessonList.dataset.renderCount || 0) + 1);
  if (route.name === "library") lessonList.innerHTML = renderLibraryRail(route.chapter);
  else if (route.name === "review") lessonList.innerHTML = renderReviewRail();
  else if (route.name === "test") lessonList.innerHTML = renderTestRail(route.setId);
  else if (route.name === "story") lessonList.innerHTML = renderStoryRail(route.setId);
  else if (route.name === "home") lessonList.innerHTML = renderHomeRail();
  else lessonList.innerHTML = renderLearningRail(route);
}

function renderLearningRail(route) {
  if (route.number === lessons.length && !getSetForLesson(route.number)) {
    const lesson = getLessonByNumber(route.number);
    const record = getRecord(route.number);
    const chapter = chapterForLesson(route.number);
    return `<section class="rail-card current-set-card tail-lesson-card"><div class="rail-card-heading"><div><span class="rail-caption">INDEPENDENT TAIL</span><h2>尾词</h2></div><span class="rail-range">Word ${lesson.number}</span></div><div class="ielts-source-note"><strong>${lesson.word}</strong><span>3071 不是五的倍数，因此保留为独立词条，不虚构组员。</span></div><div class="rail-words"><button type="button" class="lesson-link ${record?.reviews ? "is-done" : ""} is-current" data-route="learn/${lesson.number}"><span class="lesson-num">${lesson.number}</span><span><strong>${lesson.word}</strong><small>${lesson.coreZh}</small></span><i aria-hidden="true"></i></button></div><div class="rail-set-actions"><button type="button" data-route="learn/${lesson.number - 1}">上一个词</button><button type="button" data-route="library/${chapter}">查看尾部章节</button></div></section><button class="rail-library-link" type="button" data-route="library/${chapter}">搜索全部 ${lessons.length} 词</button>`;
  }
  const currentSetId = activeSetId(route);
  const currentSet = getSet(currentSetId);
  const currentChapter = chapterForSet(currentSetId);
  const previousSet = currentSetId > 1 ? currentSetId - 1 : sets.length;
  const nextSet = currentSetId < sets.length ? currentSetId + 1 : 1;
  const learnedInSet = currentSet.lessons.filter((lesson) => getRecord(lesson.number)?.reviews).length;
  return `
    <section class="rail-card current-set-card">
      <div class="rail-card-heading"><div><span class="rail-caption">LEARNING PATH</span><h2>学习路径</h2></div><span class="rail-range">Set ${String(currentSet.id).padStart(2, "0")} · ${currentSet.range}</span></div>
      <div class="learning-scope-picker">
        <label><span>Chapter</span><select id="learning-chapter-select" aria-label="选择章节">${Array.from({ length: chapterCount() }, (_, index) => `<option value="${index + 1}" ${index + 1 === currentChapter ? "selected" : ""}>Chapter ${String(index + 1).padStart(2, "0")} · ${chapterRange(index + 1)}</option>`).join("")}</select></label>
        <label><span>Set</span><select id="learning-set-select" aria-label="选择五词组">${chapterSets(currentChapter).map((set) => `<option value="${set.id}" ${set.id === currentSetId ? "selected" : ""}>Set ${String(set.id).padStart(2, "0")} · ${set.range}</option>`).join("")}</select></label>
      </div>
      <div class="rail-words">${currentSet.lessons.map((lesson) => renderRailWord(lesson, route)).join("")}</div>
      <div class="rail-set-actions"><button type="button" data-route="story/${currentSet.id}">五词故事</button><button type="button" data-action="start-unit-review" data-set="${currentSet.id}">单元测试</button></div>
    </section>
    <div class="rail-set-switcher"><button type="button" data-action="select-set" data-set="${previousSet}" aria-label="上一组">←</button><button type="button" data-route="library/${chapterForSet(currentSet.id)}">查看本章</button><button type="button" data-action="select-set" data-set="${nextSet}" aria-label="下一组">→</button></div>
    <button class="rail-library-link" type="button" data-route="library/${chapterForSet(currentSet.id)}">搜索全部 ${lessons.length} 词</button>
    <div class="rail-set-progress"><span>本组进度</span><strong>${learnedInSet} / 5</strong><i><b style="width:${learnedInSet * 20}%"></b></i></div>`;
}

function renderLibraryRail(chapter) {
  const scope = lessons.filter((lesson) => chapterForLesson(lesson.number) === chapter);
  const statusRows = [
    ["all", "全部词", lessons.length, "library-dot-all"],
    ["unlearned", "未学习", lessonsForFilter("unlearned", lessons).length, "library-dot-new"],
    ["again", "Again", bucketCount("again"), "library-dot-again"],
    ["hard", "Hard", bucketCount("hard"), "library-dot-hard"],
    ["good", "Good", bucketCount("good"), "library-dot-good"],
    ["easy", "Easy", bucketCount("easy"), "library-dot-easy"],
    ["favorite", "收藏", favoriteCount(), "library-dot-favorite"],
  ];
  return `<section class="rail-page-heading"><span class="rail-caption">VOCABULARY</span><h2>词库</h2><p>Words 1—${lessons.length}</p></section>
    <section class="rail-nav-group"><h3>章节</h3><button class="rail-nav-row is-active" type="button" data-route="library/${chapter}"><span>全部本章</span><strong>${scope.length}</strong></button>${Array.from({ length: chapterCount() }, (_, index) => `<button class="rail-nav-row ${index + 1 === chapter ? "is-current" : ""}" type="button" data-route="library/${index + 1}"><span>Chapter ${index + 1}</span><strong>${chapterRange(index + 1)}</strong></button>`).join("")}</section>
    <section class="rail-nav-group"><h3>学习状态</h3>${statusRows.map(([key,label,count,dot]) => `<button class="rail-nav-row ${libraryStatusFilter === key ? "is-active" : ""}" type="button" data-action="library-filter" data-filter="${key}"><span><i class="${dot}"></i>${label}</span><strong>${count}</strong></button>`).join("")}</section>`;
}

function renderReviewRail() {
  if (reviewSession) {
    const complete = reviewSession.index >= reviewSession.questions.length;
    const percentage = reviewSession.answered ? Math.round((reviewSession.correct / reviewSession.answered) * 100) : 0;
    const roundMap = reviewSession.questions.map((item, index) => {
      const result = reviewSession.results[index];
      const state = result ? (result.correct ? "is-correct" : "is-wrong") : index === reviewSession.index && !complete ? "is-current" : "";
      return `<span class="${state}" aria-label="第 ${index + 1} 题${result ? (result.correct ? "，正确" : "，错误") : index === reviewSession.index ? "，当前" : "，未答"}">${index + 1}</span>`;
    }).join("");
    return `<section class="rail-page-heading review-round-heading"><span class="rail-caption">REVIEW ROUND</span><h2>${complete ? "本轮完成" : "检索练习中"}</h2><p>${complete ? `${reviewSession.correct}/${reviewSession.answered} 正确 · ${percentage}%` : `${reviewSession.index + 1}/${reviewSession.questions.length} 题`}</p></section><section class="rail-card test-config-summary"><dl><div><dt>清单</dt><dd>${filterLabel(reviewSession.config.filter)}</dd></div><div><dt>题型</dt><dd>${reviewSession.config.modes.length} 种</dd></div><div><dt>本轮错题</dt><dd>${reviewSession.answered - reviewSession.correct}</dd></div></dl></section><button class="rail-library-link" type="button" data-action="exit-review">退出本轮，返回清单</button><section class="review-round-map" aria-label="本轮题目进度"><h3>题目导航</h3><div>${roundMap}</div><p><span><i class="correct"></i>正确</span><span><i class="wrong"></i>错误</span><span><i class="current"></i>当前</span></p></section>`;
  }
  const rows = [["again","本轮重学",bucketCount("again")],["hard","困难词",bucketCount("hard")],["good","常规巩固",bucketCount("good")],["easy","快速巡检",bucketCount("easy")],["wrong","错题",wrongCount()],["favorite","收藏",favoriteCount()]];
  return `<section class="rail-page-heading"><span class="rail-caption">REVIEW</span><h2>复习中心</h2><p>按真实用途管理复习清单</p></section><section class="rail-nav-group review-buckets">${rows.map(([key,label,count]) => `<button type="button" class="rail-nav-row ${reviewConfig.filter === key ? "is-active" : ""}" data-action="practice-filter" data-kind="review" data-value="${key}"><span><i class="library-dot-${key}"></i>${label}</span><strong>${count}</strong></button>`).join("")}</section><button class="rail-library-link" type="button" data-action="practice-filter" data-kind="review" data-value="all">浏览全部词</button>`;
}

function renderTestRail(setId) {
  const set = getSet(setId);
  if (quizSession?.started && !quizSession?.finished) {
    return `<section class="rail-page-heading test-rail-heading"><span class="rail-caption">RANDOMIZED TEST</span><h2>随机测试</h2><p>配置已锁定，本轮结束后可调整</p></section>
      <section class="test-rail-locked" aria-label="本轮测试配置">
        ${renderLockedTestRow("范围", scopeLabel(quizSession.config.scope))}
        ${renderLockedTestRow("清单", filterLabel(quizSession.config.filter))}
        ${renderLockedTestRow("题量", `${quizSession.questions.length} 题`)}
        ${renderLockedTestRow("题型", `${quizSession.config.modes.length} 种混合`)}
      </section>
      <button class="button secondary wide test-rail-exit" type="button" data-action="exit-quiz">退出并重新配置</button>
      <section class="test-rail-tip"><strong>检索优先</strong><p>提交后只记录对错；错题自动进入错题集，不改变掌握度。</p></section>`;
  }
  return renderTestSetupRail(set);
}

function renderLockedTestRow(label, value) {
  return `<div><span>${label}</span><strong>${value}</strong></div>`;
}

function testRailIcon(kind) {
  const paths = {
    scope: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 9h8M8 13h5"/>',
    list: '<path d="M7 5h13M7 12h13M7 19h13"/><circle cx="3" cy="5" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="19" r="1"/>',
    count: '<circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/>',
    modes: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h5M8 17h3"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[kind]}</svg>`;
}

function renderTestRailSection(kind, label, value, buttons) {
  return `<details class="test-rail-section"><summary>${testRailIcon(kind)}<span><small>${label}</small><strong>${value}</strong></span><svg class="test-rail-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></summary><div class="test-rail-options">${buttons}</div></details>`;
}

function renderTestSetupRail(set) {
  const scopePool = lessonsForScope(testConfig.scope, set.id);
  const pool = practiceCandidates(testConfig, set.id);
  const count = effectiveQuestionCount(testConfig, pool);
  const modeSummary = testConfig.modes.length === ALL_MODE_IDS.length ? "全部 6 种混合" : `${testConfig.modes.length} 种题型`;
  const scopeButtons = PRACTICE_SCOPES.map(([key,label])=>`<button type="button" class="${testConfig.scope===key?"is-selected":""}" data-action="practice-scope" data-kind="test" data-value="${key}">${label}</button>`).join("");
  const filterButtons = REVIEW_FILTERS.map(([key,label])=>`<button type="button" class="${testConfig.filter===key?"is-selected":""}" data-action="practice-filter" data-kind="test" data-value="${key}">${label} · ${lessonsForFilter(key,scopePool).length}</button>`).join("");
  const countButtons = QUESTION_COUNTS.map(value=>`<button type="button" class="${testConfig.count===value?"is-selected":""}" data-action="practice-count" data-kind="test" data-value="${value}">${value||"全部"}</button>`).join("");
  const modeButtons = `<button type="button" class="${testConfig.modes.length===ALL_MODE_IDS.length?"is-selected":""}" data-action="practice-mode" data-kind="test" data-value="all">全部混合</button>${QUESTION_MODES.map(mode=>`<button type="button" class="${testConfig.modes.includes(mode.id)?"is-selected":""}" data-action="practice-mode" data-kind="test" data-value="${mode.id}">${mode.label}</button>`).join("")}`;
  return `<section class="rail-page-heading test-rail-heading"><span class="rail-caption">TEST SETUP</span><h2>随机测试</h2><p>Set ${String(set.id).padStart(2,"0")} · ${set.range}</p></section>
    <section class="test-rail-editor"><div class="test-rail-editor-head"><strong>配置本轮</strong><span>点击每项修改</span></div>
      ${renderTestRailSection("scope","范围",scopeLabel(testConfig.scope),scopeButtons)}
      ${renderTestRailSection("list","复习清单",`${filterLabel(testConfig.filter)} · ${pool.length}`,filterButtons)}
      ${renderTestRailSection("count","题量",`${count} 题`,countButtons)}
      ${renderTestRailSection("modes","题型",modeSummary,modeButtons)}
    </section>
    <section class="test-rail-summary"><strong>${pool.length} 个候选词</strong><span>预计 ${Math.max(2,Math.ceil(count*.55))}—${Math.max(3,Math.ceil(count*.85))} 分钟</span><p>弱词加权 · 同轮不重复</p></section>
    <button class="button wide rail-primary-action" type="button" data-action="start-quiz" data-set="${set.id}" ${count?"":"disabled"}>开始测试 ${count} 题 →</button>`;
}

function renderStoryRail(setId) {
  const set = getSet(setId);
  return `<section class="rail-page-heading"><span class="rail-caption">FIVE-WORD STORY</span><h2>Set ${String(set.id).padStart(2,"0")}</h2><p>${set.range}</p></section><section class="rail-card current-set-card"><div class="rail-words">${set.lessons.map((lesson) => renderRailWord(lesson, {name:"story"})).join("")}</div></section><button class="button wide rail-primary-action" type="button" data-action="start-unit-review" data-set="${set.id}">故事后复习</button>`;
}

function renderHomeRail() {
  const today = reviewedTodayCount();
  return `<section class="rail-page-heading"><span class="rail-caption">TODAY</span><h2>学习总览</h2><p>${today}/20 今日已完成</p></section><section class="rail-nav-group"><button class="rail-nav-row" type="button" data-route="learn/${progress.lastWord}"><span>继续学习</span><strong>→</strong></button><button class="rail-nav-row" type="button" data-route="review"><span>复习弱词</span><strong>${bucketCount("again") + bucketCount("hard")}</strong></button><button class="rail-nav-row" type="button" data-route="library/${progress.selectedChapter}"><span>浏览词库</span><strong>${lessons.length}</strong></button></section>`;
}

function renderRailWord(lesson, route) {
  const record = getRecord(lesson.number);
  const current = route.name === "learn" && route.number === lesson.number;
  return `<button type="button" class="lesson-link ${record?.reviews ? "is-done" : ""} ${current ? "is-current" : ""}" data-route="learn/${lesson.number}">
    <span class="lesson-num">${lesson.number}</span><span><strong>${lesson.word}</strong><small>${lesson.coreZh}</small></span><i aria-hidden="true"></i>
  </button>`;
}

function renderContextRail(route) {
  if (!contextRail) return;
  contextRail.classList.add("is-visible");
  if (route.name === "library") contextRail.innerHTML = renderLibraryContext();
  else if (route.name === "review") contextRail.innerHTML = renderReviewContext();
  else if (route.name === "test") contextRail.innerHTML = renderTestContext(route.setId);
  else if (route.name === "story") contextRail.innerHTML = renderStoryContext(route.setId);
  else if (route.name === "home") contextRail.innerHTML = renderHomeContext();
  else contextRail.innerHTML = renderLearningContext(route.number);
}

function renderLearningContext(number) {
  const lesson = getLessonByNumber(number);
  const set = getSetForLesson(number);
  const record = getRecord(number);
  const groupLessons = set?.lessons || [lesson];
  const setRecords = groupLessons.map((item) => getRecord(item.number));
  const learned = setRecords.filter((item) => item?.reviews > 0).length;
  const correct = setRecords.reduce((total, item) => total + Number(item?.correctCount || 0), 0);
  const weak = setRecords.filter((item) => item?.needsCorrection || ["again", "hard"].includes(item?.bucket)).length;
  const previous = number > 1 ? getLessonByNumber(number - 1) : null;
  const next = number < lessons.length ? getLessonByNumber(number + 1) : null;
  return `
    <nav class="context-card learning-pager-card" aria-label="切换单词">
      <div class="learning-pager-heading"><span class="rail-caption">WORD NAVIGATION</span><strong>${number} / ${lessons.length}</strong></div>
      <div class="learning-pager-buttons">
        <button type="button" ${previous ? `data-route="learn/${previous.number}"` : "disabled"} aria-label="${previous ? `上一个词 ${previous.word}` : "已经是第一个词"}"><span>← 上一个</span><strong>${previous?.word || "已到开头"}</strong></button>
        <button type="button" ${next ? `data-route="learn/${next.number}"` : "disabled"} aria-label="${next ? `下一个词 ${next.word}` : "已经是最后一个词"}"><span>下一个 →</span><strong>${next?.word || "已到结尾"}</strong></button>
      </div>
    </nav>
    <section class="context-card mastery-card">
      <div class="context-card-heading"><div><span class="rail-caption">MASTERY</span><h2>你记得怎么样？</h2></div><span title="评分会把词放进对应复习清单">?</span></div>
      <div class="context-rating-grid">${RATINGS.map((rating) => { const meta = BUCKET_META[rating.toLowerCase()]; const glyph = { Again: "↻", Hard: "▥", Good: "✓", Easy: "☆" }[rating]; return `<button type="button" class="context-rating rating-${rating.toLowerCase()} ${record?.lastRating === rating ? "is-selected" : ""}" data-action="rate" data-number="${lesson.number}" data-rating="${rating}"><span>${glyph}</span><strong>${rating}</strong><small>${meta.zh}</small></button>`; }).join("")}</div>
    </section>
    <section class="context-card quick-jump-card">
      <span class="rail-caption">CONTENT NAVIGATION</span>
      <nav aria-label="本词内容导航">
        ${renderLearningPanelButton("memory", "◉", "核心图像与记忆")}
        ${renderLearningPanelButton("usage", "∞", "核心用法与词组")}
        ${renderLearningPanelButton("context-examples", "“", "语境例句")}
        ${renderLearningPanelButton("comparison", "≠", "近义 / 反义对比")}
        ${renderLearningPanelButton("lookalikes", "Aa", "同根与形近词")}
        ${renderLearningPanelButton("recall", "?", "主动回忆")}
      </nav>
    </section>
    <section class="context-card learning-quick-actions">
      <span class="rail-caption">QUICK ACTIONS · ${set?.range || `WORD ${lesson.number}`}</span>
      <button type="button" data-action="toggle-favorite" data-number="${lesson.number}">${record?.favorite ? "★ 已收藏" : "☆ 收藏单词"}</button>
      <button type="button" data-action="reset-word" data-number="${lesson.number}">↻ 重置本词进度</button>
      <p>${set ? `本组已学 ${learned}/5` : `独立尾词 ${learned ? "已学习" : "未学习"}`} · 正确回忆 ${correct} · 弱词 ${weak}</p>
    </section>`;
}

function renderLearningPanelButton(panel, icon, label) {
  const current = learningPanel === panel;
  return `<button type="button" class="${current ? "is-current" : ""}" data-action="show-learning-panel" data-panel="${panel}" aria-pressed="${current}"><span>${icon}</span>${label}</button>`;
}

function renderLibraryContext() {
  const lesson = getLessonByNumber(librarySelectedNumber) || lessons[0];
  const record = getRecord(lesson.number);
  const hook = lesson.memory?.microZh || lesson.memory?.sceneZh || lesson.imageZh;
  const example = (lesson.senses || []).flatMap((sense) => sense.examples || [])[0] || lesson.comparisons?.[0]?.examples?.[0];
  return `<section class="context-card library-inspector">
    <div class="inspector-word-line"><div><span class="rail-caption">WORD ${lesson.number} · ${lesson.setId ? `SET ${String(lesson.setId).padStart(2,"0")}` : "INDEPENDENT TAIL"}</span><h2>${lesson.word}</h2></div><div class="inspector-actions">${speakButton(lesson.word, `朗读 ${lesson.word}`)}<button class="table-icon-button ${record?.favorite ? "is-active" : ""}" type="button" data-action="toggle-favorite" data-number="${lesson.number}" aria-label="${record?.favorite ? "取消收藏" : "收藏"}">${record?.favorite ? "★" : "☆"}</button></div></div>
    <p class="inspector-pronunciation">${lesson.ipa} · ${lesson.pos}</p>
    <div class="inspector-section"><h3>中文核心释义</h3><p>${lesson.coreZh}</p></div>
    <div class="inspector-section"><h3>记忆钩子</h3><p>${hook}</p></div>
    ${example ? `<div class="inspector-section inspector-example"><h3>双语例句</h3><p lang="en">${example.en}</p><p>${example.zh}</p>${speakButton(example.en, "朗读例句")}</div>` : ""}
    <div class="inspector-section"><h3>当前掌握度</h3><span class="mastery-pill mastery-${record?.bucket || "new"}">${record ? bucketLabel(record) : "未学习"}</span><p>${record ? `复习 ${record.reviews} 次 · 正确 ${record.correctCount} · 错误 ${record.wrongCount}` : "尚无学习记录"}</p></div>
    <button class="button wide" type="button" data-route="learn/${lesson.number}">开始学习</button>
    ${record ? `<button class="button secondary wide" type="button" data-action="reset-word" data-number="${lesson.number}">重置掌握度</button>` : ""}
  </section>`;
}

function renderReviewContext() {
  if (reviewSession) {
    const complete = reviewSession.index >= reviewSession.questions.length;
    const answered = reviewSession.answered;
    const rate = answered ? Math.round((reviewSession.correct / answered) * 100) : 0;
    const question = reviewSession.questions[reviewSession.index];
    const hasAnswer = !complete && reviewSession.selected !== null;
    const feedback = hasAnswer ? `<section class="context-card test-answer-card ${isQuestionCorrect(question, reviewSession.selected) ? "is-correct" : "is-wrong"}"><span class="rail-caption">ANSWER EXPLANATION · 答案解析</span>${renderQuestionFeedback(question, reviewSession.selected)}</section>` : "";
    const next = hasAnswer ? `<section class="context-card test-next-card"><p class="context-copy">${isQuestionCorrect(question, reviewSession.selected) ? "答对了：掌握度保持不变。" : "已自动加入错题集，掌握度保持不变。"}</p><button class="button wide" type="button" data-action="next-review-question">${reviewSession.index === reviewSession.questions.length - 1 ? "查看结果 →" : "下一题 →"}</button></section>` : "";
    return `${feedback}${next}<section class="context-card test-live-card"><span class="rail-caption">LIVE REVIEW</span><div class="test-score"><strong>${rate}%</strong><span>正确率</span></div><dl><div><dt>已答</dt><dd>${answered}</dd></div><div><dt>正确</dt><dd>${reviewSession.correct}</dd></div><div><dt>错误</dt><dd>${answered - reviewSession.correct}</dd></div><div><dt>剩余</dt><dd>${Math.max(0, reviewSession.questions.length - answered)}</dd></div></dl></section><section class="context-card"><span class="rail-caption">QUESTION MAP</span><div class="question-map">${reviewSession.questions.map((item,index)=>{ const result=reviewSession.results[index]; return `<span class="${result ? (result.correct ? "is-complete" : "is-complete is-wrong") : index === reviewSession.index && !complete ? "is-current" : ""}">${index+1}</span>`; }).join("")}</div><div class="question-map-legend"><span><i class="correct"></i>正确</span><span><i class="wrong"></i>错误</span><span><i class="current"></i>当前</span></div></section>`;
  }
  const pool = practiceCandidates(reviewConfig, progress.selectedSet);
  const selectedCount = reviewSelection.size;
  const counts = RATINGS.map((rating) => [rating, pool.filter((lesson) => getRecord(lesson.number)?.bucket === rating.toLowerCase()).length]);
  const total = Math.max(1, counts.reduce((sum,[,count])=>sum+count,0));
  return `<section class="context-card queue-summary-card"><span class="rail-caption">QUEUE SUMMARY</span><div class="queue-total"><strong>${selectedCount || pool.length}</strong><span>/ ${pool.length} 候选词</span></div><p>预计用时 ${Math.max(2, Math.ceil((selectedCount || effectiveQuestionCount(reviewConfig,pool)) * 0.55))}—${Math.max(4, Math.ceil((selectedCount || effectiveQuestionCount(reviewConfig,pool)) * 0.9))} 分钟</p><div class="queue-distribution">${counts.map(([label,count]) => `<span class="distribution-${label.toLowerCase()}" style="width:${(count/total)*100}%" title="${label} ${count}"></span>`).join("")}</div><div class="queue-breakdown">${counts.map(([label,count]) => `<div><span>${label}</span><strong>${count}</strong></div>`).join("")}</div></section>
    <section class="context-card"><span class="rail-caption">SELECTED MODES</span><div class="selected-mode-list">${QUESTION_MODES.filter((mode)=>reviewConfig.modes.includes(mode.id)).map((mode)=>`<span>${mode.label}</span>`).join("")}</div></section>
    <section class="context-card bulk-card"><span class="rail-caption">BULK ACTIONS</span><button type="button" class="button secondary wide" data-action="select-review-page">全选当前列表</button><button type="button" class="button secondary wide" data-action="clear-review-selection">清空选择</button></section>
    <section class="context-card review-rule-card"><span class="rail-caption">SELECTION RULES</span><p class="context-copy">弱词加权、同轮不重复。手动勾选时，以所选单词为本轮范围。</p></section>`;
}

function renderTestContext(setId) {
  const set = getSet(setId);
  if (!quizSession?.started) {
    const pool = practiceCandidates(testConfig,set.id);
    return `<section class="context-card queue-summary-card"><span class="rail-caption">TEST PREVIEW</span><div class="queue-total"><strong>${effectiveQuestionCount(testConfig,pool)}</strong><span>题</span></div><p>${scopeLabel(testConfig.scope)} · ${modeLabelList(testConfig.modes)}</p><div class="queue-breakdown"><div><span>候选词</span><strong>${pool.length}</strong></div><div><span>近期降权</span><strong>${progress.recentQuestionWords.length}</strong></div></div></section><section class="context-card"><span class="rail-caption">HOW IT WORKS</span><p class="context-copy">同轮单词不重复；错题自动进入错题集，答对与答错都不会改变 Again / Hard / Good / Easy。</p></section>`;
  }
  const answered = quizSession.index + (quizSession.selected !== null ? 1 : 0);
  const wrong = answered - quizSession.score;
  const currentQuestion = quizSession.questions[quizSession.index];
  const hasAnswer = quizSession.selected !== null;
  const answerFeedback = hasAnswer
    ? `<section class="context-card test-answer-card ${isQuestionCorrect(currentQuestion, quizSession.selected) ? "is-correct" : "is-wrong"}"><span class="rail-caption">ANSWER EXPLANATION · 答案解析</span>${renderQuestionFeedback(currentQuestion, quizSession.selected)}</section>`
    : "";
  const next = hasAnswer ? `<section class="context-card test-next-card"><p class="context-copy">${isQuestionCorrect(currentQuestion, quizSession.selected) ? "答对了：掌握度保持不变。" : "已自动加入错题集，掌握度保持不变。"}</p><button class="button wide" type="button" data-action="next-question">${quizSession.index === quizSession.questions.length - 1 ? "查看结果 →" : "下一题 →"}</button></section>` : "";
  return `${answerFeedback}${next}<section class="context-card test-live-card"><span class="rail-caption">LIVE TEST</span><div class="test-score"><strong>${answered ? Math.round((quizSession.score/answered)*100) : 0}%</strong><span>正确率</span></div><dl><div><dt>已答</dt><dd>${answered}</dd></div><div><dt>正确</dt><dd>${quizSession.score}</dd></div><div><dt>错误</dt><dd>${wrong}</dd></div><div><dt>剩余</dt><dd>${quizSession.questions.length - answered}</dd></div></dl></section><section class="context-card"><span class="rail-caption">QUESTION MAP</span><div class="question-map">${quizSession.questions.map((question,index)=>{ const result=quizSession.results[question.wordNumber]; const done=index < quizSession.index || (index === quizSession.index && quizSession.selected !== null); const correct=Boolean(result && result.correct === result.total); return `<span class="${done ? (correct ? "is-complete" : "is-complete is-wrong") : index === quizSession.index ? "is-current" : ""}">${index+1}</span>`; }).join("")}</div><div class="question-map-legend"><span><i class="correct"></i>正确</span><span><i class="wrong"></i>错误</span><span><i class="current"></i>当前</span></div></section>`;
}

function renderStoryContext(setId) {
  const set = getSet(setId);
  const learned = set.lessons.filter((lesson)=>getRecord(lesson.number)?.reviews).length;
  return `<section class="context-card"><span class="rail-caption">STORY GOAL</span><h2 class="context-title">把五个主词串成一条记忆链</h2><p class="context-copy">故事只使用本组五个主词作为目标词，不把注解词混入串词。</p></section><section class="context-card session-card"><span class="rail-caption">SET PROGRESS</span><dl><div><dt>已学</dt><dd>${learned}/5</dd></div><div><dt>故事</dt><dd>1 篇</dd></div><div><dt>复习</dt><dd>5 题</dd></div></dl><button class="button wide" type="button" data-action="start-unit-review" data-set="${set.id}">开始故事后复习</button></section>`;
}

function renderHomeContext() {
  return `<section class="context-card progress-context-card"><span class="rail-caption">TODAY'S PROGRESS</span><div class="context-progress-value"><strong>${reviewedTodayCount()}</strong><span>/ 20</span></div><span class="rail-progress-track"><span style="width:${Math.min(100,(reviewedTodayCount()/20)*100)}%"></span></span></section><section class="context-card session-card"><span class="rail-caption">LIBRARY STATUS</span><dl><div><dt>已学</dt><dd>${learnedCount()}</dd></div><div><dt>困难/重学</dt><dd>${bucketCount("again")+bucketCount("hard")}</dd></div><div><dt>错题</dt><dd>${wrongCount()}</dd></div><div><dt>收藏</dt><dd>${favoriteCount()}</dd></div></dl></section>`;
}

function updateBottomNavigation(route) {
  document.querySelectorAll(".nav-item").forEach((button) => {
    const target = button.dataset.route;
    const active = (target === "learn" && ["home", "learn"].includes(route.name)) || target === route.name;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });
}

function renderHome() {
  const nextNew = lessons.find((lesson) => !getRecord(lesson.number)?.reviews)?.number || progress.lastWord;
  const best = Object.values(progress.setScores).length ? Math.max(...Object.values(progress.setScores)) : 0;
  const weak = bucketCount("hard") + bucketCount("again");
  const currentSet = getSetForLesson(nextNew);
  const focusLessons = currentSet?.lessons || [getLessonByNumber(nextNew)];
  const focusLabel = currentSet ? `Set ${String(currentSet.id).padStart(2,"0")}` : "Independent tail";
  return `<section class="view home-workspace">
    <header class="workspace-header"><div><p class="eyebrow">再要你命 3000 · WORDS 1—${lessons.length}</p><h1>今天学什么</h1><p>学习与复习回到同一个目标：把词义真正提取出来。</p></div><span class="workspace-note">${reviewedTodayCount()}/20 今日完成</span></header>
    <section class="home-focus-panel"><div class="home-focus-copy"><span class="rail-caption">CONTINUE LEARNING</span><p class="home-focus-index">Word ${nextNew} · ${focusLabel}</p><h2>${getLessonByNumber(nextNew).word}</h2><p>${getLessonByNumber(nextNew).coreZh}</p><span class="rail-progress-track"><span style="width:${Math.min(100,(learnedCount()/lessons.length)*100)}%"></span></span><div class="home-focus-actions"><button class="button" type="button" data-route="learn/${nextNew}">继续学习 →</button>${currentSet ? `<button class="button secondary" type="button" data-route="story/${currentSet.id}">查看本组故事</button>` : `<button class="button secondary" type="button" data-route="library/${chapterForLesson(nextNew)}">查看尾部章节</button>`}</div></div><div class="home-set-preview">${focusLessons.map((lesson,index)=>`<button type="button" class="${lesson.number === nextNew ? "is-current" : ""}" data-route="learn/${lesson.number}"><span>${String(index+1).padStart(2,"0")}</span><strong>${lesson.word}</strong><small>${getRecord(lesson.number)?.reviews ? "已学" : "待学"}</small></button>`).join("")}</div></section>
    <div class="home-metric-strip"><article><span>已学</span><strong>${learnedCount()}</strong><small>/ ${lessons.length}</small></article><article><span>待重学</span><strong>${bucketCount("again")}</strong><small>Again</small></article><article><span>困难词</span><strong>${bucketCount("hard")}</strong><small>Hard</small></article><article><span>复习最佳</span><strong>${best ? `${best}%` : "—"}</strong><small>单元最高分</small></article></div>
    <div class="home-dashboard-grid"><section class="home-priority-panel"><div class="panel-heading"><div><span class="rail-caption">REVIEW PRIORITIES</span><h2>现在最值得复习</h2></div><button class="button secondary" type="button" data-route="review">打开复习中心</button></div><div class="priority-list"><button type="button" data-route="review"><i class="library-dot-again"></i><span><strong>本轮重学</strong><small>Again 词优先提取</small></span><b>${bucketCount("again")}</b></button><button type="button" data-route="review"><i class="library-dot-hard"></i><span><strong>困难词</strong><small>需要更多语境辨析</small></span><b>${bucketCount("hard")}</b></button><button type="button" data-route="review"><i class="library-dot-wrong"></i><span><strong>错题词</strong><small>练习中暴露的薄弱点</small></span><b>${wrongCount()}</b></button><button type="button" data-route="review"><i class="library-dot-favorite"></i><span><strong>收藏词</strong><small>你主动留下的词</small></span><b>${favoriteCount()}</b></button></div></section><section class="home-chapter-panel"><div class="panel-heading"><div><span class="rail-caption">CHAPTER PROGRESS</span><h2>章节进度</h2></div><button class="button secondary" type="button" data-route="library/${progress.selectedChapter}">打开词库</button></div><div class="chapter-progress-list">${Array.from({length:chapterCount()},(_,index)=>renderChapterProgressRow(index+1)).join("")}</div></section></div>
  </section>`;
}

function renderChapterProgressRow(chapter) {
  const start = (chapter - 1) * 20;
  const pool = lessons.slice(start, start + 20);
  const learned = pool.filter((lesson)=>getRecord(lesson.number)?.reviews).length;
  return `<button type="button" data-route="library/${chapter}"><span>Chapter ${String(chapter).padStart(2,"0")}</span><i><b style="width:${(learned/pool.length)*100}%"></b></i><strong>${learned}/${pool.length}</strong></button>`;
}

function renderChapterCard(chapter) {
  const first = (chapter - 1) * 20 + 1;
  const chapterLessons = lessons.slice(first - 1, first + 19);
  const learned = chapterLessons.filter((lesson) => getRecord(lesson.number)?.reviews).length;
  return `<button type="button" class="overview-card ${learned === chapterLessons.length ? "is-done" : ""}" data-route="library/${chapter}"><small>CHAPTER ${String(chapter).padStart(2, "0")}</small><h2>${chapterRange(chapter)}</h2><p>${learned}/${chapterLessons.length} 已学 · ${chapterSets(chapter).length} 个单元</p></button>`;
}

function renderLibrary(chapter) {
  const chapterPool = libraryQuery ? lessons : lessons.filter((lesson) => chapterForLesson(lesson.number) === chapter);
  const queryPool = libraryQuery ? chapterPool.filter(matchesLibraryQuery) : chapterPool;
  const source = libraryStatusFilter === "all" ? queryPool : lessonsForFilter(libraryStatusFilter, queryPool);
  if (!source.some((lesson) => lesson.number === librarySelectedNumber) && source[0]) librarySelectedNumber = source[0].number;
  return `<section class="view library-workspace">
    <header class="workspace-header"><div><p class="eyebrow">VOCABULARY LIBRARY</p><h1>词库</h1><p>${libraryQuery ? `全库搜索结果` : `Chapter ${chapter} · ${chapterRange(chapter)}`} · ${source.length} 个单词</p></div><button class="button secondary" type="button" data-route="learn/${librarySelectedNumber}">打开选中词</button></header>
    <div class="library-toolbar"><label class="library-status-select"><span>状态</span><select id="library-status-select" aria-label="按学习状态筛选">${[["all","全部状态"],["unlearned","未学习"],["again","Again"],["hard","Hard"],["good","Good"],["easy","Easy"],["favorite","收藏"]].map(([key,label])=>`<option value="${key}" ${libraryStatusFilter===key?"selected":""}>${label}</option>`).join("")}</select></label><label class="workspace-search" for="library-search"><span>⌕</span><input id="library-search" type="search" value="${escapeAttribute(libraryQuery)}" placeholder="搜索单词、中文释义或注解词"></label><span class="result-count">${source.length} / ${lessons.length}</span><button type="button" class="button secondary library-export" data-action="export-library">↓ 导出</button></div>
    ${source.length ? `<div class="data-table-shell library-table-shell"><table class="vocab-table"><thead><tr><th>#</th><th>单词</th><th>中文核心释义</th><th>单元</th><th>掌握程度</th><th>收藏</th><th>操作</th></tr></thead><tbody>${source.map(renderLibraryRow).join("")}</tbody></table></div>` : `<div class="empty-state"><strong>?</strong><h2>没有匹配结果</h2><p>可更换章节、状态或搜索词。</p></div>`}
  </section>`;
}

function renderLibraryRow(lesson) {
  const record = getRecord(lesson.number);
  const selected = lesson.number === librarySelectedNumber;
  return `<tr class="${selected ? "is-selected" : ""}" data-action="select-library-word" data-number="${lesson.number}"><td>${lesson.number}</td><td><button type="button" class="table-word" data-action="select-library-word" data-number="${lesson.number}">${lesson.word}</button><small>${lesson.pos}</small></td><td>${lesson.coreZh}</td><td>${lesson.setId ? `SET ${String(lesson.setId).padStart(2,"0")}` : "尾词"}</td><td><span class="mastery-pill mastery-${record?.bucket || "new"}">${record ? BUCKET_META[record.bucket]?.label || "Learned" : "未学习"}</span></td><td><button type="button" class="table-icon-button ${record?.favorite ? "is-active" : ""}" data-action="toggle-favorite" data-number="${lesson.number}" aria-label="${record?.favorite ? "取消收藏" : "收藏"}">${record?.favorite ? "★" : "☆"}</button></td><td><button type="button" class="table-more" data-route="learn/${lesson.number}" aria-label="打开 ${lesson.word}">•••</button></td></tr>`;
}

function matchesLibraryQuery(lesson) {
  const query = libraryQuery.trim().toLowerCase();
  if (!query) return true;
  const annotations = (lesson.comparisons || []).map((item) => `${item.word} ${item.meaningZh}`).join(" ");
  return `${lesson.word} ${lesson.coreEn} ${lesson.coreZh} ${lesson.rawNote || ""} ${annotations}`.toLowerCase().includes(query);
}

function groupLessonsBySet(subset) {
  return sets.map((set) => ({ set, lessons: subset.filter((lesson) => lesson.setId === set.id) })).filter((group) => group.lessons.length);
}

function renderMobileGreLearningScope(lesson, set) {
  const chapter = chapterForLesson(lesson.number);
  const chapterSetOptions = chapterSets(chapter).map((item) => `<option value="${item.id}" ${item.id === set?.id ? "selected" : ""}>Set ${String(item.id).padStart(2, "0")} · ${item.range}</option>`).join("");
  const tailOption = set ? "" : `<option value="" selected disabled>独立尾词 · Word ${lesson.number}</option>`;
  return `<section class="mobile-learning-scope" aria-label="选择 GRE 学习章节和单元">
    <label><span>章节</span><select id="mobile-learning-chapter-select" aria-label="选择 GRE 章节">${Array.from({ length: chapterCount() }, (_, index) => `<option value="${index + 1}" ${index + 1 === chapter ? "selected" : ""}>Chapter ${String(index + 1).padStart(2, "0")} · ${chapterRange(index + 1)}</option>`).join("")}</select></label>
    <label><span>五词组</span><select id="mobile-learning-set-select" aria-label="选择 GRE 五词组">${tailOption}${chapterSetOptions}</select></label>
  </section>`;
}

function renderMobileIeltsLearningScope(lesson) {
  const category = ieltsCategoryForLesson(lesson.number);
  const group = ieltsGroupForLesson(lesson.number);
  return `<section class="mobile-learning-scope" aria-label="选择雅思类别和原表分组">
    <label><span>类别</span><select id="mobile-ielts-learning-category-select" aria-label="选择雅思类别">${ieltsCategories().map((item) => `<option value="${item}" ${item === category ? "selected" : ""}>第 ${item} 类 · ${ieltsCategoryLessons(item).length} 词</option>`).join("")}</select></label>
    <label><span>原表组</span><select id="mobile-ielts-learning-group-select" aria-label="选择雅思原表分组">${ieltsCategoryGroups(category).map((item) => `<option value="${item.number}" ${item.number === group.number ? "selected" : ""}>第 ${String(item.number).padStart(3, "0")} 组 · ${ieltsGroupRange(item)}</option>`).join("")}</select></label>
  </section>`;
}

function renderMobileLearningDock(lesson, record, { ielts = false } = {}) {
  const total = ielts ? ieltsLessons.length : lessons.length;
  const ratingAction = ielts ? "rate-ielts" : "rate";
  const previous = lesson.number > 1 ? lesson.number - 1 : null;
  const next = lesson.number < total ? lesson.number + 1 : null;
  return `<nav class="mobile-learning-dock" aria-label="单词翻页和掌握度">
    <button class="mobile-word-turn" type="button" ${previous ? `data-route="learn/${previous}"` : "disabled"} aria-label="${previous ? "上一个词" : "已经是第一个词"}"><span>←</span><small>上词</small></button>
    <div class="mobile-rating-strip" aria-label="选择掌握程度">${RATINGS.map((rating) => { const meta = BUCKET_META[rating.toLowerCase()]; return `<button type="button" class="mobile-dock-rating rating-${rating.toLowerCase()} ${record?.lastRating === rating ? "is-selected" : ""}" data-action="${ratingAction}" data-number="${lesson.number}" data-rating="${rating}" aria-label="${rating}，${meta.zh}"><strong>${rating}</strong><small>${meta.zh.replace("优先重学", "重学").replace("常规巩固", "巩固").replace("快速巡检", "巡检")}</small></button>`; }).join("")}</div>
    <button class="mobile-word-turn" type="button" ${next ? `data-route="learn/${next}"` : `data-route="review"`} aria-label="${next ? "下一个词" : "进入复习"}"><span>${next ? "→" : "✓"}</span><small>${next ? "下词" : "复习"}</small></button>
  </nav>`;
}

function renderLesson(number) {
  const lesson = getLessonByNumber(number);
  const set = getSetForLesson(number);
  const record = getRecord(number);
  const previousRoute = number > 1 ? `learn/${number - 1}` : "home";
  return `<article class="view word-page">${renderMobileGreLearningScope(lesson, set)}${renderStepper(set, number)}
    <header class="word-hero" data-letter="${lesson.word[0].toUpperCase()}">
      <div class="word-topbar"><button type="button" data-route="${previousRoute}">‹ 上一个</button><div><button type="button" data-action="toggle-favorite" data-number="${number}">${record?.favorite ? "★ 已收藏" : "☆ 收藏"}</button><button type="button" data-action="reset-word" data-number="${number}">↻ 重置</button></div></div>
      <div class="word-line"><h1 class="word-title">${lesson.word}</h1>${speakButton(lesson.word, `朗读 ${lesson.word}`, true)}</div>
      <div class="pronunciation"><strong>${lesson.ipa}</strong><span>${lesson.pos}</span><span>${lesson.register || ""}</span></div>
      <p class="core-definition">${lesson.coreEn}</p><p class="core-cn">${lesson.coreZh}</p>
      <div class="word-status-line"><span class="mastery-pill mastery-${record?.bucket || "new"}">${record?.bucket ? BUCKET_META[record.bucket].label : "NEW"}</span><span>${record ? `复习 ${record.reviews} 次 · 对 ${record.correctCount} / 错 ${record.wrongCount}` : `WORD ${lesson.number} · ${set ? `SET ${String(set.id).padStart(2,"0")}` : "INDEPENDENT TAIL"}`}</span></div>
    </header>
    ${renderLearningOutline()}
    <div class="learning-panel-stack">
      <section class="learning-panel learning-memory-panel ${learningPanel === "memory" ? "is-active" : ""}" data-learning-panel="memory">
        <section class="anchor-card" id="core-image"><span class="anchor-icon" aria-hidden="true">◎</span><div><h2>核心图像</h2><p>${lesson.imageZh}</p></div></section>
        ${renderMemory(lesson)}
      </section>
      ${renderUsagePanel(lesson)}
      ${renderExamplesPanel(lesson)}
      ${renderComparisonSection(lesson)}${renderLookalikeSection(lesson)}${renderRecall(lesson)}
    </div>
    <section class="rating-panel"><h2>你刚才回忆得怎么样？</h2><p>评分后单词立即进入对应清单；Again / Hard 会提高后续轮次中的抽取权重。</p><div class="rating-grid">${RATINGS.map((rating) => { const meta = BUCKET_META[rating.toLowerCase()]; return `<button type="button" class="rating-button ${record?.lastRating === rating ? "is-selected" : ""}" data-action="rate" data-number="${number}" data-rating="${rating}"><strong>${rating}</strong><small>${meta.zh}</small></button>`; }).join("")}</div></section>
    <nav class="page-actions" aria-label="单词翻页"><button class="button secondary" type="button" data-route="${number > 1 ? `learn/${number - 1}` : "home"}">← ${number > 1 ? "上一个词" : "首页"}</button>${number >= lessons.length ? `<button class="button" type="button" data-route="review">进入全库复习 →</button>` : `<button class="button" type="button" data-route="${number % 5 === 0 && set ? `story/${set.id}` : `learn/${number + 1}`}">${number % 5 === 0 && set ? "五词故事" : "下一个词"} →</button>`}</nav>
    ${renderMobileLearningDock(lesson, record)}
  </article>`;
}

function learningPanelClasses(panel, extra = "") {
  return `learning-panel ${extra} ${learningPanel === panel ? "is-active" : ""}`.trim();
}

function renderUsagePanel(lesson) {
  return `<section class="${learningPanelClasses("usage", "section-card usage-panel")}" id="usage" data-learning-panel="usage"><div class="section-heading"><span class="section-number">∞</span><div><h2>核心用法与词组</h2><p>每个语义紧跟对应词组；点击词组展开双语例句并朗读。</p></div></div><div class="usage-sense-stack">${(lesson.senses || []).map((sense, senseIndex) => `<section class="usage-sense"><header><span>${senseIndex + 1}</span><div><h3>${sense.title}</h3><p>${sense.explanation}</p><small>${sense.label}</small></div></header><div class="phrase-grid">${(sense.collocations || []).map((item, phraseIndex) => renderPhrase(item, `${lesson.number}-${senseIndex}-${phraseIndex}`)).join("")}</div></section>`).join("")}</div></section>`;
}

function lessonExamples(lesson) {
  const examples = (lesson.senses || []).flatMap((sense) => sense.examples?.length ? sense.examples : (sense.collocations || []).map((item) => item.example).filter(Boolean).slice(0, 2));
  return examples.filter((item, index) => examples.findIndex((candidate) => candidate.en === item.en) === index);
}

function renderExamplesPanel(lesson) {
  return `<section class="${learningPanelClasses("context-examples", "section-card examples-panel")}" id="context-examples" data-learning-panel="context-examples"><div class="section-heading"><span class="section-number">“</span><div><h2>语境例句</h2><p>在完整语境中确认词义、搭配与语气。</p></div></div><div class="panel-example-grid">${lessonExamples(lesson).map(renderExample).join("")}</div></section>`;
}

function renderLearningOutline() {
  const rows = [
    ["∞", "核心用法与词组", "usage"],
    ["“", "语境例句", "context-examples"],
    ["≠", "近义 / 反义对比", "comparison"],
    ["Aa", "同根与形近词", "lookalikes"],
    ["?", "主动回忆", "recall"],
  ];
  return `<nav class="learning-outline" aria-label="学习内容大纲">${rows.map(([icon,label,target])=>`<button type="button" data-action="scroll-section" data-target="${target}"><span>${icon}</span><strong>${label}</strong><i>⌄</i></button>`).join("")}</nav>`;
}

function renderStepper(set, currentNumber) {
  if (!set) return `<div class="mobile-stepper tail-stepper" aria-label="独立尾词"><button class="step-dot is-current ${getRecord(currentNumber)?.reviews ? "is-done" : ""}" type="button" data-route="learn/${currentNumber}" aria-label="第 ${currentNumber} 词"></button></div>`;
  return `<div class="mobile-stepper" aria-label="本组单词进度">${set.lessons.map((lesson) => `<button class="step-dot ${lesson.number === currentNumber ? "is-current" : ""} ${getRecord(lesson.number)?.reviews ? "is-done" : ""}" type="button" data-route="learn/${lesson.number}" aria-label="第 ${lesson.number} 词 ${lesson.word}"></button>`).join("")}</div>`;
}

function renderSense(senseItem, index, number) {
  const visibleExamples = senseItem.examples?.length
    ? senseItem.examples
    : (senseItem.collocations || []).map((item) => item.example).filter(Boolean).slice(0, 2);
  return `<section class="section-card" id="${index === 0 ? "core-use" : `sense-${index + 1}`}"><div class="section-heading"><span class="section-number">${String(index + 1).padStart(2, "0")}</span><div><h2>核心用法 · ${senseItem.title}</h2><p>${senseItem.explanation}</p></div></div><p class="sense-label">${senseItem.label}</p><div class="phrase-grid" ${index === 0 ? `id="common-phrases"` : ""}>${(senseItem.collocations || []).map((item, phraseIndex) => renderPhrase(item, `${number}-${index}-${phraseIndex}`)).join("")}</div>${visibleExamples.length ? `<div class="example-stack general-examples" ${index === 0 ? `id="context-examples"` : ""}><h3>语境例句</h3>${visibleExamples.map(renderExample).join("")}</div>` : ""}</section>`;
}

function renderPhrase(item, id) {
  return `<article class="phrase-card"><button type="button" class="phrase-trigger" data-action="toggle-phrase" aria-expanded="false" data-target="phrase-${id}"><span><strong>${item.en}</strong><small>${item.zh}</small></span><span aria-hidden="true">＋</span></button><div id="phrase-${id}" class="phrase-detail"><div class="phrase-actions">${speakButton(item.en, `朗读词组 ${item.en}`)}<span>朗读词组</span></div>${renderExample(item.example)}</div></article>`;
}

function renderComparisonSection(lesson) {
  return `<section class="${learningPanelClasses("comparison", "section-card comparison-section")}" id="comparison" data-learning-panel="comparison"><div class="section-heading"><span class="section-number">≠</span><div><h2>第二栏注解词与近义词对比</h2><p>明确关系、用法差异、搭配对象，并逐句朗读</p></div></div><div class="comparison-stack">${(lesson.comparisons || []).map((item) => `<article class="comparison-card"><div class="comparison-head"><div><span class="relation-tag ${/不是|反向|线索/.test(item.role) ? "warning" : ""}">${item.role}</span><h3>${item.word}</h3><small>${item.ipa} · ${item.meaningZh}</small></div>${speakButton(item.word, `朗读 ${item.word}`)}</div><p>${item.contrast}</p><div class="comparison-examples">${(item.examples || []).map(renderExample).join("")}</div></article>`).join("")}</div></section>`;
}

function renderLookalikeSection(lesson) {
  const pack = getLookalikePack(lesson.number);
  if (!pack?.items?.length) return "";
  return `<section class="${learningPanelClasses("lookalikes", "section-card lookalike-section")}" id="lookalikes" data-learning-panel="lookalikes"><div class="section-heading"><span class="section-number">Aa</span><div><h2>同根与拼写相近词辨析</h2><p>这些词因为拼写或构词相近而容易认错，并不表示它们互为近义词。</p></div></div><div class="lookalike-stack">${pack.items.map((item) => `<article class="lookalike-card"><header><div><span class="relation-tag">${item.relation}</span><h3>${item.word}</h3><small>${item.ipa} · ${item.pos} · ${item.meaningZh}</small></div>${speakButton(item.word, `朗读 ${item.word}`)}</header><div class="lookalike-paths"><div><strong>${lesson.word}</strong><p>${item.targetFormZh}</p></div><div><strong>${item.word}</strong><p>${item.lookalikeFormZh}</p></div></div><dl><div><dt>词根关系</dt><dd>${item.rootContrastZh}</dd></div><div><dt>现代用法区别</dt><dd>${item.contrastZh}</dd></div><div class="lookalike-brake"><dt>一眼刹车</dt><dd>${item.brakeZh}</dd></div></dl><div class="lookalike-examples">${renderExample(item.targetExample)}${renderExample(item.lookalikeExample)}</div></article>`).join("")}</div></section>`;
}

function renderExample(item) {
  if (!item) return "";
  return `<blockquote class="example"><div><p>${item.en}</p><p>${item.zh}</p></div>${speakButton(item.en, "朗读例句")}</blockquote>`;
}

function speakButton(text, label, hero = false) {
  return `<button type="button" class="${hero ? "speak-button" : "mini-speak"}" data-action="speak" data-text="${escapeAttribute(text)}" aria-label="${escapeAttribute(label)}" title="${escapeAttribute(label)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9v6h4l5 4V5L9 9H5Zm11.5-1.5a6 6 0 0 1 0 9M18.8 5a9.5 9.5 0 0 1 0 14" /></svg></button>`;
}

function renderMemory(lesson) {
  const memory = lesson.memory || {};
  const methods = [
    memory.soundZh && ["中文谐音", memory.soundZh, "sound"],
    memory.rootZh && ["可靠词根", memory.rootZh, "root"],
    memory.englishHookZh && ["英文近音", memory.englishHookZh, "english"],
    memory.bridgeZh && ["语义落点", memory.bridgeZh, "bridge"],
  ].filter(Boolean);
  return `<section class="memory-workbench" id="memory"><div class="memory-workbench-heading"><div><h2>记忆工作台</h2><p>谐音只是入口：再用词根、声音桥和荒诞画面把词义钉牢。</p></div><span title="记忆法不等于词源解释">i</span></div><div class="memory-ladder">${methods.map(([title,text,kind],index)=>`<article class="memory-step memory-${kind}"><b>${index+1}</b><strong>${title}</strong><p>${text}</p>${speakButton(text, `朗读${title}`)}</article>`).join("")}</div></section>`;
}

function renderRecall(lesson) {
  return `<section class="${learningPanelClasses("recall", "recall-card")}" id="recall" data-learning-panel="recall"><p class="eyebrow">ACTIVE RECALL · 主动回忆</p><h2>${lesson.recall.promptEn}</h2><p class="recall-zh">${lesson.recall.promptZh}</p><button class="button secondary" type="button" data-action="reveal-answer">Show bilingual answer · 显示双语答案</button><div class="answer-reveal"><strong>${lesson.recall.answerEn}</strong><p>${lesson.recall.answerZh}</p></div></section>`;
}

function renderIeltsApp(route, { scroll = true } = {}) {
  if (route.name === "learn") {
    if (ieltsProgress.lastWord !== route.number) learningPanel = "memory";
    ieltsProgress.lastWord = route.number;
    saveIeltsProgress();
  }
  lessonList.innerHTML = renderIeltsRail(route);
  updateBottomNavigation(route);
  if (route.name === "library") {
    ieltsLibraryCategory = route.chapter;
    app.innerHTML = renderIeltsLibrary(route.chapter);
  }
  else if (route.name === "story") {
    const group = getIeltsGroup(route.groupNumber);
    ieltsProgress.lastWord = group.primaryAppId;
    saveIeltsProgress();
    app.innerHTML = renderIeltsStory(route.groupNumber);
  }
  else if (route.name === "review") app.innerHTML = ieltsQuizSession ? renderIeltsTest() : renderIeltsReview();
  else {
    const lesson = getIeltsLesson(route.number);
    app.innerHTML = renderIeltsLesson(route.number);
    queueSpeechPreload(lesson.word, { priority: true });
    scheduleNeighborPronunciationPreloads([
      route.number > 1 ? getIeltsLesson(route.number - 1).word : "",
      route.number < ieltsLessons.length ? getIeltsLesson(route.number + 1).word : "",
    ]);
  }
  contextRail.innerHTML = renderIeltsContext(route);
  contextRail.classList.add("is-visible");
  document.title = `${route.name === "learn" ? getIeltsLesson(route.number).word : route.name === "story" ? `第 ${route.groupNumber} 组短文` : ({ library: "词库", review: "复习", test: "测试" }[route.name] || "学习")} · 雅思必背词 538`;
  updateProgressUI();
  if (route.name === "learn") keepCurrentRailWordVisible();
  if (scroll) window.scrollTo({ top: 0, behavior: "instant" });
  scheduleVisibleSpeechPreloads();
}

function keepCurrentRailWordVisible() {
  requestAnimationFrame(() => {
    const scroller = lessonList.querySelector(".rail-words");
    const current = scroller?.querySelector(".lesson-link.is-current");
    if (!scroller || !current) return;
    const scrollerRect = scroller.getBoundingClientRect();
    const currentRect = current.getBoundingClientRect();
    if (currentRect.top < scrollerRect.top) scroller.scrollTop -= scrollerRect.top - currentRect.top;
    else if (currentRect.bottom > scrollerRect.bottom) scroller.scrollTop += currentRect.bottom - scrollerRect.bottom;
  });
}

function renderIeltsRail(route) {
  if (route.name === "review" && ieltsQuizSession) {
    const total = ieltsQuizSession.questions.length;
    const complete = ieltsQuizSession.index >= total;
    const roundMap = ieltsQuizSession.questions.map((item, index) => {
      const result = ieltsQuizSession.results[index];
      const state = result ? (result.correct ? "is-correct" : "is-wrong") : index === ieltsQuizSession.index && !complete ? "is-current" : "";
      return `<span class="${state}">${index + 1}</span>`;
    }).join("");
    return `<section class="rail-page-heading review-round-heading"><span class="rail-caption">IELTS REVIEW ROUND</span><h2>${complete ? "本轮完成" : "检索练习中"}</h2><p>${Math.min(ieltsQuizSession.index + 1, total)} / ${total} 题</p></section><section class="test-rail-locked"><div><span>范围</span><strong>${ieltsScopeLabel(ieltsQuizSession.config.scope)}</strong></div><div><span>清单</span><strong>${filterLabel(ieltsQuizSession.config.filter)}</strong></div><div><span>题型</span><strong>${ieltsQuizSession.config.modes.length} 种</strong></div></section><button class="button secondary wide" type="button" data-action="exit-ielts-review">退出本轮，返回列表</button><section class="review-round-map"><h3>题目导航</h3><div>${roundMap}</div></section>`;
  }
  if (route.name === "library") {
    const statusRows = [
      ["all", "全部词", ieltsLessons.length, "library-dot-all"], ["unlearned", "未学习", ieltsLessonsForFilter("unlearned").length, "library-dot-new"],
      ["again", "Again", ieltsBucketCount("again"), "library-dot-again"], ["hard", "Hard", ieltsBucketCount("hard"), "library-dot-hard"],
      ["good", "Good", ieltsBucketCount("good"), "library-dot-good"], ["easy", "Easy", ieltsBucketCount("easy"), "library-dot-easy"],
      ["favorite", "收藏", ieltsFavoriteCount(), "library-dot-favorite"],
    ];
    return `<section class="rail-page-heading"><span class="rail-caption">IELTS 538</span><h2>雅思词库</h2><p>${ielts538Manifest.appImportEntryCount} 条词条 · ${ieltsGroups.length} 个原表分组</p></section><section class="rail-nav-group ielts-chapter-nav"><h3>原表分区</h3>${ieltsCategories().map((category) => { const pool = ieltsCategoryLessons(category); const groups = ieltsCategoryGroups(category); return `<button class="rail-nav-row ${route.chapter === category ? "is-current" : ""}" type="button" data-route="library/${category}"><span>第 ${category} 类</span><strong>${groups.length} 组 · ${pool.length} 词</strong></button>`; }).join("")}</section><section class="rail-nav-group"><h3>学习状态</h3>${statusRows.map(([key,label,count,dot]) => `<button class="rail-nav-row ${ieltsLibraryStatusFilter === key ? "is-active" : ""}" type="button" data-action="ielts-library-filter" data-filter="${key}"><span><i class="${dot}"></i>${label}</span><strong>${count}</strong></button>`).join("")}</section>`;
  }
  if (route.name === "review") {
    const rows = [["again","本轮重学",ieltsBucketCount("again")],["hard","困难词",ieltsBucketCount("hard")],["good","常规巩固",ieltsBucketCount("good")],["easy","快速巡检",ieltsBucketCount("easy")],["wrong","错题",ieltsWrongCount()],["favorite","收藏",ieltsFavoriteCount()]];
    return `<section class="rail-page-heading"><span class="rail-caption">IELTS REVIEW</span><h2>复习中心</h2><p>按真实用途管理复习清单</p></section><section class="rail-nav-group review-buckets">${rows.map(([key,label,count]) => `<button type="button" class="rail-nav-row ${ieltsReviewConfig.filter === key ? "is-active" : ""}" data-action="practice-filter" data-kind="ielts" data-value="${key}"><span><i class="library-dot-${key}"></i>${label}</span><strong>${count}</strong></button>`).join("")}</section><button class="rail-library-link" type="button" data-action="practice-filter" data-kind="ielts" data-value="all">浏览全部词</button>`;
  }
  const group = route.name === "story" ? getIeltsGroup(route.groupNumber) : ieltsGroupForLesson(route.number);
  const activeNumber = route.number || group.primaryAppId;
  const groupLessons = ieltsGroupLessons(group);
  const learned = groupLessons.filter((lesson) => getIeltsRecord(lesson.number)?.reviews).length;
  const previousGroup = group.number > 1 ? getIeltsGroup(group.number - 1) : null;
  const nextGroup = group.number < ieltsGroups.length ? getIeltsGroup(group.number + 1) : null;
  const category = ieltsCategoryForLesson(activeNumber);
  return `<section class="rail-card current-set-card ielts-learning-path"><div class="rail-card-heading"><div><span class="rail-caption">IELTS LEARNING PATH</span><h2>学习路径</h2></div><span class="rail-range">第 ${String(group.number).padStart(3,"0")} 组 · ${groupLessons.length} 词</span></div><div class="learning-scope-picker"><label><span>类别</span><select id="ielts-learning-category-select" aria-label="选择雅思类别">${ieltsCategories().map((item) => `<option value="${item}" ${item === category ? "selected" : ""}>第 ${item} 类 · ${ieltsCategoryLessons(item).length} 词</option>`).join("")}</select></label><label><span>组</span><select id="ielts-learning-group-select" aria-label="选择原表分组">${ieltsCategoryGroups(category).map((item) => `<option value="${item.number}" ${item.number === group.number ? "selected" : ""}>第 ${String(item.number).padStart(3,"0")} 组 · ${ieltsGroupRange(item)}</option>`).join("")}</select></label></div><div class="ielts-source-note"><strong>${group.primaryWord} · 原表第 ${category} 类</strong><span>主词与原表高亮替换表达保持在同一组</span></div><div class="rail-words">${groupLessons.map((lesson) => { const record = getIeltsRecord(lesson.number); return `<button type="button" class="lesson-link ${record?.reviews ? "is-done" : ""} ${route.name === "learn" && route.number === lesson.number ? "is-current" : ""}" data-route="learn/${lesson.number}"><span class="lesson-num">${lesson.number}</span><span><strong>${lesson.word}</strong><small>${lesson.source.entryType === "primary" ? "主词" : `替换 ${lesson.source.linkedPrimaryWord}`} · ${lesson.coreZh}</small></span><i aria-hidden="true"></i></button>`; }).join("")}</div><div class="rail-set-actions"><button type="button" class="${route.name === "story" ? "is-active" : ""}" data-route="story/${group.number}">本组短文</button><button type="button" data-action="start-ielts-review" data-scope="group">本组复习</button></div></section><div class="rail-set-switcher"><button type="button" ${previousGroup ? `data-route="learn/${previousGroup.primaryAppId}"` : "disabled"} aria-label="上一原表分组">←</button><button type="button" data-route="library/${category}">查看第 ${category} 类</button><button type="button" ${nextGroup ? `data-route="learn/${nextGroup.primaryAppId}"` : "disabled"} aria-label="下一原表分组">→</button></div><div class="rail-set-progress"><span>本组进度</span><strong>${learned} / ${groupLessons.length}</strong><i><b style="width:${groupLessons.length ? (learned / groupLessons.length) * 100 : 0}%"></b></i></div>`;
}

function renderIeltsLesson(number) {
  const lesson = getIeltsLesson(number);
  const record = getIeltsRecord(number);
  return `<article class="view word-page ielts-word-page">${renderMobileIeltsLearningScope(lesson)}
    <header class="word-hero" data-letter="${lesson.word[0].toUpperCase()}">
      <div class="word-line"><h1 class="word-title">${lesson.word}</h1>${speakButton(lesson.word, `朗读 ${lesson.word}`, true)}</div>
      <div class="pronunciation"><strong>${lesson.ipa}</strong><span>${lesson.pos}</span><span>${lesson.register}</span></div>
      <p class="core-definition">${lesson.coreEn}</p><p class="core-cn">${lesson.coreZh}</p>
      <div class="word-status-line"><span class="mastery-pill mastery-${record?.bucket || "new"}">${record?.bucket ? BUCKET_META[record.bucket].label : lesson.source.entryType === "primary" ? "PRIMARY" : "SUBSTITUTE"}</span><span>${lesson.grammarZh}</span></div>
    </header>
    <div class="learning-panel-stack">
      <section class="learning-panel learning-memory-panel ${learningPanel === "memory" ? "is-active" : ""}" data-learning-panel="memory"><section class="anchor-card"><span class="anchor-icon">◎</span><div><h2>核心图像</h2><p>${lesson.imageZh}</p></div></section>${renderIeltsMemory(lesson)}</section>
      ${renderIeltsUsagePanel(lesson)}
      ${renderIeltsComparisonPanel(lesson)}
      ${renderIeltsEvidencePanel(lesson)}
      ${renderIeltsMorphologyPanel(lesson)}${renderIeltsLookalikePanel(lesson)}
      ${renderRecall(lesson)}
    </div>
    ${renderMobileLearningDock(lesson, record, { ielts: true })}
  </article>`;
}

function renderIeltsUsagePanel(lesson) {
  return `<section class="${learningPanelClasses("usage", "section-card usage-panel")}" data-learning-panel="usage"><div class="section-heading"><span class="section-number">∞</span><div><h2>核心用法与词组</h2><p>按义项掌握准确含义、适用对象与对应搭配。</p></div></div><div class="usage-sense-stack">${lesson.senses.map((sense, index) => `<section class="usage-sense"><header><span>${index + 1}</span><div><h3>${sense.title}</h3><p>${sense.explanation}</p><small>${sense.label}</small></div></header><div class="phrase-grid">${sense.collocations.map((item, phraseIndex) => renderPhrase(item, `ielts-${lesson.number}-${index}-${phraseIndex}`)).join("")}</div></section>`).join("")}</div></section>`;
}

function renderIeltsMemory(lesson) {
  const morphology = lesson.morphology || {};
  const memory = lesson.memory || {};
  const methods = [
    ["中文谐音", morphology.soundHookZh || "用中文近音建立第一条记忆线索；它只用于记忆，不代表真实词源。", "sound"],
    ["可靠词源", morphology.originZh || "暂无适合现代学习的可靠词源拆分。", "root"],
    ["英文近音／熟词桥", memory.englishHookZh || "用英文近音或已知熟词建立第二条声音线索。", "english"],
    ["语义落点", memory.bridgeZh || morphology.trapZh || "抓住词义边界和最容易混淆的结构。", "bridge"],
  ];
  return `<section class="memory-workbench ielts-memory-workbench" id="memory"><div class="memory-workbench-heading"><div><h2>记忆工作台</h2><p>沿用 GRE 的四步结构：中文谐音、可靠词根、英文近音和语义落点。</p></div><span title="谐音记忆不等于词源解释">i</span></div><div class="memory-ladder">${methods.map(([title,text,kind],index)=>`<article class="memory-step memory-${kind}"><b>${index+1}</b><strong>${title}</strong><p>${text}</p>${speakButton(text, `朗读${title}`)}</article>`).join("")}</div></section>`;
}

function evidenceTypeLabel(item) {
  return item.sourceType === "official_practice_test" ? "官方样题 / 练习题" : "官方备考材料";
}

function renderIeltsComparisonPanel(lesson) {
  return `<section class="${learningPanelClasses("comparison", "section-card comparison-section ielts-comparison-panel")}" data-learning-panel="comparison"><div class="section-heading"><span class="section-number">≠</span><div><h2>近义词与相关表达对比</h2><p>明确关系、用法差异和适用对象，并为每个候选词提供双语例句。</p></div></div><div class="comparison-stack">${lesson.comparisons.map((item) => `<article class="comparison-card"><div class="comparison-head"><div><span class="relation-tag">${item.role}</span><h3>${item.word}</h3><small>${item.ipa} · ${item.meaningZh}</small></div>${speakButton(item.word, `朗读 ${item.word}`)}</div><p>${item.contrast}</p><div class="comparison-examples">${item.examples.map(renderExample).join("")}</div></article>`).join("")}</div></section>`;
}

function renderIeltsStory(groupNumber) {
  const group = getIeltsGroup(groupNumber);
  const groupLessons = ieltsGroupLessons(group);
  const story = ielts538GroupStories[group.groupId];
  return `<section class="view story-workspace ielts-story-workspace"><header class="workspace-header"><div><p class="eyebrow">ORIGINAL GROUP STORY · ${group.groupId.toUpperCase()}</p><h1>${story.titleZh}</h1><p>只串联原表第 ${String(group.number).padStart(3, "0")} 组的 ${groupLessons.length} 个 App 词条；近义对比候选不参与故事。</p></div><span class="workspace-note">第 ${String(group.number).padStart(3, "0")} 组</span></header><article class="story-reading-panel"><div class="story-reading-head"><div><span class="rail-caption">IELTS LINKING STORY</span><p>先听英文并回忆词链，再展开中文确认</p></div><div class="story-tools"><button class="button" type="button" data-action="speak" data-text="${escapeAttribute(story.plainEn)}">▶ 朗读英文</button><button class="button secondary" type="button" data-action="toggle-translation">显示中文</button></div></div><p class="story-text">${story.markedEn}</p><div class="translation">${story.zh}</div></article><section class="story-chain-panel"><div class="panel-heading"><div><span class="rail-caption">TARGET WORD CHAIN</span><h2>本组 ${groupLessons.length} 个词的记忆路径</h2></div><span>点击回到词页</span></div><div class="story-chain">${groupLessons.map((item, index) => `<button type="button" data-route="learn/${item.number}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${item.word}</strong><small>${item.coreZh}</small></button>`).join("")}</div></section><div class="page-actions"><button class="button secondary" type="button" data-route="learn/${group.primaryAppId}">← 返回本组主词</button><button class="button" type="button" data-action="start-ielts-review" data-scope="group">开始本组复习 →</button></div></section>`;
}

function renderIeltsEvidencePanel(lesson) {
  const authored = lesson.ieltsExamples.map((item) => `<article class="ielts-evidence-card ielts-authored-example"><header><span>原创雅思语境例句</span><b>${item.skill || "IELTS"} · ${item.taskType || "语境"}</b></header><div class="ielts-evidence-quote"><strong>${item.en}</strong>${speakButton(item.en, "朗读雅思语境例句")}<p>${item.zh}</p></div><p class="ielts-evidence-note">${item.noteZh || "本项目原创雅思风格例句，不宣称来自真实考题。"}</p></article>`).join("");
  const official = lesson.ieltsEvidence.map((item) => `<article class="ielts-evidence-card"><header><span>${evidenceTypeLabel(item)}</span><b>${item.verbatim ? "官方原句" : "压缩 / 改写"}</b></header><div class="ielts-evidence-quote"><strong>${item.textEn}</strong>${speakButton(item.textEn, "朗读题源例句")}<p>${item.textZh}</p></div><footer><div><strong>${item.sourceTitle}</strong><small>${item.section || ""}</small></div><a href="${item.sourceUrl}" target="_blank" rel="noreferrer">查看来源 ↗</a></footer><p class="ielts-evidence-note">${item.noteZh}</p></article>`).join("");
  return `<section class="${learningPanelClasses("evidence", "section-card ielts-evidence-panel")}" data-learning-panel="evidence"><div class="section-heading"><span class="section-number">▤</span><div><h2>雅思语境与已核验材料</h2><p>原创雅思风格例句与官方公开材料分层展示，不把备考材料冒充考场真题。</p></div></div><div class="ielts-evidence-list">${authored}${official || `<article class="ielts-evidence-card"><p class="ielts-evidence-note">本词暂无逐字核验的官方公开材料；上方例句均明确标为原创雅思语境。</p></article>`}</div></section>`;
}

function renderIeltsMorphologyPanel(lesson) {
  const morphology = lesson.morphology || {};
  return `<section class="${learningPanelClasses("morphology", "section-card ielts-morphology-panel")}" data-learning-panel="morphology"><div class="section-heading"><span class="section-number">Aa</span><div><h2>构词与易混提醒</h2><p>词源只解释可靠部分，记忆钩子与真实词源分开。</p></div></div><dl><div><dt>可靠词源</dt><dd>${morphology.originZh || "—"}</dd></div><div><dt>词族</dt><dd>${(morphology.wordFamily || []).join(" · ") || "—"}</dd></div><div><dt>声音钩子</dt><dd>${morphology.soundHookZh || "—"}</dd></div><div><dt>易混刹车</dt><dd>${morphology.trapZh || "—"}</dd></div></dl></section>`;
}

function renderIeltsLookalikePanel(lesson) {
  const pack = lesson.lookalikePack;
  if (!pack?.items?.length) return "";
  return `<section class="${learningPanelClasses("lookalikes", "section-card lookalike-section ielts-lookalike-panel")}" data-learning-panel="lookalikes"><div class="section-heading"><span class="section-number">Aa</span><div><h2>形近／同根词辨析</h2><p>这些词因为拼写或构词相近而容易认错，并不表示它们互为近义词。</p></div></div><div class="lookalike-stack">${pack.items.map((item) => `<article class="lookalike-card"><header><div><span class="relation-tag">${item.relation}</span><h3>${item.word}</h3><small>${item.ipa} · ${item.pos} · ${item.meaningZh}</small></div>${speakButton(item.word, `朗读 ${item.word}`)}</header><div class="lookalike-paths"><div><strong>${lesson.word}</strong><p>${item.targetFormZh}</p></div><div><strong>${item.word}</strong><p>${item.lookalikeFormZh}</p></div></div><dl><div><dt>词根关系</dt><dd>${item.rootContrastZh}</dd></div><div><dt>现代用法区别</dt><dd>${item.contrastZh}</dd></div><div class="lookalike-brake"><dt>一眼刹车</dt><dd>${item.brakeZh}</dd></div></dl><div class="lookalike-examples">${renderExample(item.targetExample)}${renderExample(item.lookalikeExample)}</div></article>`).join("")}</div></section>`;
}

function renderIeltsContext(route) {
  if (route.name === "library") return renderIeltsLibraryContext();
  if (route.name === "story") {
    const group = getIeltsGroup(route.groupNumber);
    const story = ielts538GroupStories[group.groupId];
    return `<section class="context-card"><span class="rail-caption">GROUP STORY · ${group.groupId.toUpperCase()}</span><h2 class="context-title">${story.titleZh}</h2><p class="context-copy">${ieltsGroupLessons(group).length} 个原表词条 · 不混入注解候选</p><button class="button wide" type="button" data-route="learn/${group.primaryAppId}">返回本组学习</button><button class="button secondary wide" type="button" data-action="start-ielts-review" data-scope="group">本组复习</button></section>`;
  }
  if (route.name === "review") {
    if (ieltsQuizSession) return renderIeltsTestContext();
    const pool = ieltsPracticeCandidates(ieltsReviewConfig);
    const selectedCount = ieltsReviewSelection.size;
    const counts = RATINGS.map((rating) => [rating, pool.filter((lesson) => getIeltsRecord(lesson.number)?.bucket === rating.toLowerCase()).length]);
    const total = Math.max(1, counts.reduce((sum,[,count]) => sum + count, 0));
    return `<section class="context-card queue-summary-card"><span class="rail-caption">QUEUE SUMMARY</span><div class="queue-total"><strong>${selectedCount || pool.length}</strong><span>/ ${pool.length} 候选词</span></div><p>${ieltsScopeLabel(ieltsReviewConfig.scope)} · ${filterLabel(ieltsReviewConfig.filter)}</p><div class="queue-distribution">${counts.map(([label,count]) => `<span class="distribution-${label.toLowerCase()}" style="width:${(count/total)*100}%"></span>`).join("")}</div><div class="queue-breakdown">${counts.map(([label,count]) => `<div><span>${label}</span><strong>${count}</strong></div>`).join("")}</div></section><section class="context-card"><span class="rail-caption">SELECTED MODES</span><div class="selected-mode-list">${QUESTION_MODES.filter((mode)=>ieltsReviewConfig.modes.includes(mode.id)).map((mode)=>`<span>${mode.label}</span>`).join("")}</div></section><section class="context-card bulk-card"><span class="rail-caption">BULK ACTIONS</span><button type="button" class="button secondary wide" data-action="select-ielts-review-page">全选当前列表</button><button type="button" class="button secondary wide" data-action="clear-ielts-review-selection">清空选择</button></section><section class="context-card review-rule-card"><span class="rail-caption">SELECTION RULES</span><p class="context-copy">弱词加权、同轮不重复。手动勾选时，以所选单词为本轮范围；错题自动进入错题集，不改变掌握度。</p></section>`;
  }
  const lesson = getIeltsLesson(route.number);
  const record = getIeltsRecord(route.number);
  const previous = route.number > 1 ? getIeltsLesson(route.number - 1) : null;
  const next = route.number < ieltsLessons.length ? getIeltsLesson(route.number + 1) : null;
  return `<nav class="context-card learning-pager-card" aria-label="切换单词"><div class="learning-pager-heading"><span class="rail-caption">WORD NAVIGATION</span><strong>${route.number} / ${ieltsLessons.length}</strong></div><div class="learning-pager-buttons"><button type="button" ${previous ? `data-route="learn/${previous.number}"` : "disabled"}><span>← 上一个</span><strong>${previous?.word || "已到开头"}</strong></button><button type="button" ${next ? `data-route="learn/${next.number}"` : "disabled"}><span>下一个 →</span><strong>${next?.word || "已到结尾"}</strong></button></div></nav><section class="context-card mastery-card"><div class="context-card-heading"><div><span class="rail-caption">MASTERY</span><h2>你记得怎么样？</h2></div></div><div class="context-rating-grid">${RATINGS.map((rating) => { const meta = BUCKET_META[rating.toLowerCase()]; return `<button type="button" class="context-rating rating-${rating.toLowerCase()} ${record?.lastRating === rating ? "is-selected" : ""}" data-action="rate-ielts" data-number="${lesson.number}" data-rating="${rating}"><strong>${rating}</strong><small>${meta.zh}</small></button>`; }).join("")}</div></section><section class="context-card quick-jump-card ielts-content-nav"><span class="rail-caption">CONTENT NAVIGATION</span><nav aria-label="本词内容导航">${renderLearningPanelButton("memory", "◉", "核心图像与记忆")}${renderLearningPanelButton("usage", "∞", "核心用法与词组")}${renderLearningPanelButton("comparison", "≠", "近义词与相关表达对比")}${renderLearningPanelButton("evidence", "▤", "雅思语境与材料")}${renderLearningPanelButton("morphology", "⌘", "构词与易混")}${renderLearningPanelButton("lookalikes", "Aa", "形近与同根词")}${renderLearningPanelButton("recall", "?", "主动回忆")}</nav></section><section class="context-card learning-quick-actions"><span class="rail-caption">SOURCE ROLE · APP ID ${lesson.appId}</span><p class="ielts-role-copy"><strong>${lesson.source.entryType === "primary" ? "主词条" : "高亮替换表达"}</strong>${lesson.source.linkedPrimaryWord ? ` · 关联 ${lesson.source.linkedPrimaryWord}` : ""}</p><button type="button" data-action="toggle-ielts-favorite" data-number="${lesson.number}">${record?.favorite ? "★ 已收藏" : "☆ 收藏单词"}</button><button type="button" data-action="reset-ielts-word" data-number="${lesson.number}">↻ 重置本词进度</button></section>`;
}

function renderIeltsLibrary(category = ieltsLibraryCategory) {
  const query = ieltsLibraryQuery.trim().toLowerCase();
  const categoryPool = query ? ieltsLessons : ieltsCategoryLessons(category);
  const queryPool = query ? categoryPool.filter((lesson) => `${lesson.word} ${lesson.coreEn} ${lesson.coreZh} ${lesson.comparisons.map((item) => `${item.word} ${item.meaningZh}`).join(" ")}`.toLowerCase().includes(query)) : categoryPool;
  const source = ieltsLibraryStatusFilter === "all" ? queryPool : ieltsLessonsForFilter(ieltsLibraryStatusFilter, queryPool);
  if (!source.some((lesson) => lesson.number === ieltsLibrarySelectedNumber) && source[0]) ieltsLibrarySelectedNumber = source[0].number;
  const groupCount = query ? new Set(source.map((lesson) => lesson.synonymGroupId)).size : ieltsCategoryGroups(category).length;
  return `<section class="view library-workspace"><header class="workspace-header"><div><p class="eyebrow">IELTS VOCABULARY LIBRARY</p><h1>雅思词库</h1><p>${query ? "全库搜索结果" : `原表第 ${category} 类 · ${groupCount} 组`} · ${filterLabel(ieltsLibraryStatusFilter)} · ${source.length} 条</p></div><button class="button secondary" type="button" data-route="learn/${ieltsLibrarySelectedNumber}" ${source.length ? "" : "disabled"}>打开选中词</button></header><div class="library-toolbar"><label class="library-status-select"><span>状态</span><select id="library-status-select" aria-label="按学习状态筛选">${[["all","全部状态"],["unlearned","未学习"],["wrong","错题"],["again","Again"],["hard","Hard"],["good","Good"],["easy","Easy"],["favorite","收藏"]].map(([key,label])=>`<option value="${key}" ${ieltsLibraryStatusFilter===key?"selected":""}>${label}</option>`).join("")}</select></label><label class="workspace-search" for="library-search"><span>⌕</span><input id="library-search" type="search" value="${escapeAttribute(ieltsLibraryQuery)}" placeholder="搜索单词、释义或替换词"></label><span class="result-count">${source.length} / ${ieltsLessons.length}</span></div>${source.length ? `<div class="data-table-shell library-table-shell"><table class="vocab-table"><thead><tr><th>#</th><th>词条</th><th>中文核心释义</th><th>原表分组</th><th>来源角色</th><th>掌握度</th><th>收藏</th><th>操作</th></tr></thead><tbody>${source.map((lesson) => { const record = getIeltsRecord(lesson.number); const group = ieltsGroupForLesson(lesson.number); return `<tr class="${lesson.number === ieltsLibrarySelectedNumber ? "is-selected" : ""}" data-action="select-ielts-library-word" data-number="${lesson.number}"><td>${lesson.number}</td><td><button type="button" class="table-word" data-action="select-ielts-library-word" data-number="${lesson.number}">${lesson.word}</button><small>${lesson.pos}</small></td><td>${lesson.coreZh}</td><td><strong>第 ${String(group.number).padStart(3,"0")} 组</strong><small>${group.primaryWord} · ${ieltsGroupLessons(group).length} 词</small></td><td>${lesson.source.entryType === "primary" ? "主词" : `替换词 · ${lesson.source.linkedPrimaryWord}`}</td><td><span class="mastery-pill mastery-${record?.bucket || "new"}">${record?.bucket ? BUCKET_META[record.bucket].label : "未学习"}</span></td><td><button type="button" class="table-icon-button ${record?.favorite ? "is-active" : ""}" data-action="toggle-ielts-favorite" data-number="${lesson.number}" aria-label="${record?.favorite ? "取消收藏" : "收藏"}">${record?.favorite ? "★" : "☆"}</button></td><td><button type="button" class="table-more" data-route="learn/${lesson.number}">•••</button></td></tr>`; }).join("")}</tbody></table></div>` : `<div class="empty-state"><strong>?</strong><h2>没有匹配结果</h2><p>可更换类别、状态或搜索词。</p></div>`}</section>`;
}

function renderIeltsLibraryContext() {
  const lesson = getIeltsLesson(ieltsLibrarySelectedNumber);
  const record = getIeltsRecord(lesson.number);
  const group = ieltsGroupForLesson(lesson.number);
  return `<section class="context-card library-inspector"><div class="inspector-word-line"><div><span class="rail-caption">IELTS APP ID ${lesson.number} · ${lesson.synonymGroupId}</span><h2>${lesson.word}</h2></div><div class="inspector-actions">${speakButton(lesson.word, `朗读 ${lesson.word}`)}<button class="table-icon-button ${record?.favorite ? "is-active" : ""}" type="button" data-action="toggle-ielts-favorite" data-number="${lesson.number}" aria-label="${record?.favorite ? "取消收藏" : "收藏"}">${record?.favorite ? "★" : "☆"}</button></div></div><p class="inspector-pronunciation">${lesson.ipa} · ${lesson.pos}</p><div class="inspector-section"><h3>中文核心释义</h3><p>${lesson.coreZh}</p></div><div class="inspector-section"><h3>原表分组</h3><p>第 ${String(group.number).padStart(3,"0")} 组 · 主词 ${group.primaryWord} · 共 ${ieltsGroupLessons(group).length} 词</p></div><div class="inspector-section"><h3>当前掌握度</h3><span class="mastery-pill mastery-${record?.bucket || "new"}">${record ? bucketLabel(record) : "未学习"}</span><p>${record ? `复习 ${record.reviews} 次 · 正确 ${record.correctCount} · 错误 ${record.wrongCount}` : "尚无学习记录"}</p></div><button class="button wide" type="button" data-route="learn/${lesson.number}">开始学习</button>${record ? `<button class="button secondary wide" type="button" data-action="reset-ielts-word" data-number="${lesson.number}">重置掌握度</button>` : ""}</section>`;
}

function renderIeltsReview() {
  const candidates = ieltsPracticeCandidates(ieltsReviewConfig);
  const count = ieltsReviewSelection.size || effectiveQuestionCount(ieltsReviewConfig, candidates);
  const scopes = [["set","当前原表组"],["chapter","当前类别"],["all","全部词库"]];
  const mobileFilters = [["again","本轮重学"],["hard","困难词"],["good","常规巩固"],["easy","快速巡检"],["wrong","错题"],["favorite","收藏"],["all","全部词"]];
  return `<section class="view review-workspace ielts-review-list"><header class="workspace-header"><div><p class="eyebrow">UNIFIED IELTS REVIEW</p><h1>复习中心</h1><p>${filterLabel(ieltsReviewConfig.filter)} · ${candidates.length} 个候选词</p></div><span class="workspace-note">弱项加权 · 同轮不重复</span></header><section class="review-session-builder"><div class="review-mobile-filter"><span>复习清单</span><div class="compact-segments">${mobileFilters.map(([key,label])=>`<button type="button" class="${ieltsReviewConfig.filter===key?"is-selected":""}" data-action="practice-filter" data-kind="ielts" data-value="${key}">${label}</button>`).join("")}</div></div><div><span>复习范围</span><div class="compact-segments">${scopes.map(([key,label])=>`<button type="button" class="${ieltsReviewConfig.scope===key?"is-selected":""}" data-action="practice-scope" data-kind="ielts" data-value="${key}">${label}</button>`).join("")}</div></div><div><span>题目数量</span><div class="compact-segments">${QUESTION_COUNTS.map(value=>`<button type="button" class="${ieltsReviewConfig.count===value?"is-selected":""}" data-action="practice-count" data-kind="ielts" data-value="${value}">${value || "全部"}</button>`).join("")}</div></div><div class="builder-modes"><span>出题模式</span><div class="compact-segments"><button type="button" class="${ieltsReviewConfig.modes.length===ALL_MODE_IDS.length?"is-selected":""}" data-action="practice-mode" data-kind="ielts" data-value="all">全部混合</button>${QUESTION_MODES.map(mode=>`<button type="button" class="${ieltsReviewConfig.modes.includes(mode.id)?"is-selected":""}" data-action="practice-mode" data-kind="ielts" data-value="${mode.id}">${mode.label}</button>`).join("")}</div></div></section>${candidates.length ? `<div class="data-table-shell review-table-shell"><table class="review-table"><thead><tr><th><input type="checkbox" aria-label="全选当前列表" data-action="select-ielts-review-page" ${candidates.every(item=>ieltsReviewSelection.has(item.number))?"checked":""}></th><th>单词</th><th>中文释义</th><th>原表组</th><th>当前分组</th><th>错误次数</th><th>上次结果</th><th>操作</th></tr></thead><tbody>${candidates.map(renderIeltsReviewRow).join("")}</tbody></table></div><div class="review-action-bar"><div><span>已选择</span><strong>${ieltsReviewSelection.size || count}</strong><span>项 · 预计 ${Math.max(2,Math.ceil(count*.65))} 分钟</span></div><button class="button" type="button" data-action="start-ielts-review">开始复习 ${count} 词 →</button></div>` : `<div class="empty-state"><strong>✓</strong><h2>这个清单目前为空</h2><p>切换左侧复习清单，或先学习、测试、收藏一些单词。</p></div>`}</section>`;
}

function renderIeltsReviewRow(lesson) {
  const record = getIeltsRecord(lesson.number);
  const group = ieltsGroupForLesson(lesson.number);
  return `<tr class="${ieltsReviewSelection.has(lesson.number)?"is-selected":""}"><td><input type="checkbox" aria-label="选择 ${lesson.word}" data-action="toggle-ielts-review-selection" data-number="${lesson.number}" ${ieltsReviewSelection.has(lesson.number)?"checked":""}></td><td><button type="button" class="table-word" data-route="learn/${lesson.number}">${lesson.word}</button><small>${lesson.ipa}</small></td><td>${lesson.coreZh}</td><td>第 ${String(group.number).padStart(3,"0")} 组</td><td><span class="mastery-pill mastery-${record?.bucket || "new"}">${record?.bucket ? BUCKET_META[record.bucket].label : "未学习"}</span></td><td>${record?.wrongCount || 0}</td><td><span class="last-result ${record?.needsCorrection?"is-wrong":"is-correct"}">${record ? (record.needsCorrection?"错误":"正确") : "—"}</span></td><td><button class="table-icon-button ${record?.favorite?"is-active":""}" type="button" data-action="toggle-ielts-favorite" data-number="${lesson.number}">${record?.favorite?"★":"☆"}</button><button class="table-more" type="button" data-route="learn/${lesson.number}">•••</button></td></tr>`;
}

function buildIeltsQuiz(config = ieltsReviewConfig, candidates = ieltsPracticeCandidates(config), seed = createSessionSeed("ielts-review")) {
  const count = effectiveQuestionCount(config, candidates);
  return buildPracticeSession({
    candidates,
    allLessons: ieltsLessons,
    records: ieltsProgress.records,
    count,
    modes: config.modes,
    recentWordNumbers: (ieltsProgress.quizHistory || []).flatMap((round) => round.words || []).slice(0, 36),
    random: createSeededRandom(seed),
  });
}

function renderIeltsTest() {
  if (!ieltsQuizSession) return renderIeltsReview();
  if (ieltsQuizSession.index >= ieltsQuizSession.questions.length) return `<section class="view test-workspace"><section class="test-ready-panel ielts-test-result"><div class="test-ready-copy"><h2>本轮完成</h2><p>答对 ${ieltsQuizSession.score} / ${ieltsQuizSession.questions.length} 题。</p><button class="button" type="button" data-action="start-ielts-review">再测一次 →</button><button class="button secondary" type="button" data-action="exit-ielts-review">返回复习列表</button></div></section></section>`;
  const question = ieltsQuizSession.questions[ieltsQuizSession.index];
  const answered = ieltsQuizSession.selected !== null;
  return `<section class="view review-question-workspace test-question-workspace"><article class="focused-quiz"><div class="quiz-top"><strong>${ieltsQuizSession.index + 1} / ${ieltsQuizSession.questions.length}</strong><span class="quiz-progress"><span style="width:${((ieltsQuizSession.index + 1) / ieltsQuizSession.questions.length) * 100}%"></span></span><span>${question.type} · ${question.typeZh}</span><button class="quiz-inline-exit" type="button" data-action="exit-ielts-review">退出本轮</button></div><div class="quiz-body"><p class="question-type">${question.type} · ${question.typeZh}</p><h2 class="question-text" lang="${questionPromptLanguage(question)}">${question.prompt}</h2><p class="recall-zh">${question.promptZh}</p>${renderAnswerControl(question, ieltsQuizSession.selected, "ielts")} ${answered ? `<div class="test-mobile-feedback">${renderQuestionFeedback(question, ieltsQuizSession.selected)}<button class="button wide" type="button" data-action="next-ielts-question">${ieltsQuizSession.index === ieltsQuizSession.questions.length - 1 ? "查看结果 →" : "下一题 →"}</button></div>` : ""}</div><div class="quiz-action-dock"><span>${answered ? (isQuestionCorrect(question, ieltsQuizSession.selected) ? "答对了：掌握度保持不变" : "已加入错题集：掌握度保持不变") : question.kind === "text" ? "请主动拼写，不看选项" : "请选择最准确的答案"}</span></div></article><button class="button secondary test-mobile-exit" type="button" data-action="exit-ielts-review">退出本轮</button></section>`;
}

function renderIeltsTestContext() {
  if (!ieltsQuizSession) return `<section class="context-card"><span class="rail-caption">REVIEW</span><div class="test-score"><strong>${IELTS_REVIEW_COUNT}</strong><span>题 / 轮</span></div><p class="context-copy">从 ${ieltsLessons.length} 条内容中加权抽取，同轮不重复；六种题型混排。</p></section>`;
  const total = ieltsQuizSession.questions.length;
  if (ieltsQuizSession.index >= total) return `<section class="context-card"><span class="rail-caption">RESULT</span><div class="test-score"><strong>${Math.round((ieltsQuizSession.score / total) * 100)}%</strong><span>正确率</span></div></section>`;
  const question = ieltsQuizSession.questions[ieltsQuizSession.index];
  const answered = ieltsQuizSession.selected !== null;
  const correct = answered && isQuestionCorrect(question, ieltsQuizSession.selected);
  return `${answered ? `<section class="context-card test-answer-card ${correct ? "is-correct" : "is-wrong"}"><span class="rail-caption">ANSWER EXPLANATION · 答案解析</span>${renderQuestionFeedback(question, ieltsQuizSession.selected)}</section><section class="context-card test-next-card"><p class="context-copy">${correct ? "答对了：掌握度保持不变。" : "已自动加入错题集，掌握度保持不变。"}</p><button class="button wide" type="button" data-action="next-ielts-question">${ieltsQuizSession.index === total - 1 ? "查看结果 →" : "下一题 →"}</button></section>` : ""}<section class="context-card test-live-card"><span class="rail-caption">LIVE REVIEW</span><div class="test-score"><strong>${ieltsQuizSession.score}</strong><span>/ ${ieltsQuizSession.answered} 已答</span></div><p class="context-copy">${question.typeZh}</p></section>`;
}

function startIeltsTest(scope = null) {
  const scopedConfig = scope === "group" ? { ...ieltsReviewConfig, scope: "set", filter: "all", count: 0, modes: [...ieltsReviewConfig.modes] } : { ...ieltsReviewConfig, modes: [...ieltsReviewConfig.modes] };
  const candidates = scope === "group" ? ieltsGroupLessons(ieltsGroupForLesson(ieltsProgress.lastWord)) : ieltsReviewSelection.size ? ieltsLessons.filter((lesson) => ieltsReviewSelection.has(lesson.number)) : ieltsPracticeCandidates(scopedConfig);
  const seed = createSessionSeed("ielts-review");
  const questions = buildIeltsQuiz({ ...scopedConfig, count: scope === "group" || ieltsReviewSelection.size ? 0 : scopedConfig.count }, candidates, seed);
  if (!questions.length) return showToast("当前范围与清单没有候选词");
  ieltsQuizSession = { questions, seed, config: scopedConfig, index: 0, selected: null, score: 0, answered: 0, againCount: 0, results: [] };
  navigate("ielts/review");
}

function answerIeltsQuestion(response) {
  if (!ieltsQuizSession || ieltsQuizSession.selected !== null) return;
  const question = ieltsQuizSession.questions[ieltsQuizSession.index];
  ieltsQuizSession.selected = response;
  const correct = isQuestionCorrect(question, response);
  if (correct) ieltsQuizSession.score += 1;
  ieltsQuizSession.answered += 1;
  ieltsQuizSession.results[ieltsQuizSession.index] = { correct, response };
  recordIeltsTestOutcome(question.wordNumber, correct, "review");
  saveIeltsProgress();
  render({ forceRail: true, scroll: false });
}

function nextIeltsQuestion() {
  if (!ieltsQuizSession || ieltsQuizSession.selected === null) return;
  ieltsQuizSession.index += 1;
  ieltsQuizSession.selected = null;
  if (ieltsQuizSession.index >= ieltsQuizSession.questions.length) {
    ieltsProgress.quizHistory.unshift({
      score: ieltsQuizSession.score,
      total: ieltsQuizSession.questions.length,
      scope: ieltsQuizSession.config.scope,
      filter: ieltsQuizSession.config.filter,
      modes: [...ieltsQuizSession.config.modes],
      words: ieltsQuizSession.questions.map((question) => question.wordNumber),
      seed: ieltsQuizSession.seed,
      at: new Date().toISOString(),
    });
    ieltsProgress.quizHistory = ieltsProgress.quizHistory.slice(0, 40);
  }
  saveIeltsProgress();
  render({ forceRail: true, scroll: false });
}

function renderStory(setId) {
  const set = getSet(setId);
  return `<section class="view story-workspace"><header class="workspace-header"><div><p class="eyebrow">FIVE-WORD STORY · SET ${String(set.id).padStart(2,"0")}</p><h1>${set.story.title}</h1><p>故事只用本组五个主词构成记忆链，注解词不参与串词。</p></div><span class="workspace-note">${set.range}</span></header><article class="story-reading-panel"><div class="story-reading-head"><div><span class="rail-caption">ABSURD MEMORY STORY</span><p>先听英文，再借助中文确认画面</p></div><div class="story-tools"><button class="button" type="button" data-action="speak" data-text="${escapeAttribute(set.story.plain)}">▶ 朗读英文</button><button class="button secondary" type="button" data-action="toggle-translation">显示中文</button></div></div><p class="story-text">${markedStory(setId)}</p><div class="translation">${set.story.translation}</div></article><section class="story-chain-panel"><div class="panel-heading"><div><span class="rail-caption">TARGET WORD CHAIN</span><h2>五个主词的记忆路径</h2></div><span>点击回到词页</span></div><div class="story-chain">${set.lessons.map((lesson,index)=>`<button type="button" data-route="learn/${lesson.number}"><span>${String(index+1).padStart(2,"0")}</span><strong>${lesson.word}</strong><small>${lesson.coreZh}</small></button>`).join("")}</div></section><div class="page-actions"><button class="button secondary" type="button" data-route="learn/${set.lessons[4].number}">← 返回第 ${set.lessons[4].number} 词</button><button class="button" type="button" data-action="start-unit-review" data-set="${set.id}">开始故事后复习 →</button></div></section>`;
}

function lessonsForScope(scope, setId = progress.selectedSet) {
  if (scope === "set") return [...getSet(setId).lessons];
  if (scope === "chapter") {
    const chapter = chapterForSet(setId);
    return lessons.filter((lesson) => chapterForLesson(lesson.number) === chapter);
  }
  return [...lessons];
}

function lessonsForFilter(filter, source = lessons) {
  return source.filter((lesson) => {
    const record = getRecord(lesson.number);
    if (filter === "all") return true;
    if (filter === "wrong") return Boolean(record?.needsCorrection);
    if (["again", "hard", "good", "easy"].includes(filter)) return record?.bucket === filter;
    if (filter === "favorite") return Boolean(record?.favorite);
    if (filter === "learned") return (record?.reviews || 0) > 0;
    if (filter === "unlearned") return !record?.reviews;
    return false;
  });
}

function practiceCandidates(config, setId = progress.selectedSet) {
  return lessonsForFilter(config.filter, lessonsForScope(config.scope, setId));
}

function effectiveQuestionCount(config, pool) {
  return config.count === 0 ? pool.length : Math.min(config.count, pool.length);
}

function filterLabel(filter) { return REVIEW_FILTERS.find(([key]) => key === filter)?.[1] || filter; }
function scopeLabel(scope) { return PRACTICE_SCOPES.find(([key]) => key === scope)?.[1] || scope; }
function modeLabelList(modes) {
  if (modes.length === ALL_MODE_IDS.length) return `全部 ${modes.length} 种题型混合`;
  return QUESTION_MODES.filter((mode) => modes.includes(mode.id)).map((mode) => mode.label).join(" · ");
}

function renderPracticeControls(kind, config, setId) {
  const scopePool = lessonsForScope(config.scope, setId);
  const pool = lessonsForFilter(config.filter, scopePool);
  const count = effectiveQuestionCount(config, pool);
  const allModesSelected = config.modes.length === ALL_MODE_IDS.length;
  return `<div class="practice-config" data-practice-kind="${kind}">
    <fieldset class="practice-config-group"><legend>范围 · Range</legend><div class="practice-chip-list">${PRACTICE_SCOPES.map(([key, label]) => `<button type="button" class="${config.scope === key ? "is-selected" : ""}" aria-pressed="${config.scope === key}" data-action="practice-scope" data-kind="${kind}" data-value="${key}">${label}</button>`).join("")}</div></fieldset>
    <fieldset class="practice-config-group"><legend>复习清单 · Study list</legend><div class="practice-chip-list">${REVIEW_FILTERS.map(([key, label]) => `<button type="button" class="${config.filter === key ? "is-selected" : ""}" aria-pressed="${config.filter === key}" data-action="practice-filter" data-kind="${kind}" data-value="${key}">${label} · ${lessonsForFilter(key, scopePool).length}</button>`).join("")}</div></fieldset>
    <fieldset class="practice-config-group"><legend>数量 · Questions</legend><div class="practice-chip-list">${QUESTION_COUNTS.map((value) => `<button type="button" class="${config.count === value ? "is-selected" : ""}" aria-pressed="${config.count === value}" data-action="practice-count" data-kind="${kind}" data-value="${value}">${value === 0 ? "全部" : value}</button>`).join("")}</div></fieldset>
    <fieldset class="practice-config-group practice-mode-group"><legend>题型 · Modes</legend><p>先点一种可做专项，再叠加其他题型；“全部混合”会在题量允许时覆盖每一种。</p><div class="practice-chip-list"><button type="button" class="${allModesSelected ? "is-selected" : ""}" aria-pressed="${allModesSelected}" data-action="practice-mode" data-kind="${kind}" data-value="all">全部混合</button>${QUESTION_MODES.map((mode) => `<button type="button" class="${config.modes.includes(mode.id) ? "is-selected" : ""}" aria-pressed="${config.modes.includes(mode.id)}" data-action="practice-mode" data-kind="${kind}" data-value="${mode.id}" title="${mode.detail}">${mode.label}</button>`).join("")}</div></fieldset>
    <div class="practice-summary"><strong>${pool.length} 个候选词 · 本轮 ${count} 题</strong><span>${scopeLabel(config.scope)} × ${filterLabel(config.filter)} × ${modeLabelList(config.modes)}</span><small>按错词、Again、Hard 与低掌握度加权；同轮不重复，近期出现词会降权。</small></div>
  </div>`;
}

function renderTest(setId) {
  const set = getSet(setId);
  if (quizSession?.setId !== set.id) quizSession = null;
  if (quizSession?.finished) return renderQuizResult(set);
  if (quizSession?.started) return renderQuestion(set);
  const pool = practiceCandidates(testConfig, set.id);
  const count = effectiveQuestionCount(testConfig, pool);
  const best = testConfig.scope === "set" && testConfig.filter === "all" ? progress.setScores[set.id] : undefined;
  return `<section class="view test-workspace"><header class="workspace-header"><div><p class="eyebrow">RANDOMIZED TEST</p><h1>随机测试</h1><p>题序与选项每轮重排，弱词优先但同轮不重复。</p></div>${best !== undefined ? `<span class="workspace-note">本组最佳 ${best}%</span>` : ""}</header><section class="test-mobile-config"><div class="test-mobile-config-head"><span class="rail-caption">TEST SETUP</span><strong>设置本轮测试</strong></div>${renderPracticeControls("test", testConfig, set.id)}</section><section class="test-ready-panel"><div class="test-ready-copy"><span class="rail-caption">READY TO RETRIEVE</span><h2>先主动提取，再精确辨认。</h2><p>设置范围、题量和题型后开始；进入测试后，配置会收为摘要，让注意力集中在题目本身。</p><dl><div><dt>范围</dt><dd>${scopeLabel(testConfig.scope)}</dd></div><div><dt>候选词</dt><dd>${pool.length}</dd></div><div><dt>本轮题量</dt><dd>${count}</dd></div><div><dt>题型</dt><dd>${testConfig.modes.length} 种</dd></div></dl><button class="button" type="button" data-action="start-quiz" data-set="${set.id}" ${count?"":"disabled"}>开始测试 ${count} 题 →</button></div><div class="test-word-preview"><span class="rail-caption">SOURCE SET · ${set.range}</span>${set.lessons.map((lesson,index)=>`<div><span>${index+1}</span><strong>${lesson.word}</strong><small>${lesson.coreZh}</small></div>`).join("")}</div></section></section>`;
}

function correctAnswerText(question) {
  return question.kind === "text" ? question.answerText : question.options[question.answer];
}

function renderAnswerControl(question, selected, kind) {
  const answered = selected !== null;
  if (question.kind === "text") {
    return `<form class="spelling-answer" data-submit="${kind}-answer"><label for="${kind}-typed-answer">Type your answer · 输入英文拼写</label><div><input id="${kind}-typed-answer" name="answer" type="text" value="${answered ? escapeAttribute(selected) : ""}" autocomplete="off" autocapitalize="none" spellcheck="false" ${answered ? "disabled" : "autofocus required"}><button class="button" type="submit" ${answered ? "disabled" : ""}>Check · 检查</button></div></form>`;
  }
  const action = kind === "quiz" ? "answer-question" : kind === "ielts" ? "answer-ielts-question" : "answer-review";
  const optionLanguage = question.mode === "en-zh" ? "zh-CN" : "en";
  return `<div class="options">${question.options.map((option, index) => `<button type="button" class="option ${selected === index ? "is-selected" : ""} ${answered && index === question.answer ? "is-correct" : ""} ${answered && selected === index && index !== question.answer ? "is-wrong" : ""}" data-action="${action}" data-index="${index}" ${answered ? "disabled" : ""}><span class="option-key">${String.fromCharCode(65 + index)}</span><span lang="${optionLanguage}">${option}</span></button>`).join("")}</div>`;
}

function renderQuestionFeedback(question, selected) {
  const correct = isQuestionCorrect(question, selected);
  return `<div class="feedback ${correct ? "" : "wrong"}" tabindex="-1"><strong>${correct ? "Correct · 回答正确。" : `Not quite · 不正确。答案是 ${correctAnswerText(question)}。`}</strong><p lang="en">${question.explanation}</p><p lang="zh-CN">${question.explanationZh}</p></div>`;
}

function questionPromptLanguage(question) { return question.mode === "zh-en" ? "zh-CN" : "en"; }

function renderQuestion() {
  const question = quizSession.questions[quizSession.index];
  const answered = quizSession.selected !== null;
  return `<section class="view test-question-workspace"><section class="quiz-shell focused-quiz"><div class="quiz-top"><span>${quizSession.index + 1} / ${quizSession.questions.length}</span><div class="quiz-mini-track"><span style="width:${((quizSession.index + 1) / quizSession.questions.length) * 100}%"></span></div><strong><span lang="en">${question.type}</span> · ${question.typeZh}</strong><button class="quiz-inline-exit" type="button" data-action="exit-quiz">退出本轮</button></div><div class="quiz-body"><p class="question-type"><span lang="en">${question.type}</span> · ${question.typeZh}</p><h2 class="question-text" lang="${questionPromptLanguage(question)}">${question.prompt}</h2><p class="recall-zh">${question.promptZh}</p>${renderAnswerControl(question, quizSession.selected, "quiz")}${answered ? `<div class="test-mobile-feedback">${renderQuestionFeedback(question, quizSession.selected)}<button class="button wide" type="button" data-action="next-question">${quizSession.index === quizSession.questions.length - 1 ? "查看结果 →" : "下一题 →"}</button></div>` : ""}</div>${answered ? `<footer class="quiz-action-dock"><span>${isQuestionCorrect(question, quizSession.selected) ? "答对了：掌握度保持不变" : "已加入错题集：掌握度保持不变"}</span></footer>` : ""}</section><button class="button secondary test-mobile-exit" type="button" data-action="exit-quiz">退出本轮</button></section>`;
}

function renderQuizResult(set) {
  const total = quizSession.questions.length;
  const percentage = Math.round((quizSession.score / total) * 100);
  return `<section class="view"><header class="test-hero"><p class="eyebrow">RESULT · 随机加权轮次</p><h1>Test complete · 测试完成</h1><p>本轮每个单词只出现一次；错题已进入错题集，掌握度保持不变。</p></header><section class="quiz-shell result-card"><div class="score-ring" style="--score:${percentage}%"><strong>${quizSession.score}/${total}</strong></div><h2>${percentage >= 90 ? "Excellent precision · 辨析很精准。" : percentage >= 70 ? "A strong retrieval pass · 检索表现不错。" : "Strengthen the weak links · 请优先巩固薄弱词。"}</h2><p>${quizSession.scheduleSummary}</p><div class="result-actions"><button class="button secondary" type="button" data-route="review">进入统一复习中心</button><button class="button" type="button" data-action="restart-quiz" data-set="${set.id}">New randomized round · 新随机轮次</button></div></section></section>`;
}

function renderReviewCenter() {
  const candidates = practiceCandidates(reviewConfig, progress.selectedSet);
  const count = reviewSelection.size || effectiveQuestionCount(reviewConfig, candidates);
  const mobileFilters = [["again","本轮重学"],["hard","困难词"],["good","常规巩固"],["easy","快速巡检"],["wrong","错题"],["favorite","收藏"],["all","全部词"]];
  return `<section class="view review-workspace"><header class="workspace-header"><div><p class="eyebrow">UNIFIED REVIEW</p><h1>复习中心</h1><p>${filterLabel(reviewConfig.filter)} · ${candidates.length} 个候选词</p></div><span class="workspace-note">弱项加权 · 同轮不重复</span></header>
    <section class="review-session-builder"><div class="review-mobile-filter"><span>复习清单</span><div class="compact-segments">${mobileFilters.map(([key,label])=>`<button type="button" class="${reviewConfig.filter===key?"is-selected":""}" data-action="practice-filter" data-kind="review" data-value="${key}">${label}</button>`).join("")}</div></div><div><span>复习范围</span><div class="compact-segments">${PRACTICE_SCOPES.map(([key,label])=>`<button type="button" class="${reviewConfig.scope===key?"is-selected":""}" data-action="practice-scope" data-kind="review" data-value="${key}">${label}</button>`).join("")}</div></div><div><span>题目数量</span><div class="compact-segments">${QUESTION_COUNTS.slice(0,4).map(value=>`<button type="button" class="${reviewConfig.count===value?"is-selected":""}" data-action="practice-count" data-kind="review" data-value="${value}">${value}</button>`).join("")}</div></div><div class="builder-modes"><span>出题模式</span><div class="compact-segments">${QUESTION_MODES.map(mode=>`<button type="button" class="${reviewConfig.modes.includes(mode.id)?"is-selected":""}" data-action="practice-mode" data-kind="review" data-value="${mode.id}">${mode.label}</button>`).join("")}</div></div></section>
    ${candidates.length ? `<div class="data-table-shell review-table-shell"><table class="review-table"><thead><tr><th><input type="checkbox" aria-label="全选当前列表" data-action="select-review-page" ${candidates.length && candidates.every(item=>reviewSelection.has(item.number))?"checked":""}></th><th>单词</th><th>中文释义</th><th>来源</th><th>当前分组</th><th>错误次数</th><th>上次结果</th><th>操作</th></tr></thead><tbody>${candidates.map(renderReviewRow).join("")}</tbody></table></div><div class="review-action-bar"><div><span>已选择</span><strong>${reviewSelection.size || count}</strong><span>项 · 预计 ${Math.max(2,Math.ceil(count*.65))} 分钟</span></div><button class="button" type="button" data-action="start-review">开始复习 ${count} 词 →</button></div>` : `<div class="empty-state"><strong>✓</strong><h2>这个清单目前为空</h2><p>切换左侧复习清单，或先学习、测试、收藏一些单词。</p></div>`}
  </section>`;
}

function renderReviewRow(lesson) {
  const record = getRecord(lesson.number);
  return `<tr class="${reviewSelection.has(lesson.number)?"is-selected":""}"><td><input type="checkbox" aria-label="选择 ${lesson.word}" data-action="toggle-review-selection" data-number="${lesson.number}" ${reviewSelection.has(lesson.number)?"checked":""}></td><td><button type="button" class="table-word" data-route="learn/${lesson.number}">${lesson.word}</button><small>${lesson.ipa}</small></td><td>${lesson.coreZh}</td><td>${lesson.setId ? `SET ${String(lesson.setId).padStart(2,"0")}` : "尾词"}</td><td><span class="mastery-pill mastery-${record?.bucket||"new"}">${record?BUCKET_META[record.bucket]?.label||"Learned":"未学习"}</span></td><td>${record?.wrongCount||0}</td><td><span class="last-result ${record?.needsCorrection?"is-wrong":"is-correct"}">${record ? (record.needsCorrection?"错误":"正确") : "—"}</span></td><td><button class="table-icon-button ${record?.favorite?"is-active":""}" type="button" data-action="toggle-favorite" data-number="${lesson.number}">${record?.favorite?"★":"☆"}</button><button class="table-more" type="button" data-route="learn/${lesson.number}">•••</button></td></tr>`;
}

function createSessionSeed(kind) {
  const uuid = globalThis.crypto?.randomUUID?.();
  return uuid ? `${kind}-${uuid}` : `${kind}-${Date.now()}-${Math.random()}`;
}

function questionsForConfig(config, setId, seed) {
  const candidates = practiceCandidates(config, setId);
  return buildPracticeSession({
    candidates,
    allLessons: lessons,
    records: progress.records,
    count: effectiveQuestionCount(config, candidates),
    modes: config.modes,
    recentWordNumbers: progress.recentQuestionWords,
    random: createSeededRandom(seed),
  });
}

function startReview(options = {}) {
  const seed = createSessionSeed("review");
  const activeConfig = options.config || reviewConfig;
  const selectedCandidates = options.candidates || (reviewSelection.size ? lessons.filter((lesson)=>reviewSelection.has(lesson.number)) : practiceCandidates(activeConfig, progress.selectedSet));
  const requestedCount = options.candidates ? selectedCandidates.length : reviewSelection.size || effectiveQuestionCount(activeConfig,selectedCandidates);
  const questions = buildPracticeSession({ candidates:selectedCandidates, allLessons:lessons, records:progress.records, count:requestedCount, modes:activeConfig.modes, recentWordNumbers:progress.recentQuestionWords, random:createSeededRandom(seed) });
  if (!questions.length) return showToast("当前范围与清单没有候选词");
  reviewSession = {
    questions,
    seed,
    config: { ...activeConfig, modes: [...activeConfig.modes] },
    sourceSetId: options.sourceSetId || null,
    index: 0,
    selected: null,
    correct: 0,
    answered: 0,
    againCount: 0,
    results: [],
  };
  rememberQuestionWords([questions[0]]);
  saveProgress({ rail: false });
  if (parseRoute().name === "review") render();
  else navigate("review");
  focusQuestionControl();
}

function startUnitReview(setId) {
  const set = getSet(clampSet(setId));
  progress.selectedSet = set.id;
  progress.selectedChapter = chapterForSet(set.id);
  const config = { scope: "set", filter: "all", count: 5, modes: [...ALL_MODE_IDS] };
  reviewSelection = new Set(set.lessons.map((lesson) => lesson.number));
  startReview({ candidates: [...set.lessons], config, sourceSetId: set.id });
}

function renderReviewSession() {
  if (reviewSession.index >= reviewSession.questions.length) return renderReviewComplete();
  const question = reviewSession.questions[reviewSession.index];
  const answered = reviewSession.selected !== null;
  return `<section class="view review-question-workspace test-question-workspace"><section class="quiz-shell focused-quiz"><div class="quiz-top"><span>${reviewSession.index + 1} / ${reviewSession.questions.length}</span><div class="quiz-mini-track"><span style="width:${((reviewSession.index + 1) / reviewSession.questions.length) * 100}%"></span></div><strong><span lang="en">${question.type}</span> · ${question.typeZh}</strong><button class="quiz-inline-exit" type="button" data-action="exit-review">退出本轮</button></div><div class="quiz-body"><p class="question-type"><span lang="en">${question.type}</span> · ${question.typeZh}</p><h2 class="question-text" lang="${questionPromptLanguage(question)}">${question.prompt}</h2><p class="recall-zh">${question.promptZh}</p>${renderAnswerControl(question, reviewSession.selected, "review")}${answered ? `<div class="test-mobile-feedback">${renderQuestionFeedback(question, reviewSession.selected)}<button class="button wide" type="button" data-action="next-review-question">${reviewSession.index === reviewSession.questions.length - 1 ? "查看结果 →" : "下一题 →"}</button></div>` : ""}</div>${answered ? `<footer class="quiz-action-dock"><span>${isQuestionCorrect(question, reviewSession.selected) ? "答对了：掌握度保持不变" : "已加入错题集：掌握度保持不变"}</span></footer>` : ""}</section><button class="button secondary test-mobile-exit" type="button" data-action="exit-review">退出本轮</button></section>`;
}

function answerReview(response) {
  if (!reviewSession || reviewSession.selected !== null) return;
  const question = reviewSession.questions[reviewSession.index];
  reviewSession.selected = response;
  reviewSession.answered += 1;
  const correct = isQuestionCorrect(question, response);
  if (correct) reviewSession.correct += 1;
  reviewSession.results[reviewSession.index] = { correct, response };
  recordTestOutcome(question.wordNumber, correct, "review");
  saveProgress({ rail: false });
  app.innerHTML = renderReviewSession();
  renderRail(true);
  renderContextRail(parseRoute());
  focusQuestionFeedback();
}

function nextReviewQuestion() {
  if (!reviewSession || reviewSession.selected === null) return;
  reviewSession.index += 1;
  reviewSession.selected = null;
  if (reviewSession.index >= reviewSession.questions.length && !reviewSession.finalized) {
    const percentage = reviewSession.answered ? Math.round((reviewSession.correct / reviewSession.answered) * 100) : 0;
    if (reviewSession.sourceSetId) progress.setScores[reviewSession.sourceSetId] = Math.max(progress.setScores[reviewSession.sourceSetId] || 0, percentage);
    progress.quizHistory.unshift({ setId: reviewSession.sourceSetId, score: reviewSession.correct, total: reviewSession.answered, scope: reviewSession.config.scope, filter: reviewSession.config.filter, modes: reviewSession.config.modes, words: reviewSession.questions.map((question) => question.wordNumber), seed: reviewSession.seed, source: "review", at: new Date().toISOString() });
    progress.quizHistory = progress.quizHistory.slice(0, 50);
    reviewSession.finalized = true;
  }
  if (reviewSession.index < reviewSession.questions.length) rememberQuestionWords([reviewSession.questions[reviewSession.index]]);
  saveProgress({ rail: false });
  render({ forceRail: true, scroll: false });
  focusQuestionControl();
}

function renderReviewComplete() {
  const rate = reviewSession.answered ? Math.round((reviewSession.correct / reviewSession.answered) * 100) : 0;
  return `<section class="view result-workspace"><header class="workspace-header"><div><p class="eyebrow">ROUND COMPLETE · 本轮完成</p><h1>检索练习完成</h1><p>错题已自动进入错题集，本轮不会改变任何词的掌握度。</p></div><span class="workspace-note">${rate}% 正确率</span></header><section class="quiz-shell result-card"><div class="score-ring" style="--score:${rate}%"><strong>${reviewSession.correct}/${reviewSession.answered}</strong></div><h2>完成一次无重复的检索练习。</h2><p>本轮错题 ${reviewSession.answered - reviewSession.correct} 个。新一轮会更换随机顺序，并对刚出现的词短期降权。</p><div class="result-actions"><button class="button secondary" type="button" data-action="exit-review">返回复习中心</button><button class="button" type="button" data-action="restart-review">新加权轮次 →</button></div></section></section>`;
}

function startQuiz(setId) {
  const seed = createSessionSeed("test");
  const questions = questionsForConfig(testConfig, setId, seed);
  if (!questions.length) return showToast("当前范围与清单没有候选词");
  quizSession = {
    setId,
    questions,
    seed,
    config: { ...testConfig, modes: [...testConfig.modes] },
    started: true,
    index: 0,
    selected: null,
    score: 0,
    finished: false,
    results: {},
  };
  rememberQuestionWords([questions[0]]);
  saveProgress({ rail: false });
  app.innerHTML = renderQuestion();
  renderRail(true);
  renderContextRail(parseRoute());
  focusQuestionControl();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function answerQuestion(response) {
  if (!quizSession || quizSession.selected !== null) return;
  const question = quizSession.questions[quizSession.index];
  quizSession.selected = response;
  const correct = isQuestionCorrect(question, response);
  if (correct) quizSession.score += 1;
  if (!quizSession.results[question.wordNumber]) quizSession.results[question.wordNumber] = { correct: 0, total: 0 };
  quizSession.results[question.wordNumber].total += 1;
  if (correct) quizSession.results[question.wordNumber].correct += 1;
  recordTestOutcome(question.wordNumber, correct, "test");
  saveProgress({ rail: false });
  app.innerHTML = renderQuestion();
  renderContextRail(parseRoute());
  focusQuestionFeedback();
}

function nextQuestion() {
  if (quizSession.index < quizSession.questions.length - 1) {
    quizSession.index += 1;
    quizSession.selected = null;
    rememberQuestionWords([quizSession.questions[quizSession.index]]);
    saveProgress({ rail: false });
    app.innerHTML = renderQuestion();
    renderContextRail(parseRoute());
    focusQuestionControl();
  }
  else finishQuiz();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function finishQuiz() {
  const wrongWords = quizSession.questions.filter((question) => {
    const result = quizSession.results[question.wordNumber];
    return result && result.correct !== result.total;
  }).map((question) => getLessonByNumber(question.wordNumber).word);
  const percentage = Math.round((quizSession.score / quizSession.questions.length) * 100);
  if (quizSession.config.scope === "set" && quizSession.config.filter === "all") {
    progress.setScores[quizSession.setId] = Math.max(progress.setScores[quizSession.setId] || 0, percentage);
  }
  progress.quizHistory.unshift({
    setId: quizSession.setId,
    score: quizSession.score,
    total: quizSession.questions.length,
    scope: quizSession.config.scope,
    filter: quizSession.config.filter,
    modes: quizSession.config.modes,
    words: quizSession.questions.map((question) => question.wordNumber),
    seed: quizSession.seed,
    at: new Date().toISOString(),
  });
  progress.quizHistory = progress.quizHistory.slice(0, 50);
  quizSession.finished = true;
  quizSession.scheduleSummary = wrongWords.length ? `已加入错题集：${wrongWords.slice(0, 12).join(" · ")}${wrongWords.length > 12 ? ` · 另 ${wrongWords.length - 12} 词` : ""}` : "本轮无错题；所有单词的掌握度均保持不变。";
  saveProgress();
  app.innerHTML = renderQuizResult(getSet(quizSession.setId));
  renderRail(true);
  renderContextRail(parseRoute());
}

function focusQuestionControl() {
  requestAnimationFrame(() => document.querySelector("[autofocus], [data-action='answer-question'], [data-action='answer-review']")?.focus());
}

function focusQuestionFeedback() {
  requestAnimationFrame(() => document.querySelector(".feedback")?.focus());
}

function resetWord(number) {
  const old = getRecord(number);
  const favorite = Boolean(old?.favorite);
  const setId = getSetForLesson(number)?.id || null;
  if (favorite) progress.records[number] = { ...makeRecord(number), favorite: true };
  else delete progress.records[number];
  progress.recentQuestionWords = normalizeRecentWords(progress.recentQuestionWords).filter((recentNumber) => recentNumber !== number);
  progress.quizHistory = (progress.quizHistory || []).filter((entry) => {
    if (Array.isArray(entry.words)) return !entry.words.map(Number).includes(number);
    return setId === null || Number(entry.setId) !== setId;
  });
  if (setId !== null) delete progress.setScores[setId];
  if (quizSession?.questions.some((question) => question.wordNumber === number)) quizSession = null;
  if (reviewSession?.questions.some((question) => question.wordNumber === number)) reviewSession = null;
  saveProgress();
  render();
  showToast(`${getLessonByNumber(number).word} 的学习与测试进度已重置`);
}

function refreshSpeechVoices() {
  if (!("speechSynthesis" in window)) return [];
  const voices = speechSynthesis.getVoices();
  if (voices.length) cachedSpeechVoices = voices;
  return cachedSpeechVoices;
}

function bestSpeechVoice(lang) {
  const voices = refreshSpeechVoices();
  const prefix = lang.toLowerCase().split("-")[0];
  const preferredNames = prefix === "zh"
    ? ["Tingting", "Meijia", "Sinji", "Li-mu", "Microsoft Xiaoxiao Online", "Google 普通话"]
    : ["Ava", "Samantha", "Zoe", "Evan", "Nathan", "Google US English", "Microsoft Aria Online", "Microsoft Jenny Online", "Karen", "Daniel"];
  const candidates = voices.filter((voice) => voice.lang?.toLowerCase().startsWith(prefix));
  return candidates.sort((a, b) => {
    const score = (voice) => {
      const name = voice.name || "";
      const lower = name.toLowerCase();
      const preferredIndex = preferredNames.findIndex((item) => lower.includes(item.toLowerCase()));
      const exactLanguage = voice.lang?.toLowerCase() === lang.toLowerCase() ? 35 : 20;
      const quality = /premium|enhanced|natural|neural|online/.test(lower) ? 90 : 0;
      const preferred = preferredIndex >= 0 ? 70 - preferredIndex * 5 : 0;
      const standard = voice.default ? 5 : 0;
      const noveltyPenalty = /bad news|bells|boing|bubbles|cellos|good news|organ|trinoids|whisper|zarvox/.test(lower) ? 200 : 0;
      return exactLanguage + quality + preferred + standard - noveltyPenalty;
    };
    return score(b) - score(a);
  })[0] || null;
}

async function dictionaryPronunciationUrl(text) {
  const word = text.trim().toLowerCase();
  if (!/^[a-z][a-z'-]*$/.test(word)) return null;
  if (dictionaryAudioCache.has(word)) return dictionaryAudioCache.get(word);

  const request = (async () => {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (!response.ok) throw new Error(`Dictionary audio request failed: ${response.status}`);
      const entries = await response.json();
      const recordings = entries
        .flatMap((entry) => entry.phonetics || [])
        .map((phonetic) => phonetic.audio)
        .filter(Boolean)
        .map((url) => url.startsWith("//") ? `https:${url}` : url);
      const recording = recordings.find((url) => /(?:-|\/)us(?:\.|-|\/)/i.test(url)) || recordings[0] || null;
      dictionaryAudioCache.set(word, recording);
      return recording;
    } catch (error) {
      console.info("Recorded pronunciation unavailable; using speech fallback.", error);
      dictionaryAudioCache.set(word, null);
      return null;
    }
  })();
  dictionaryAudioCache.set(word, request);
  return request;
}

async function preloadRecordedPronunciation(text) {
  const word = text.trim().toLowerCase();
  if (!/^[a-z][a-z'-]*$/.test(word)) return false;
  const recording = await dictionaryPronunciationUrl(word);
  if (!recording) return false;
  if (prefetchedPronunciation?.word === word) return true;
  const audio = new Audio(recording);
  audio.preload = "auto";
  audio.load();
  prefetchedPronunciation = { word, recording, audio };
  return true;
}

async function playRecordedPronunciation(text, requestId) {
  const recording = await dictionaryPronunciationUrl(text);
  if (!recording || requestId !== activeSpeechRequest) return false;
  window.speechSynthesis?.cancel?.();
  activePronunciationAudio?.pause();
  const word = text.trim().toLowerCase();
  const audio = prefetchedPronunciation?.word === word && prefetchedPronunciation.recording === recording
    ? prefetchedPronunciation.audio
    : new Audio(recording);
  audio.currentTime = 0;
  activePronunciationAudio = audio;
  audio.preload = "auto";
  audio.addEventListener("ended", () => {
    if (activePronunciationAudio === audio) activePronunciationAudio = null;
  }, { once: true });
  await audio.play();
  return true;
}

function rememberNeuralAudio(key, url) {
  if (neuralAudioCache.has(key)) URL.revokeObjectURL(neuralAudioCache.get(key));
  neuralAudioCache.set(key, url);
  while (neuralAudioCache.size > 48) {
    const [oldestKey, oldestUrl] = neuralAudioCache.entries().next().value;
    URL.revokeObjectURL(oldestUrl);
    neuralAudioCache.delete(oldestKey);
  }
}

const PERSISTENT_SPEECH_CACHE = "vocab-neural-tts-v1";

async function neuralSpeechDigest(text, lang) {
  if (!globalThis.crypto?.subtle) return null;
  const bytes = new TextEncoder().encode(`${lang}\0${text}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function isAudioResponse(response) {
  return response?.ok && /^audio\//i.test(response.headers.get("content-type") || "");
}

async function cachedNeuralSpeechBlob(staticPath) {
  if (!("caches" in window)) return null;
  const cached = await caches.match(staticPath);
  return isAudioResponse(cached) ? cached.blob() : null;
}

async function persistNeuralSpeech(staticPath, blob) {
  if (!("caches" in window)) return;
  const cache = await caches.open(PERSISTENT_SPEECH_CACHE);
  await cache.put(staticPath, new Response(blob, {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=31536000, immutable" },
  }));
}

async function neuralSpeechAudio(text, lang) {
  const key = `${lang}:${text}`;
  if (neuralAudioCache.has(key)) {
    const url = neuralAudioCache.get(key);
    neuralAudioCache.delete(key);
    neuralAudioCache.set(key, url);
    return url;
  }
  if (neuralAudioPending.has(key)) return neuralAudioPending.get(key);
  const request = (async () => {
    try {
      const digest = await neuralSpeechDigest(text, lang);
      const staticPath = digest ? `./tts/${digest}.mp3` : null;
      let blob = staticPath ? await cachedNeuralSpeechBlob(staticPath) : null;
      if (!blob && staticPath) {
        const staticResponse = await fetch(staticPath, { cache: "force-cache" });
        if (isAudioResponse(staticResponse)) blob = await staticResponse.blob();
      }
      if (blob) {
        const url = URL.createObjectURL(blob);
        rememberNeuralAudio(key, url);
        return url;
      }
      if (Date.now() < neuralSpeechRetryAfter) return null;
      // GitHub Pages serves this app from a repository subpath and has no
      // server-side speech endpoint. Skip the unavailable request there so
      // dictionary audio / device speech can take over without a long delay.
      if (location.hostname.endsWith(".github.io")) return null;
      const response = await fetch("./api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang }),
      });
      if (!response.ok) throw new Error(`Neural speech request failed: ${response.status}`);
      blob = await response.blob();
      if (staticPath) await persistNeuralSpeech(staticPath, blob).catch(() => {});
      const url = URL.createObjectURL(blob);
      rememberNeuralAudio(key, url);
      return url;
    } catch (error) {
      console.info("Neural speech unavailable; using speech fallback.", error);
      neuralSpeechRetryAfter = Date.now() + 60_000;
      return null;
    } finally {
      neuralAudioPending.delete(key);
    }
  })();
  neuralAudioPending.set(key, request);
  return request;
}

function speechLanguage(text) {
  const chineseCharacters = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const latinCharacters = (text.match(/[A-Za-z]/g) || []).length;
  return chineseCharacters > latinCharacters * 0.35 ? "zh-CN" : "en-US";
}

function speechPreloadKey(text) {
  const spokenText = text.trim();
  return /^[A-Za-z][A-Za-z'-]*$/.test(spokenText)
    ? `word:${spokenText.toLowerCase()}`
    : `${speechLanguage(spokenText)}:${spokenText}`;
}

async function preloadSpeechText(text) {
  const spokenText = String(text || "").trim();
  if (!spokenText) return false;
  if (/^[A-Za-z][A-Za-z'-]*$/.test(spokenText)) {
    const neuralReady = await neuralSpeechAudio(spokenText, "en-US");
    if (neuralReady) return true;
    return preloadRecordedPronunciation(spokenText);
  }
  return Boolean(await neuralSpeechAudio(spokenText, speechLanguage(spokenText)));
}

function setSpeechPreloadState(text, state) {
  document.querySelectorAll('[data-action="speak"][data-text]').forEach((button) => {
    if (button.dataset.text === text) button.dataset.preloadState = state;
  });
}

function drainSpeechPreloadQueue() {
  while (speechPreloadRunning < 2 && speechPreloadQueue.length) {
    const item = speechPreloadQueue.shift();
    speechPreloadRunning += 1;
    setSpeechPreloadState(item.text, "loading");
    void preloadSpeechText(item.text).then((ready) => {
      setSpeechPreloadState(item.text, ready ? "ready" : "unavailable");
    }).finally(() => {
      speechPreloadRunning -= 1;
      speechPreloadQueued.delete(item.key);
      drainSpeechPreloadQueue();
    });
  }
}

function queueSpeechPreload(text, { priority = false } = {}) {
  const spokenText = String(text || "").trim();
  if (!spokenText) return;
  const key = speechPreloadKey(spokenText);
  if (speechPreloadQueued.has(key)) return;
  speechPreloadQueued.add(key);
  setSpeechPreloadState(spokenText, "queued");
  const item = { key, text: spokenText };
  if (priority) speechPreloadQueue.unshift(item);
  else speechPreloadQueue.push(item);
  drainSpeechPreloadQueue();
}

function preloadSpeechButtons(root = document, { priority = false, limit = 8, includeHidden = false } = {}) {
  const buttons = Array.from(root.querySelectorAll('[data-action="speak"][data-text]'))
    .filter((button) => button.isConnected && (includeHidden || button.getClientRects().length > 0))
    .slice(0, limit);
  buttons.forEach((button) => queueSpeechPreload(button.dataset.text, { priority }));
}

function scheduleVisibleSpeechPreloads(root = document) {
  const preload = () => preloadSpeechButtons(root, { limit: 8 });
  if ("requestIdleCallback" in window) window.requestIdleCallback(preload, { timeout: 900 });
  else window.setTimeout(preload, 120);
}

function scheduleNeighborPronunciationPreloads(words) {
  const preload = () => words.filter(Boolean).forEach((word) => void preloadSpeechText(word));
  if ("requestIdleCallback" in window) window.requestIdleCallback(preload, { timeout: 1_500 });
  else window.setTimeout(preload, 250);
}

function warmSpeechFromInteraction(event) {
  const button = event.target.closest?.('[data-action="speak"][data-text]');
  if (button) queueSpeechPreload(button.dataset.text, { priority: true });
  const panelButton = event.target.closest?.('[data-action="show-learning-panel"][data-panel]');
  if (panelButton) {
    const panel = document.querySelector(`[data-learning-panel="${panelButton.dataset.panel}"]`);
    if (panel) preloadSpeechButtons(panel, { priority: true, limit: 12, includeHidden: true });
  }
  const phraseButton = event.target.closest?.('[data-action="toggle-phrase"][data-target]');
  if (phraseButton) {
    const detail = document.getElementById(phraseButton.dataset.target);
    if (detail) preloadSpeechButtons(detail, { priority: true, limit: 4, includeHidden: true });
  }
}

async function playNeuralSpeech(text, lang, requestId) {
  const url = await neuralSpeechAudio(text, lang);
  if (!url || requestId !== activeSpeechRequest) return false;
  window.speechSynthesis?.cancel?.();
  activePronunciationAudio?.pause();
  const audio = new Audio(url);
  activePronunciationAudio = audio;
  audio.preload = "auto";
  audio.addEventListener("ended", () => {
    if (activePronunciationAudio === audio) activePronunciationAudio = null;
  }, { once: true });
  await audio.play();
  return true;
}

function speakWithSystemFallback(spokenText, lang) {
  if (!("speechSynthesis" in window)) return showToast("在线发音暂不可用，请检查网络后重试");
  activePronunciationAudio?.pause();
  activePronunciationAudio = null;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(spokenText);
  utterance.lang = lang;
  const voice = bestSpeechVoice(utterance.lang);
  if (voice) utterance.voice = voice;
  const isSingleEnglishWord = utterance.lang === "en-US" && !spokenText.includes(" ");
  utterance.rate = utterance.lang === "zh-CN" ? 0.92 : isSingleEnglishWord ? 0.82 : 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;
  speechSynthesis.speak(utterance);
}

async function speak(text, trigger) {
  const requestId = ++activeSpeechRequest;
  const spokenText = text.trim();
  activePronunciationAudio?.pause();
  activePronunciationAudio = null;
  window.speechSynthesis?.cancel?.();
  trigger?.classList.add("is-loading");
  trigger?.setAttribute("aria-busy", "true");
  const chineseCharacters = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const latinCharacters = (text.match(/[A-Za-z]/g) || []).length;
  const lang = chineseCharacters > latinCharacters * 0.35 ? "zh-CN" : "en-US";
  try {
    if (await playNeuralSpeech(spokenText, lang, requestId)) return;
    if (/^[A-Za-z][A-Za-z'-]*$/.test(spokenText)) {
      try {
        if (await playRecordedPronunciation(spokenText, requestId)) return;
      } catch (error) {
        console.info("Recorded pronunciation could not be played; using system fallback.", error);
      }
    }
    if (requestId === activeSpeechRequest) speakWithSystemFallback(spokenText, lang);
  } catch (error) {
    console.info("Online speech could not be played; using speech fallback.", error);
    if (requestId === activeSpeechRequest) speakWithSystemFallback(spokenText, lang);
  } finally {
    trigger?.classList.remove("is-loading");
    trigger?.removeAttribute("aria-busy");
  }
}

if ("speechSynthesis" in window) {
  refreshSpeechVoices();
  speechSynthesis.addEventListener?.("voiceschanged", refreshSpeechVoices);
}

function exportLibrary() {
  const chapter = parseRoute().chapter || progress.selectedChapter;
  const chapterPool = libraryQuery ? lessons : lessons.filter((lesson) => chapterForLesson(lesson.number) === chapter);
  const queryPool = libraryQuery ? chapterPool.filter(matchesLibraryQuery) : chapterPool;
  const source = libraryStatusFilter === "all" ? queryPool : lessonsForFilter(libraryStatusFilter, queryPool);
  const rows = [["#","word","IPA","part of speech","中文核心释义","set","mastery","favorite"], ...source.map((lesson)=>{ const record=getRecord(lesson.number); return [lesson.number,lesson.word,lesson.ipa,lesson.pos,lesson.coreZh,lesson.setId,record?.bucket||"new",record?.favorite?"yes":"no"]; })];
  const csv = rows.map((row)=>row.map((value)=>`"${String(value??"").replaceAll('"','""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob(["\ufeff",csv],{type:"text/csv;charset=utf-8"}));
  const link = document.createElement("a");
  link.href = url;
  link.download = `GRE-vocabulary-${libraryQuery ? "search" : `chapter-${chapter}`}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  showToast(`已导出 ${source.length} 个单词`);
}

function escapeAttribute(value) { return String(value ?? "").replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;"); }
function showToast(message) { clearTimeout(toastTimer); toast.textContent = message; toast.classList.add("is-visible"); toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2500); }

function scrollToLearningSection(targetId, trigger) {
  const target = document.getElementById(targetId);
  if (!target) return showToast("这一部分暂时没有可显示的内容");
  const headerHeight = document.querySelector(".app-header")?.getBoundingClientRect().height || 0;
  const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - headerHeight - 14);
  window.scrollTo({ top, behavior: "auto" });
  document.querySelectorAll('[data-action="scroll-section"]').forEach((item) => {
    const current = item.dataset.target === targetId;
    item.classList.toggle("is-current", current);
    if (current) item.setAttribute("aria-current", "location");
    else item.removeAttribute("aria-current");
  });
  target.classList.remove("section-arrival");
  requestAnimationFrame(() => target.classList.add("section-arrival"));
  window.setTimeout(() => target.classList.remove("section-arrival"), 900);
  trigger?.blur();
}

function showLearningPanel(panel) {
  const target = document.querySelector(`[data-learning-panel="${panel}"]`);
  if (!target) return showToast("这一部分暂时没有可显示的内容");
  learningPanel = panel;
  document.querySelectorAll("[data-learning-panel]").forEach((item) => item.classList.toggle("is-active", item.dataset.learningPanel === panel));
  document.querySelectorAll('[data-action="show-learning-panel"]').forEach((item) => {
    const current = item.dataset.panel === panel;
    item.classList.toggle("is-current", current);
    item.setAttribute("aria-pressed", String(current));
  });
  document.querySelector(".learning-panel-stack")?.scrollTo({ top: 0, behavior: "auto" });
  preloadSpeechButtons(target, { priority: true, limit: 12, includeHidden: true });
}

function updatePracticeConfig(kind, field, value) {
  const current = kind === "test" ? testConfig : kind === "ielts" ? ieltsReviewConfig : reviewConfig;
  let next = { ...current, modes: [...current.modes] };
  if (field === "scope" && PRACTICE_SCOPES.some(([key]) => key === value)) next.scope = value;
  if (field === "filter" && REVIEW_FILTERS.some(([key]) => key === value)) next.filter = value;
  if (field === "count" && QUESTION_COUNTS.includes(Number(value))) next.count = Number(value);
  if (field === "mode") {
    if (value === "all") next.modes = [...ALL_MODE_IDS];
    else if (ALL_MODE_IDS.includes(value)) {
      if (next.modes.length === ALL_MODE_IDS.length) next.modes = [value];
      else if (next.modes.includes(value) && next.modes.length > 1) next.modes = next.modes.filter((mode) => mode !== value);
      else if (!next.modes.includes(value)) next.modes = ALL_MODE_IDS.filter((mode) => next.modes.includes(mode) || mode === value);
    }
  }
  if (kind === "test") testConfig = next;
  else if (kind === "ielts") ieltsReviewConfig = next;
  else reviewConfig = next;
  render({ scroll: false });
  const action = { scope: "practice-scope", filter: "practice-filter", count: "practice-count", mode: "practice-mode" }[field];
  requestAnimationFrame(() => document.querySelector(`[data-action="${action}"][data-kind="${kind}"][data-value="${value}"]`)?.focus());
}

document.addEventListener("input", (event) => {
  if (event.target.id !== "library-search") return;
  const cursor = event.target.selectionStart;
  const route = parseRoute();
  if (route.corpus === "ielts") {
    ieltsLibraryQuery = event.target.value;
    renderIeltsApp(route, { scroll: false });
  } else {
    libraryQuery = event.target.value;
    app.innerHTML = renderLibrary(route.chapter || progress.selectedChapter);
    renderContextRail(route);
  }
  const input = document.querySelector("#library-search");
  input?.focus();
  input?.setSelectionRange(cursor, cursor);
});

document.addEventListener("change", (event) => {
  if (event.target.id === "mobile-ielts-learning-category-select") {
    const firstGroup = ieltsCategoryGroups(Number(event.target.value))[0];
    if (firstGroup) navigate(`ielts/learn/${firstGroup.primaryAppId}`);
    return;
  }
  if (event.target.id === "mobile-ielts-learning-group-select") {
    const group = getIeltsGroup(Number(event.target.value));
    if (group) navigate(`ielts/learn/${group.primaryAppId}`);
    return;
  }
  if (event.target.id === "mobile-learning-chapter-select") {
    const firstSet = chapterSets(clampChapter(event.target.value))[0];
    if (firstSet) navigate(`learn/${firstSet.lessons[0].number}`);
    return;
  }
  if (event.target.id === "mobile-learning-set-select") {
    const set = getSet(clampSet(event.target.value));
    if (set) navigate(`learn/${set.lessons[0].number}`);
    return;
  }
  if (event.target.id === "ielts-learning-category-select") {
    const firstGroup = ieltsCategoryGroups(Number(event.target.value))[0];
    if (firstGroup) navigate(`ielts/learn/${firstGroup.primaryAppId}`);
    return;
  }
  if (event.target.id === "ielts-learning-group-select") {
    const group = getIeltsGroup(Number(event.target.value));
    if (group) navigate(`ielts/learn/${group.primaryAppId}`);
    return;
  }
  if (event.target.id === "learning-chapter-select") {
    const firstSet = chapterSets(clampChapter(event.target.value))[0];
    if (firstSet) navigate(`learn/${firstSet.lessons[0].number}`);
    return;
  }
  if (event.target.id === "learning-set-select") {
    const set = getSet(clampSet(event.target.value));
    navigate(`learn/${set.lessons[0].number}`);
    return;
  }
  if (event.target.id !== "library-status-select") return;
  if (parseRoute().corpus === "ielts") ieltsLibraryStatusFilter = event.target.value;
  else libraryStatusFilter = event.target.value;
  render({ forceRail: true, scroll: false });
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-submit]");
  if (!form) return;
  event.preventDefault();
  if (form.dataset.submit === "global-search") {
    const query = form.elements.query?.value?.trim() || "";
    if (!query) return showToast("请输入要搜索的单词或中文释义");
    if (parseRoute().corpus === "ielts") {
      ieltsLibraryQuery = query;
      ieltsLibraryStatusFilter = "all";
      navigate("ielts/library");
      return;
    }
    libraryQuery = query;
    libraryStatusFilter = "all";
    navigate(`library/${progress.selectedChapter}`);
    return;
  }
  const value = form.elements.answer?.value || "";
  if (!value.trim()) return showToast("请先输入英文答案");
  if (form.dataset.submit === "quiz-answer") answerQuestion(value);
  if (form.dataset.submit === "review-answer") answerReview(value);
  if (form.dataset.submit === "ielts-answer") answerIeltsQuestion(value);
});

function handleAppClick(event) {
  const routeButton = event.target.closest("button[data-route], a[data-route]");
  if (routeButton) {
    event.preventDefault();
    let route = routeButton.dataset.route;
    const currentRoute = parseRoute();
    if (route === "test" || route.startsWith("test/")) {
      if (currentRoute.corpus === "ielts") startIeltsTest();
      else startUnitReview(Number(route.split("/")[1]) || progress.selectedSet);
      return;
    }
    if (currentRoute.corpus === "ielts") {
      if (route === "learn") route = `learn/${ieltsProgress.lastWord}`;
      if (["learn", "story", "library", "review", "test"].some((name) => route === name || route.startsWith(`${name}/`))) route = `ielts/${route}`;
      navigate(route);
      return;
    }
    if (route === "learn") route = `learn/${progress.lastWord}`;
    if (route === "story") route = `story/${progress.selectedSet}`;
    if (route === "test") route = `test/${progress.selectedSet}`;
    if (route !== "review") reviewSession = null;
    navigate(route);
    return;
  }
  const button = event.target.closest("[data-action]");
  if (!button || button.disabled) return;
  event.preventDefault();
  const action = button.dataset.action;
  if (action === "go-home") navigate(parseRoute().corpus === "ielts" ? `ielts/learn/${ieltsProgress.lastWord}` : "home");
  if (action === "switch-corpus") { railSignature = ""; learningPanel = "memory"; navigate(parseRoute().corpus === "ielts" ? `learn/${progress.lastWord}` : `ielts/learn/${ieltsProgress.lastWord}`); }
  if (action === "speak") void speak(button.dataset.text, button);
  if (action === "show-notifications") showToast("暂无新通知。复习优先级会直接显示在复习中心。");
  if (action === "show-profile") navigate("home");
  if (action === "toggle-rails") {
    railsCollapsed = !railsCollapsed;
    try { localStorage.setItem("gre-rails-collapsed", railsCollapsed ? "1" : "0"); } catch {}
    applyRailsCollapsed();
    showToast(railsCollapsed ? "已进入专注模式" : "已显示左右边栏");
  }
  if (action === "scroll-section") {
    scrollToLearningSection(button.dataset.target, button);
  }
  if (action === "show-learning-panel") showLearningPanel(button.dataset.panel);
  if (action === "select-ielts-library-word") {
    ieltsLibrarySelectedNumber = Number(button.dataset.number);
    document.querySelectorAll(".vocab-table tbody tr").forEach((row) => row.classList.toggle("is-selected", Number(row.dataset.number) === ieltsLibrarySelectedNumber));
    if (contextRail) {
      contextRail.innerHTML = renderIeltsLibraryContext();
      scheduleVisibleSpeechPreloads(contextRail);
    }
  }
  if (action === "select-library-word") {
    librarySelectedNumber = Number(button.dataset.number);
    document.querySelectorAll(".vocab-table tbody tr").forEach((row) => row.classList.toggle("is-selected", Number(row.dataset.number) === librarySelectedNumber));
    renderContextRail(parseRoute());
    scheduleVisibleSpeechPreloads(contextRail);
  }
  if (action === "library-filter") { libraryStatusFilter = button.dataset.filter; render({ forceRail: true, scroll: false }); }
  if (action === "ielts-library-filter") { ieltsLibraryStatusFilter = button.dataset.filter; render({ forceRail: true, scroll: false }); }
  if (action === "clear-library-search") { libraryQuery = ""; render({ forceRail: true, scroll: false }); requestAnimationFrame(() => document.querySelector("#library-search")?.focus()); }
  if (action === "export-library") exportLibrary();
  if (action === "toggle-review-selection") { const number = Number(button.dataset.number); reviewSelection.has(number) ? reviewSelection.delete(number) : reviewSelection.add(number); render({ forceRail: true, scroll: false }); }
  if (action === "toggle-ielts-review-selection") { const number = Number(button.dataset.number); ieltsReviewSelection.has(number) ? ieltsReviewSelection.delete(number) : ieltsReviewSelection.add(number); render({ forceRail: true, scroll: false }); }
  if (action === "select-review-page") { practiceCandidates(reviewConfig, progress.selectedSet).forEach((lesson) => reviewSelection.add(lesson.number)); render({ forceRail: true, scroll: false }); }
  if (action === "select-ielts-review-page") { ieltsPracticeCandidates(ieltsReviewConfig).forEach((lesson) => ieltsReviewSelection.add(lesson.number)); render({ forceRail: true, scroll: false }); }
  if (action === "clear-review-selection") { reviewSelection.clear(); render({ forceRail: true, scroll: false }); }
  if (action === "clear-ielts-review-selection") { ieltsReviewSelection.clear(); render({ forceRail: true, scroll: false }); }
  if (action === "select-set") { progress.selectedSet = Number(button.dataset.set); progress.selectedChapter = chapterForSet(progress.selectedSet); saveProgress(); navigate(`learn/${getSet(progress.selectedSet).lessons[0].number}`); }
  if (action === "toggle-phrase") {
    const detail = document.getElementById(button.dataset.target);
    const expanded = detail.classList.toggle("is-visible");
    button.setAttribute("aria-expanded", String(expanded));
    button.lastElementChild.textContent = expanded ? "−" : "＋";
    if (expanded) preloadSpeechButtons(detail, { priority: true, limit: 4 });
  }
  if (action === "reveal-answer") { const answer = button.parentElement.querySelector(".answer-reveal"); const visible = answer.classList.toggle("is-visible"); button.textContent = visible ? "Hide answer · 隐藏答案" : "Show bilingual answer · 显示双语答案"; }
  if (action === "toggle-translation") { const translation = document.querySelector(".translation"); const visible = translation.classList.toggle("is-visible"); button.textContent = visible ? "隐藏中文翻译" : "显示中文翻译"; }
  if (action === "rate") { const number = Number(button.dataset.number); const rating = button.dataset.rating; scheduleWord(number, rating, "lesson"); saveProgress(); render({ forceRail: true, scroll: false }); showToast(`${getLessonByNumber(number).word} → ${BUCKET_META[rating.toLowerCase()].zh}`); }
  if (action === "rate-ielts") { const number = Number(button.dataset.number); const rating = button.dataset.rating; scheduleIeltsWord(number, rating, "lesson"); saveIeltsProgress(); render({ forceRail: true, scroll: false }); showToast(`${getIeltsLesson(number).word} → ${BUCKET_META[rating.toLowerCase()].zh}`); }
  if (action === "toggle-ielts-favorite") { const number = Number(button.dataset.number); const record = ensureIeltsRecord(number); record.favorite = !record.favorite; saveIeltsProgress(); render({ forceRail: true, scroll: false }); showToast(record.favorite ? "已加入收藏" : "已取消收藏"); }
  if (action === "reset-ielts-word" && window.confirm(`确定重置 ${getIeltsLesson(button.dataset.number).word} 的学习进度吗？`)) { const number = Number(button.dataset.number); const favorite = Boolean(getIeltsRecord(number)?.favorite); delete ieltsProgress.records[number]; if (favorite) ensureIeltsRecord(number).favorite = true; saveIeltsProgress(); render({ forceRail: true, scroll: false }); }
  if (action === "toggle-favorite") { const number = Number(button.dataset.number); const record = ensureRecord(number); record.favorite = !record.favorite; saveProgress(); render(); showToast(record.favorite ? "已加入收藏清单" : "已取消收藏"); }
  if (action === "reset-word" && window.confirm(`确定重置 ${getLessonByNumber(button.dataset.number).word} 的学习、复习和测试进度吗？收藏状态会保留。`)) resetWord(Number(button.dataset.number));
  if (action === "practice-scope") updatePracticeConfig(button.dataset.kind, "scope", button.dataset.value);
  if (action === "practice-filter") updatePracticeConfig(button.dataset.kind, "filter", button.dataset.value);
  if (action === "practice-count") updatePracticeConfig(button.dataset.kind, "count", button.dataset.value);
  if (action === "practice-mode") updatePracticeConfig(button.dataset.kind, "mode", button.dataset.value);
  if (action === "start-review") startReview();
  if (action === "answer-review") answerReview(Number(button.dataset.index));
  if (action === "next-review-question") nextReviewQuestion();
  if (action === "start-unit-review") startUnitReview(Number(button.dataset.set));
  if (action === "exit-review") { reviewSession = null; render(); }
  if (action === "restart-review") { reviewSession = null; startReview(); }
  if (action === "start-quiz") startQuiz(Number(button.dataset.set));
  if (action === "answer-question") answerQuestion(Number(button.dataset.index));
  if (action === "next-question") nextQuestion();
  if (action === "restart-quiz") startQuiz(Number(button.dataset.set));
  if (action === "exit-quiz") { quizSession = null; render({ forceRail: true }); }
  if (action === "start-ielts-test" || action === "start-ielts-review") startIeltsTest(button.dataset.scope || "all");
  if (action === "answer-ielts-question") answerIeltsQuestion(Number(button.dataset.index));
  if (action === "next-ielts-question") nextIeltsQuestion();
  if (action === "exit-ielts-review") { ieltsQuizSession = null; render({ forceRail: true, scroll: false }); }
  if (action === "reset-progress" && window.confirm(`确定重置 1—${lessons.length} 词的全部学习、复习和测试记录吗？`)) { progress = defaultProgress(); quizSession = null; reviewSession = null; saveProgress(); navigate("home"); showToast("全部进度已重置"); }
}

// Capture-phase delegation keeps controls reliable even when a nested panel,
// table row, or browser extension stops bubbling later in the event path.
document.addEventListener("pointerover", warmSpeechFromInteraction, { passive: true });
document.addEventListener("pointerdown", warmSpeechFromInteraction, { passive: true });
document.addEventListener("focusin", warmSpeechFromInteraction);
document.addEventListener("click", handleAppClick, { capture: true });

window.addEventListener("popstate", () => render());
window.addEventListener("beforeinstallprompt", (event) => { event.preventDefault(); installPrompt = event; installButton?.classList.remove("is-hidden"); });
installButton?.addEventListener("click", async () => { if (installPrompt) { await installPrompt.prompt(); installPrompt = null; installButton.classList.add("is-hidden"); } });
if ("serviceWorker" in navigator && location.protocol !== "file:") window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
render();
