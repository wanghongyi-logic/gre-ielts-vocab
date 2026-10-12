import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const css=fs.readFileSync(new URL('../gre-learning/botanical-margin.css',import.meta.url),'utf8');
test('all five bottom controls have the same generated watercolor wash',()=>{assert.match(css,/\.bookmark-list \.margin-control::after \{opacity:\.48;/);assert.match(css,/background:url\('\.\/botanical-sage-wash.webp'\)/);assert.match(css,/\.bookmark-list \.margin-control.is-current::after \{opacity:1;/);});
test('wash center matches the icon center inside a 44px target',()=>{assert.match(css,/inset:5px 0 5px 7px/);assert.equal((7+44)/2,25.5);assert.match(css,/width:44px;min-width:44px/);});
test('one continuous lower stem replaces all detached sprig crops',()=>{assert.match(css,/\.bookmark-list::before \{[^}]*top:0;bottom:0;width:17px/);assert.match(css,/50% 50%\/48px 100% no-repeat/);assert.doesNotMatch(css,/nth-child\([345]\)::before|top:-7px|background-position:50%/);});
test('art does not intercept controls and supports short landscape and forced colors',()=>{assert.match(css,/width:17px;pointer-events:none/);assert.match(css,/overflow-y:auto;overflow-x:hidden/);assert.match(css,/@media\(forced-colors:active\)[\s\S]*\.bookmark-list::before/);});
test('progress and count contrast remain unchanged',()=>{assert.match(css,/var\(--margin-saved-progress\)/);assert.match(css,/radial-gradient\(ellipse at 65% 50%/);assert.match(css,/safe-area-inset-bottom/);});
test('directory ink uses absolute offsets, never an icon-relative percentage, while its target stays fixed',()=>{
 assert.match(css,/#open-search \.margin-label \{\s*transform:translateY\(10px\)/);
 assert.match(css,/@media\(max-height:760px\)\{[^}]*#open-search \.margin-label \{transform:translateY\(5px\)/);
 assert.match(css,/@media\(max-height:640px\)\{[^}]*#open-search \.margin-label \{transform:translateY\(0\)/);
 assert.doesNotMatch(css,/translateY\([^;]*--margin-vine-height/);
 for(const viewport of [320,480,640,700,760,844,920]){const offset=viewport<=640?0:viewport<=760?5:10;assert.ok(21+21+offset<=64);}
 assert.match(css,/width:44px;min-width:44px/);
});

test('selection pigment spreads and recedes on the decorative wash only',()=>{
 const resting=css.match(/\.bookmarks\.botanical-margin \.margin-control::after \{([^}]+)\}/)[1],active=css.match(/\.bookmarks\.botanical-margin \.margin-control\.is-current::after \{([^}]+)\}/)[1];
 assert.match(resting,/position:absolute/);assert.match(resting,/transform:scale\(\.92,\.88\)/);assert.match(resting,/transition:opacity 300ms ease,transform 420ms cubic-bezier/);assert.match(resting,/pointer-events:none/);
 assert.match(active,/transform:scale\(1\)/);assert.match(active,/transition-duration:450ms,600ms/);assert.doesNotMatch(active,/padding|margin|width|height|top|left/);
 assert.doesNotMatch(css,/@keyframes/,'CSS transitions can reverse smoothly during rapid switches');
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{[^}]*transition:none;animation:none;\}[^}]*margin-control\.is-current::after \{transform:none;/);
});
