// Shared content schema for the IELTS 538 data pack.
// This directory is data-only and is intentionally not registered in the Web App.

export const bilingualExample = (en, zh) => ({ en, zh });

export const collocation = (en, zh, exampleEn, exampleZh) => ({
  en,
  zh,
  example: bilingualExample(exampleEn, exampleZh),
});

export const sense = (label, titleZh, explanationZh, collocations) => ({
  label,
  titleZh,
  explanationZh,
  collocations,
});

export const ieltsExample = ({
  en,
  zh,
  skill,
  taskType,
  provenance = "authored_ielts_style",
  sourceTitle = null,
  sourceUrl = null,
  section = null,
  verbatim = false,
  noteZh,
}) => ({
  en,
  zh,
  skill,
  taskType,
  provenance,
  sourceTitle,
  sourceUrl,
  section,
  verbatim,
  noteZh,
});

export const contentEntry = (config) => config;
export const synonymGroup = (config) => config;
export const lookalikeItem = (config) => config;
export const lookalikePack = (appId, word, items) => ({ appId, word, items });

