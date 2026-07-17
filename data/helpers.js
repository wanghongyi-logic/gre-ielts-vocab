export const example = (en, zh) => ({ en, zh });

export const phrase = (en, zh, exampleEn, exampleZh) => ({
  en,
  zh,
  example: example(exampleEn, exampleZh),
});

export const sense = (label, title, explanation, collocations, examples) => ({
  label,
  title,
  explanation,
  collocations,
  examples,
});

export const comparison = (word, ipa, role, meaningZh, contrast, examples) => ({
  word,
  ipa,
  role,
  meaningZh,
  contrast,
  examples,
});

export const recall = (promptEn, promptZh, answerEn, answerZh) => ({
  promptEn,
  promptZh,
  answerEn,
  answerZh,
});

export const contrastQuiz = (prompt, options, answer, explanation) => ({
  prompt,
  options,
  answer,
  explanation,
});
