import {
  sets001To3070,
  lessons001To3071 as sourceLessons,
  lesson3071,
  tail3071,
} from "./data/sets-001-3071.js";
import { memoryPacks } from "./data/memory-packs.js";

// 614 real five-word sets cover 1–3070. Word 3071 remains an independent
// tail lesson and is deliberately not inserted into a fake five-word set.
export const sets = sets001To3070;
export const lessons = sourceLessons.map((lesson) => ({
  ...lesson,
  setId: lesson.number <= 3070 ? Math.ceil(lesson.number / 5) : null,
  memory: { ...lesson.memory, ...(memoryPacks[lesson.word] || {}) },
}));
export { lesson3071, tail3071 };

const lessonByNumber = new Map(lessons.map((lesson) => [lesson.number, lesson]));
const setById = new Map(sets.map((set) => [set.id, set]));

export function getSet(setId) {
  return setById.get(Number(setId)) || sets[0];
}

export function getLessonByNumber(number) {
  return lessonByNumber.get(Number(number));
}

export function getSetForLesson(number) {
  const value = Number(number);
  if (value === 3071) return null;
  return setById.get(Math.ceil(value / 5)) || null;
}

function contextOptions(set, lesson) {
  const distractors = set.lessons.filter((item) => item.number !== lesson.number).map((item) => item.word);
  const answerIndex = (lesson.number - 1) % 4;
  const options = distractors.slice(0, 3);
  options.splice(answerIndex, 0, lesson.word);
  return { options, answerIndex };
}

export function createSetQuiz(setId) {
  const set = getSet(setId);
  return set.lessons.flatMap((lesson) => {
    const { options, answerIndex } = contextOptions(set, lesson);
    return [
      {
        id: `context-${lesson.number}`,
        type: "Main word · Context",
        prompt: lesson.context.prompt,
        promptZh: lesson.context.promptZh || "请选择最符合英语语境的本组主词。",
        options,
        answer: answerIndex,
        explanation: lesson.context.explanation,
        explanationZh: lesson.context.explanationZh || `${lesson.word}：${lesson.coreZh}`,
        wordNumber: lesson.number,
      },
      {
        id: `contrast-${lesson.number}`,
        type: "Annotation & synonym contrast",
        ...lesson.contrastQuiz,
        promptZh: lesson.contrastQuiz.promptZh || "请选择最准确的注解词、近义词或易混词。",
        explanationZh: lesson.contrastQuiz.explanationZh || `${lesson.word} 的核心辨析：${lesson.coreZh}`,
        wordNumber: lesson.number,
      },
    ];
  });
}

export function markedStory(setId) {
  const set = getSet(setId);
  let html = set.story.plain;
  for (const form of set.story.targetForms) {
    const escaped = form.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    html = html.replace(new RegExp(`(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`, "iu"), (match) => `<mark>${match}</mark>`);
  }
  return html;
}
