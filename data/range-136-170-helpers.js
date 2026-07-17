import { comparison, contrastQuiz, example, phrase, recall, sense } from "./helpers.js";

const bilingualExamples = (items = []) => items.map(([en, zh]) => example(en, zh));

const buildSense = ([label, title, explanation, collocations, examples = []]) => sense(
  label,
  title,
  explanation,
  collocations.map(([en, zh, exampleEn, exampleZh]) => phrase(en, zh, exampleEn, exampleZh)),
  bilingualExamples(examples),
);

const buildComparison = ([word, ipa, role, meaningZh, contrast, examples]) => comparison(
  word,
  ipa,
  role,
  meaningZh,
  contrast,
  bilingualExamples(examples),
);

const buildContrastQuiz = (number, [prompt, promptZh, correct, distractors, explanation, explanationZh]) => {
  const answer = number % 4;
  const options = [...distractors.slice(0, 3)];
  options.splice(answer, 0, correct);
  return {
    ...contrastQuiz(prompt, options, answer, explanation),
    promptZh,
    explanationZh,
  };
};

export const memory = (soundZh, rootZh, englishHookZh, sceneZh, bridgeZh, trapZh, microEn, microZh) => ({
  soundZh,
  rootZh,
  englishHookZh,
  sceneZh,
  bridgeZh,
  trapZh,
  microEn,
  microZh,
  en: microEn,
  zh: microZh,
});

export function lesson(config) {
  return {
    number: config.number,
    word: config.word.trim(),
    ipa: config.ipa,
    pos: config.pos,
    register: config.register,
    rawNote: config.rawNote,
    coreEn: config.coreEn,
    coreZh: config.coreZh,
    imageZh: config.imageZh,
    senses: config.senses.map(buildSense),
    comparisons: config.comparisons.map(buildComparison),
    memory: config.memory,
    recall: recall(...config.recall),
    context: {
      prompt: config.context[0],
      promptZh: config.context[1],
      explanation: config.context[2],
      explanationZh: config.context[3],
    },
    contrastQuiz: buildContrastQuiz(config.number, config.quiz),
  };
}

export const set = (id, title, lessons, story) => ({
  id,
  range: `${lessons[0].number}—${lessons.at(-1).number}`,
  title,
  lessons,
  story,
});
