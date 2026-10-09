// Three meaning-specific, opt-in demonstrations. Other words keep their static illustration.
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const motionExamples = Object.freeze({
  4:{word:'abate',before:'强度为 9',after:'强度降至 4，仍大于 0',summary:'强度从 9 降到 4：减弱了，但并未归零。'},
  6:{word:'abdicate',before:'人在王位上，戴着王冠',after:'人离开王位，王冠留在宝座',summary:'人交出王冠并离开王位。这一场景演示“退位”的含义。'},
  18:{word:'abridge',before:'完整作品中包含主线和旁支',after:'删去旁支，三处主线节点仍保留',summary:'删去作品的旁支内容，保留三处主线节点，形成较短的删节本。'}
});
const stroke='fill="none" stroke="#173d36" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"';
function artwork(number) {
  if(number===4)return `<path d="M84 144A96 96 0 0 1 276 144" fill="none" stroke="#dce5d6" stroke-width="16" stroke-linecap="round"/><path d="M257.67 87.57A96 96 0 0 1 276 144" fill="none" stroke="#ae6750" stroke-width="16" stroke-linecap="round"/><path d="M136.41 58.46A96 96 0 0 1 150.33 52.70" fill="none" stroke="#c7954b" stroke-width="16"/>
    <path class="motion-origin-needle" d="M180 144L264 117" fill="none" stroke="#8b9a8b" stroke-width="3" stroke-dasharray="4 5"/>
    <g class="motion-needle"><path d="M180 144L264 117" fill="none" stroke="#173d36" stroke-width="5" stroke-linecap="round"/></g><circle cx="180" cy="144" r="8" fill="#173d36"/>
    <text x="72" y="172">0</text><text x="288" y="172">10</text><text x="300" y="117" class="motion-before-label" fill="#96513e">9</text><text x="145" y="36" class="motion-after-label">4</text><text x="180" y="184" class="motion-before-label motion-state-label">强度 9</text><text x="180" y="184" class="motion-after-label motion-state-label">强度 4 · 没有归零</text>`;
  if(number===6)return `<rect x="70" y="41" width="70" height="99" rx="13" fill="#dce5d6" stroke="#173d36" stroke-width="2"/><path d="M65 102H145V121H65ZM74 121V150M137 121V150" ${stroke}/><path d="M43 150H170V161H221V175H301" fill="none" stroke="#9aaa96" stroke-width="3" stroke-linecap="round"/>
    <g class="motion-person"><circle cx="105" cy="80" r="10" fill="#fffefa" stroke="#173d36" stroke-width="2.5"/><path class="motion-before-label" d="M105 91V102H123V150H133M105 102L113 110V150H123M105 96L86 102M105 96L126 102" ${stroke}/><path class="motion-after-label" d="M105 91V119M105 99L87 111M105 99L123 109M105 119L93 140M105 119L118 140" ${stroke}/></g>
    <g class="motion-crown"><path d="M88 65L84 47L95 55L105 42L115 55L126 47L122 65Z" fill="#c7954b" stroke="#173d36" stroke-width="2" stroke-linejoin="round"/></g>
    <text x="235" y="62" class="motion-before-label motion-state-label">承担王位</text><text x="235" y="62" class="motion-after-label motion-state-label">交出王位</text>`;
  return `<g class="motion-book-cover"><rect x="96" y="43" width="170" height="120" rx="7" fill="#dce5d6" stroke="#173d36" stroke-width="2"/><rect x="90" y="37" width="170" height="120" rx="7" fill="#fffefa" stroke="#173d36" stroke-width="2"/><path d="M101 39V155" stroke="#c7954b" stroke-width="4"/></g>
    <g class="motion-book-extras" fill="none" stroke="#a3afa0" stroke-width="3" stroke-linecap="round"><path d="M124 78H226M124 88H210M124 110H222M124 120H205M124 142H213"/></g>
    <path class="motion-book-thread" d="M119 65V130" stroke="#c7954b" stroke-width="2.5"/>
    <g class="motion-book-main motion-book-first"><circle cx="119" cy="65" r="4.5" fill="#c7954b"/><path d="M133 65H228" stroke="#173d36" stroke-width="4" stroke-linecap="round"/></g>
    <g class="motion-book-main"><circle cx="119" cy="98" r="4.5" fill="#c7954b"/><path d="M133 98H228" stroke="#173d36" stroke-width="4" stroke-linecap="round"/></g>
    <g class="motion-book-main motion-book-last"><circle cx="119" cy="130" r="4.5" fill="#c7954b"/><path d="M133 130H228" stroke="#173d36" stroke-width="4" stroke-linecap="round"/></g>
    <text x="180" y="186" class="motion-before-label motion-state-label">完整作品</text><text x="180" y="186" class="motion-after-label motion-state-label">删节本 · 主线仍在</text>`;
}
function scene(number,visual,suffix,phase,live=false) {
  const example=motionExamples[number],id=`meaning-${number}-${suffix}`;
  return `<svg class="meaning-motion-scene" ${live?'data-motion-stage=""':''} data-phase="${phase}" viewBox="0 0 360 200" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${example.word} · ${live?'词义变化':phase==='before'?'变化前':'变化后'}</title><desc id="${id}-desc">${escape(visual.alt)} ${escape(live?example.summary:example[phase])}</desc>${artwork(number)}</svg>`;
}
export function renderMeaningMotion(entry,visual) {
  const example=motionExamples[entry.number];
  if(!visual||!example||example.word!==entry.word)return '';
  return `<div class="meaning-motion" data-meaning-motion="${entry.number}" data-no-swipe>
    <div class="motion-live">${scene(entry.number,visual,'live','before',true)}</div>
    <div class="motion-comparison"><figure><figcaption>变化前</figcaption>${scene(entry.number,visual,'before','before')}</figure><figure><figcaption>变化后</figcaption>${scene(entry.number,visual,'after','after')}</figure></div>
    <div class="motion-controls"><button type="button" data-motion-play aria-label="演示 ${example.word} 的词义变化"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 10 7-10 7V5Z"/></svg><span>演示变化</span></button><button type="button" data-motion-reset disabled>重置</button></div>
    <span class="sr-only" data-motion-status role="status" aria-live="polite">${escape(example.before)}</span>
  </div>`;
}
export function installMeaningMotion(surface,{window:win=window}={}) {
  let timer=null,frame=null,active=null,generation=0;
  const clear=()=>{generation++;win.clearTimeout(timer);timer=null;win.cancelAnimationFrame(frame);frame=null;};
  function reset(root=active) {
    clear();if(!root)return;
    root.classList.remove('is-demonstrating');
    root.querySelector('[data-motion-stage]').dataset.phase='before';
    root.querySelector('[data-motion-play] span').textContent='演示变化';
    root.querySelector('[data-motion-reset]').disabled=true;
    root.querySelector('[data-motion-status]').textContent=motionExamples[Number(root.dataset.meaningMotion)].before;
    active=null;
  }
  function play(root) {
    reset(root);active=root;
    const version=generation,example=motionExamples[Number(root.dataset.meaningMotion)],stage=root.querySelector('[data-motion-stage]');
    root.querySelector('[data-motion-reset]').disabled=false;root.querySelector('[data-motion-play] span').textContent='重新演示';
    const finish=()=>{if(version!==generation)return;stage.dataset.phase='after';root.querySelector('[data-motion-status]').textContent=example.summary;};
    if(win.matchMedia?.('(prefers-reduced-motion: reduce)').matches){finish();return;}
    // Replaying starts from a stable first frame rather than reversing midway.
    frame=win.requestAnimationFrame(()=>{frame=win.requestAnimationFrame(()=>{
      if(version!==generation)return;
      root.classList.add('is-demonstrating');stage.dataset.phase='after';timer=win.setTimeout(finish,1000);
    });});
  }
  const click=event=>{
    const button=event.target.closest?.('[data-motion-play],[data-motion-reset]');if(!button)return;
    const root=button.closest('[data-meaning-motion]');if(!root||!motionExamples[Number(root.dataset.meaningMotion)])return;
    if(button.hasAttribute('data-motion-play'))play(root);else reset(root);
  };
  const stop=()=>reset();
  surface.addEventListener('click',click);win.addEventListener('pagehide',stop);
  return {cancel:stop,destroy(){stop();surface.removeEventListener('click',click);win.removeEventListener('pagehide',stop);}};
}
