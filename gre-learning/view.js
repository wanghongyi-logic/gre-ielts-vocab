import {renderLearningPanels, escapeLearningText as escape} from './render.js';
export function renderWordPage(current, visual) {
  return `<div class="reading-layout">
    <header class="word-hero" aria-labelledby="word-title">
      <h1 id="word-title" lang="en">${escape(current.word)}</h1>
      <div class="word-meta">
        <div class="pronunciation"><span>${escape(current.ipa)}</span><button type="button" class="pronounce-button" data-speak aria-label="朗读 ${escape(current.word)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m11 4-6 5H2v6h3l6 5V4ZM15 8c2 2 2 6 0 8M18 5c4 4 4 10 0 14"/></svg></button></div>
        <p class="part-of-speech">${escape(current.pos)}</p>
      </div>

    </header>
    <div class="reading-body">${renderLearningPanels(current,{visual})}</div>
  </div>`;
}
