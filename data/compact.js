import { comparison, contrastQuiz, example, phrase, recall, sense } from "./helpers.js";

const asExample = ([en, zh]) => example(en, zh);

export function vocab(number, word, ipa, pos, rawNote, coreEn, coreZh, imageZh, phrases, comparisons, memory, recallItems, contextItems, quizDistractors) {
  const first = comparisons[0];
  return {
    number, word, ipa, pos, rawNote, coreEn, coreZh, imageZh, phrases, comparisons, memory,
    recall: recallItems,
    context: contextItems,
    quizDistractors,
    senseExplanation: `先掌握 ${word} 最典型的搭配对象，再通过例句区分它与邻近词。`,
    contrastPrompt: `Which expression is most directly connected with ${word} in the source annotation?`,
    contrastPromptZh: `原表注解中，哪一项与 ${word} 的核心关系最直接？`,
    contrastExplanation: first[3],
    contrastExplanationZh: `${first[0]}：${first[1]}。${first[3]}`,
  };
}

export function compactLesson(config) {
  const phrases = config.phrases.map(([en, zh, exampleEn, exampleZh]) => phrase(en, zh, exampleEn, exampleZh));
  const comparisons = config.comparisons.map(([word, meaningZh, role, contrast, exampleEn, exampleZh, ipa = ""]) =>
    comparison(word, ipa, role, meaningZh, contrast, [example(exampleEn, exampleZh)]),
  );
  const firstComparison = comparisons[0];
  const contrastOptions = [firstComparison.word, ...config.quizDistractors].slice(0, 4);
  const answer = (config.number + 1) % 4;
  const answerWord = contrastOptions.shift();
  contrastOptions.splice(answer, 0, answerWord);

  return {
    number: config.number,
    word: config.word.trim(),
    ipa: config.ipa,
    pos: config.pos,
    register: config.register || "GRE 高频 · 正式书面语",
    rawNote: config.rawNote,
    coreEn: config.coreEn,
    coreZh: config.coreZh,
    imageZh: config.imageZh,
    senses: [
      sense(config.senseLabel || "CORE USE", config.senseTitle || "核心用法", config.senseExplanation, phrases, (config.examples || []).map(asExample)),
    ],
    comparisons,
    memory: {
      en: config.memory.microEn,
      zh: config.memory.sceneZh,
      ...config.memory,
    },
    recall: recall(config.recall[0], config.recall[1], config.recall[2], config.recall[3]),
    context: {
      prompt: config.context[0],
      promptZh: config.context[1],
      explanation: config.context[2],
      explanationZh: config.context[3],
    },
    contrastQuiz: {
      ...contrastQuiz(config.contrastPrompt, contrastOptions, answer, config.contrastExplanation),
      promptZh: config.contrastPromptZh,
      explanationZh: config.contrastExplanationZh,
    },
  };
}

export function compactSet(id, title, configs, story) {
  return {
    id,
    range: `${configs[0].number}—${configs.at(-1).number}`,
    title,
    lessons: configs.map(compactLesson),
    story,
  };
}
