export const escapeLearningText = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function renderLearningPanels(entry, { activePanel = 'memory', visual }  = {}) {
  const order = { memory: '01', usage: '02', 'context-examples': '03', comparison: '04' };
  const panel = (id, title, body) => `<section class="learning-panel gre-learning-card ${activePanel === id ? 'is-active' : ''}" id="${id}" data-learning-panel="${id}"><div class="gre-section-heading"><span aria-hidden="true">${order[id]}</span><h2>${title}</h2></div>${body}</section>`;
  return `<div class="gre-learning-revision">${panel('memory', '核心图像', `
    <div class="gre-core-image" id="core-image">${visual?`<img class="mnemonic-visual" src="${escapeLearningText(visual.src)}" alt="${escapeLearningText(visual.alt)}" width="360" height="200" decoding="async">${visual.caption?`<span class="visual-caption">${escapeLearningText(visual.caption)}</span>`:""}`:""}<p>${escapeLearningText(entry.coreImageZh)}</p></div>
    <h3>词汇助记</h3><div class="gre-mnemonics">${entry.mnemonics.map(item => `<article><div class="gre-method"><h4>${escapeLearningText(item.method)}</h4>${item.kind === 'invented_association' ? '<span>记忆联想</span>' : item.kind === 'etymology' ? '<span>词源</span>' : ''}</div><p>${escapeLearningText(item.textZh)}</p></article>`).join('')}</div>`)}
    ${panel('usage', '核心用法与词组', entry.usage.map(item => `<article class="gre-sense"><h3>${escapeLearningText(item.senseZh)}</h3>${item.explanationZh?`<p>${escapeLearningText(item.explanationZh)}</p>`:""}<dl>${item.collocations.map(collocation => `<div><dt lang="en">${escapeLearningText(collocation.phrase)}</dt><dd>${escapeLearningText(collocation.meaningZh)}${collocation.usageZh?`<small>${escapeLearningText(collocation.usageZh)}</small>`:""}</dd></div>`).join('')}</dl></article>`).join('') )}
    ${panel('context-examples', '语境例句', entry.examples.map(item => `<figure class="gre-example"><p lang="en">${escapeLearningText(item.textEn)}</p><p>${escapeLearningText(item.translationZh)}</p>${item.explanationZh?`<p class="gre-example-note">${escapeLearningText(item.explanationZh)}</p>`:""}</figure>`).join(''))}
    ${panel('comparison', 'GRE 等价词', entry.equivalents.map(item => `<article class="gre-equivalent"><h3 lang="en">${escapeLearningText(item.word)}</h3><p>${escapeLearningText(item.sharedSenseZh)}</p>${item.distinctionZh?`<p><strong>细微差别</strong> ${escapeLearningText(item.distinctionZh)}</p>`:""}<p><strong>替换边界</strong> ${escapeLearningText(item.substitutionLimitZh)}</p></article>`).join(''))}
  </div>`;
}
export function renderNotReady() {
  return '<section class="gre-not-ready" role="status"><span aria-hidden="true">○</span><h1>新版学习内容尚未就绪</h1><p>这里将呈现核心图像、词汇助记、用法、语境例句与 GRE 等价词。</p><a href="./index.html">返回学习页</a></section>';
}
