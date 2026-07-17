export const QUESTION_MODES = Object.freeze([
  Object.freeze({ id: "en-zh", label: "英 → 中", detail: "看到英文选择核心中文义" }),
  Object.freeze({ id: "zh-en", label: "中 → 英", detail: "根据中文核心义选择英文主词" }),
  Object.freeze({ id: "context", label: "语境填空", detail: "在完整英语语境中辨认主词" }),
  Object.freeze({ id: "contrast", label: "近义辨析", detail: "区分注解词、近义词与易混词" }),
  Object.freeze({ id: "spelling", label: "拼写 / 主动回忆", detail: "不看选项，主动拼出英文主词" }),
  Object.freeze({ id: "collocation", label: "词组搭配", detail: "匹配主词与核心用法词组" }),
]);

const MODE_IDS = new Set(QUESTION_MODES.map((mode) => mode.id));

function seedToUint32(seed) {
  let hash = 2166136261;
  for (const character of String(seed)) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createSeededRandom(seed) {
  let state = seedToUint32(seed) || 0x6d2b79f5;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(items, random = Math.random) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function masteryScore(record = null) {
  if (!record) return 0.5;
  const correct = Math.max(0, finiteNumber(record.correctCount ?? record.testCorrect));
  const explicitWrong = record.wrongCount;
  const wrong = Math.max(0, finiteNumber(explicitWrong ?? (finiteNumber(record.testTotal) - finiteNumber(record.testCorrect))));
  const attempts = correct + wrong;
  if (attempts > 0) return (correct + 1) / (attempts + 2);
  if (record.bucket === "again") return 0.12;
  if (record.bucket === "hard") return 0.35;
  if (record.bucket === "good") return 0.7;
  if (record.bucket === "easy") return 0.9;
  return 0.5;
}

export function practiceWeight(record = null, { recentRank = null, recentWindow = 36 } = {}) {
  const mastery = masteryScore(record);
  let weight = 1 + (1 - mastery) * 3.5;

  if (!record) weight += 0.35;
  if (record?.needsCorrection || record?.lastTestWrong) weight += 5.5;
  if (record?.bucket === "again" || record?.lastRating === "Again") weight += 6;
  else if (record?.bucket === "hard" || record?.lastRating === "Hard") weight += 3.25;
  else if (record?.bucket === "good") weight += 0.65;
  else if (record?.bucket === "easy") weight *= 0.72;

  weight += Math.min(8, Math.max(0, finiteNumber(record?.lapses))) * 0.45;
  weight += Math.min(12, Math.max(0, finiteNumber(record?.wrongCount))) * 0.18;

  if (recentRank !== null && recentRank >= 0) {
    const window = Math.max(2, finiteNumber(recentWindow));
    const age = Math.min(recentRank, window - 1) / (window - 1);
    const urgent = record?.needsCorrection || record?.lastTestWrong || record?.bucket === "again" || record?.lastRating === "Again";
    const difficult = record?.bucket === "hard" || record?.lastRating === "Hard";
    const floor = urgent ? 0.34 : difficult ? 0.24 : 0.14;
    weight *= floor + age * (0.64 - floor);
  }

  return Math.max(0.05, weight);
}

export function weightedSampleWithoutReplacement(items, count, getWeight, random = Math.random) {
  const available = [...items];
  const selected = [];
  const target = Math.min(Math.max(0, Math.floor(finiteNumber(count))), available.length);

  while (selected.length < target && available.length) {
    const weights = available.map((item) => Math.max(0, finiteNumber(getWeight(item))));
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let chosenIndex = 0;

    if (total > 0) {
      let ticket = random() * total;
      chosenIndex = weights.length - 1;
      for (let index = 0; index < weights.length; index += 1) {
        ticket -= weights[index];
        if (ticket < 0) {
          chosenIndex = index;
          break;
        }
      }
    } else {
      chosenIndex = Math.floor(random() * available.length);
    }

    selected.push(available.splice(chosenIndex, 1)[0]);
  }

  return selected;
}

function recordFor(records, number) {
  if (records instanceof Map) return records.get(Number(number)) || records.get(String(number)) || null;
  return records?.[number] || records?.[String(number)] || null;
}

function recentRankMap(recentWordNumbers) {
  const ranks = new Map();
  recentWordNumbers.forEach((number, index) => {
    const normalized = Number(number);
    if (Number.isFinite(normalized) && !ranks.has(normalized)) ranks.set(normalized, index);
  });
  return ranks;
}

export function planModes(modes, count, random = Math.random) {
  const allowed = [...new Set((modes || []).filter((mode) => MODE_IDS.has(mode)))];
  const selectedModes = allowed.length ? allowed : QUESTION_MODES.map((mode) => mode.id);
  const plan = [];
  while (plan.length < count) plan.push(...shuffle(selectedModes, random));
  return plan.slice(0, count);
}

function uniqueValues(values, answer) {
  const seen = new Set([String(answer)]);
  return values.filter((value) => {
    if (value === null || value === undefined || value === "") return false;
    const key = String(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function choiceWithAnswer(answer, distractors, random) {
  const cleanDistractors = uniqueValues(distractors, answer).slice(0, 3);
  const entries = [{ value: answer, correct: true }, ...cleanDistractors.map((value) => ({ value, correct: false }))];
  const mixed = shuffle(entries, random);
  return {
    kind: "choice",
    options: mixed.map((entry) => entry.value),
    answer: mixed.findIndex((entry) => entry.correct),
  };
}

function valuesFromOtherLessons(lesson, allLessons, getValue, random) {
  return shuffle(allLessons.filter((item) => item.number !== lesson.number), random).map(getValue);
}

function firstPhrase(lesson) {
  const phrase = lesson.senses?.flatMap((sense) => sense.collocations || [])[0];
  return phrase || {
    en: lesson.word,
    zh: lesson.coreZh,
    example: { en: lesson.coreEn, zh: lesson.coreZh },
  };
}

function shuffledSourceChoice(source, lesson, allLessons, random) {
  const sourceOptions = Array.isArray(source.options) ? source.options : [];
  const originalAnswer = sourceOptions[source.answer];
  if (!originalAnswer) return null;

  const sourceDistractors = sourceOptions.filter((_, index) => index !== source.answer);
  const fallbackDistractors = valuesFromOtherLessons(
    lesson,
    allLessons,
    (item) => item.comparisons?.[0]?.word || item.word,
    random,
  );
  return choiceWithAnswer(originalAnswer, [...sourceDistractors, ...fallbackDistractors], random);
}

export function buildPracticeQuestion(lesson, requestedMode, allLessons, random = Math.random) {
  const mode = MODE_IDS.has(requestedMode) ? requestedMode : "en-zh";
  const base = {
    id: `${mode}-${lesson.number}`,
    mode,
    wordNumber: lesson.number,
  };

  if (mode === "en-zh") {
    const choice = choiceWithAnswer(
      lesson.coreZh,
      valuesFromOtherLessons(lesson, allLessons, (item) => item.coreZh, random),
      random,
    );
    return {
      ...base,
      ...choice,
      type: "English → Chinese",
      typeZh: "英 → 中",
      prompt: lesson.word,
      promptZh: "选择最准确的核心中文义。",
      explanation: lesson.coreEn,
      explanationZh: lesson.coreZh,
    };
  }

  if (mode === "zh-en") {
    const choice = choiceWithAnswer(
      lesson.word,
      valuesFromOtherLessons(lesson, allLessons, (item) => item.word, random),
      random,
    );
    return {
      ...base,
      ...choice,
      type: "Chinese → English",
      typeZh: "中 → 英",
      prompt: lesson.coreZh,
      promptZh: "根据中文核心义选择英文主词。",
      explanation: `${lesson.word}: ${lesson.coreEn}`,
      explanationZh: lesson.coreZh,
    };
  }

  if (mode === "context") {
    const source = lesson.context || {};
    const choice = choiceWithAnswer(
      lesson.word,
      valuesFromOtherLessons(lesson, allLessons, (item) => item.word, random),
      random,
    );
    return {
      ...base,
      ...choice,
      type: "Context headword completion",
      typeZh: "语境填空",
      prompt: `Choose the headword; change its form if the sentence requires it: ${source.prompt || lesson.coreEn}`,
      promptZh: `${source.promptZh || `选择能完成句子的主词。核心义：${lesson.coreZh}`}（选项为主词原形，放入句中时可按语法变形。）`,
      explanation: source.explanation || lesson.coreEn,
      explanationZh: source.explanationZh || `${lesson.word}：${lesson.coreZh}`,
    };
  }

  if (mode === "contrast") {
    const source = lesson.contrastQuiz || {};
    const choice = shuffledSourceChoice(source, lesson, allLessons, random);
    if (choice) {
      return {
        ...base,
        ...choice,
        type: "Synonym contrast",
        typeZh: "近义词 / 注解词辨析",
        prompt: source.prompt,
        promptZh: source.promptZh || `辨析 ${lesson.word} 及其近义词或易混词，选择最准确的答案。`,
        explanation: source.explanation || lesson.coreEn,
        explanationZh: source.explanationZh || `${lesson.word} 的核心辨析：${lesson.coreZh}`,
      };
    }
    const comparison = lesson.comparisons?.[0];
    const fallbackChoice = choiceWithAnswer(
      comparison?.word || lesson.word,
      valuesFromOtherLessons(lesson, allLessons, (item) => item.comparisons?.[0]?.word || item.word, random),
      random,
    );
    return {
      ...base,
      ...fallbackChoice,
      type: "Synonym contrast",
      typeZh: "近义词 / 注解词辨析",
      prompt: `Which comparison term is associated with ${lesson.word}?`,
      promptZh: `哪一个是 ${lesson.word} 页中的注解词、近义词或易混词？`,
      explanation: lesson.coreEn,
      explanationZh: comparison?.contrast || comparison?.meaningZh || `${lesson.word}：${lesson.coreZh}`,
    };
  }

  if (mode === "spelling") {
    return {
      ...base,
      kind: "text",
      type: "Spelling & active recall",
      typeZh: "拼写 / 主动回忆",
      prompt: `Type the headword for: ${lesson.coreEn}`,
      promptZh: `根据核心中文义拼写英文主词：${lesson.coreZh}`,
      answerText: lesson.word,
      acceptedAnswers: [...new Set([lesson.word, ...(lesson.acceptedAnswers || [])])],
      explanation: `${lesson.word}: ${lesson.coreEn}${lesson.recall?.answerEn ? ` ${lesson.recall.answerEn}` : ""}`,
      explanationZh: `${lesson.coreZh}${lesson.recall?.answerZh ? `。${lesson.recall.answerZh}` : ""}`,
    };
  }

  const phrase = firstPhrase(lesson);
  const choice = choiceWithAnswer(
    lesson.word,
    valuesFromOtherLessons(lesson, allLessons, (item) => item.word, random),
    random,
  );
  return {
    ...base,
    ...choice,
    mode: "collocation",
    id: `collocation-${lesson.number}`,
    type: "Core collocation",
    typeZh: "词组搭配",
    prompt: `Which headword forms the core phrase translated as “${phrase.zh}”?`,
    promptZh: `哪一个英文主词可以组成核心词组“${phrase.zh}”？`,
    explanation: `${lesson.word} commonly appears in “${phrase.en}.”${phrase.example?.en ? ` ${phrase.example.en}` : ""}`,
    explanationZh: `${phrase.en}：${phrase.zh}${phrase.example?.zh ? `。${phrase.example.zh}` : ""}`,
  };
}

export function buildPracticeSession({
  candidates,
  allLessons = candidates,
  records = {},
  count = candidates.length,
  modes = QUESTION_MODES.map((mode) => mode.id),
  recentWordNumbers = [],
  random = Math.random,
}) {
  const seenNumbers = new Set();
  const uniqueCandidates = candidates.filter((lesson) => {
    const number = Number(lesson.number);
    if (!Number.isFinite(number) || seenNumbers.has(number)) return false;
    seenNumbers.add(number);
    return true;
  });
  const recentRanks = recentRankMap(recentWordNumbers);
  const recentWindow = Math.max(12, Math.min(60, recentWordNumbers.length || 36));
  const selectedLessons = weightedSampleWithoutReplacement(
    uniqueCandidates,
    count,
    (lesson) => practiceWeight(recordFor(records, lesson.number), {
      recentRank: recentRanks.has(Number(lesson.number)) ? recentRanks.get(Number(lesson.number)) : null,
      recentWindow,
    }),
    random,
  );
  const modePlan = planModes(modes, selectedLessons.length, random);
  return selectedLessons.map((lesson, index) => buildPracticeQuestion(lesson, modePlan[index], allLessons, random));
}

export function normalizeTypedAnswer(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/[‐‑‒–—]/g, "-")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ");
}

export function isQuestionCorrect(question, response) {
  if (question.kind === "text") {
    const normalized = normalizeTypedAnswer(response);
    return (question.acceptedAnswers || [question.answerText]).some((answer) => normalizeTypedAnswer(answer) === normalized);
  }
  return Number(response) === Number(question.answer);
}
