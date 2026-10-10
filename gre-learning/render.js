import {renderMeaningMotion} from './motion.js';
import {sceneGlosses} from './scene-glosses.js';
export const escapeLearningText = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function renderLearningPanels(entry, { activePanel = 'memory', visual }  = {}) {
  const order = { memory: '01', usage: '02', 'context-examples': '03', comparison: '04' };
  const panel = (id, title, body) => `<section class="learning-panel gre-learning-card ${activePanel === id ? 'is-active' : ''}" id="${id}" data-learning-panel="${id}"><div class="gre-section-heading"><span aria-hidden="true">${order[id]}</span><h2>${title}</h2></div>${body}</section>`;
  const mnemonic = (item) => `<div class="gre-method"><h4>${escapeLearningText(item.method)}</h4>${item.kind === 'invented_association' ? '<span>记忆联想</span>' : item.kind === 'etymology' ? '<span>词源</span>' : ''}</div><p>${escapeLearningText(item.textZh)}</p>`;
  return `<div class="gre-learning-revision"><section class="learning-panel gre-learning-card is-active" id="memory" data-learning-panel="memory" aria-label="图景、释义与助记">
    <div class="gre-core-image" id="core-image">${renderMeaningMotion(entry,visual)||(visual?`<img class="mnemonic-visual" src="${escapeLearningText(visual.src)}" alt="${escapeLearningText(visual.alt)}" width="360" height="200" decoding="async">`:"")}
      <div class="word-definition"><p class="word-meaning">${escapeLearningText(sceneGlosses[entry.number] || entry.coreMeaningZh)}</p><p class="english-meaning" lang="en">${escapeLearningText(entry.coreEn)}</p></div>
      <p class="scene-bridge">${escapeLearningText(entry.coreImageZh)}</p>
    </div>
    <div class="gre-mnemonics" aria-label="词汇助记">${entry.mnemonics.map((item,i) => i===0?`<article class="primary-mnemonic">${mnemonic(item)}</article>`:`<details class="extra-mnemonic"><summary>${escapeLearningText(item.method)}</summary><div>${mnemonic(item)}</div></details>`).join('')}</div>
    </section>
    <nav class="section-nav section-jumps" aria-label="跳转到学习内容">${[['memory','记忆'],['usage','用法'],['context-examples','例句'],['comparison','等价词']].map(([id,label],i)=>`<a href="#${id}" data-section="${id}" >${label}</a>`).join('')}</nav>
    ${panel('usage', '核心用法与词组', `<p class="full-definition">${escapeLearningText(entry.coreMeaningZh)}</p>` + entry.usage.map(item => `<article class="gre-sense"><h3>${escapeLearningText(item.senseZh)}</h3>${item.explanationZh?`<p>${escapeLearningText(item.explanationZh)}</p>`:""}<dl>${item.collocations.map(collocation => `<div><dt lang="en">${escapeLearningText(collocation.phrase)}</dt><dd>${escapeLearningText(collocation.meaningZh)}${collocation.usageZh?`<small>${escapeLearningText(collocation.usageZh)}</small>`:""}</dd></div>`).join('')}</dl></article>`).join('') )}
    ${panel('context-examples', '语境例句', entry.examples.map(item => `<figure class="gre-example"><p lang="en">${escapeLearningText(item.textEn)}</p><p>${escapeLearningText(item.translationZh)}</p>${item.explanationZh?`<p class="gre-example-note">${escapeLearningText(item.explanationZh)}</p>`:""}</figure>`).join(''))}
    ${panel('comparison', 'GRE 等价词', entry.equivalents.map(item => `<article class="gre-equivalent"><h3 lang="en">${escapeLearningText(item.word)}</h3><p>${escapeLearningText(item.comparisonZh)}</p></article>`).join(''))}
  </div>`;
}
export function renderNotReady() {
  return '<section class="gre-not-ready" role="status"><span aria-hidden="true">○</span><h1>暂无可学习的单词</h1><p>内容正在准备中，请稍后再来。</p><a href="./index.html">返回学习页</a></section>';
}
