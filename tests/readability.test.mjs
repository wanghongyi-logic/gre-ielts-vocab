import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const css=fs.readFileSync(new URL('../gre-learning/botanical-margin.css',import.meta.url),'utf8');
test('media keeps cream background with no exterior pigment over nearby text',()=>{assert.match(css,/\.story-illustration \{background-color:var\(--journal-paper\);box-shadow:none;\}/);assert.doesNotMatch(css,/box-shadow:0 -12px 18px 8px/);});
test('reading text is not filtered or artificially shadowed to mask the issue',()=>{assert.doesNotMatch(css,/\.(?:word-meaning|english-meaning|scene-lead)\s*\{[^}]*(?:filter|text-shadow|opacity)/);});
test('progress contrast and botanical generated materials are retained',()=>{assert.match(css,/radial-gradient\(ellipse at 65% 50%/);assert.match(css,/botanical-sage-wash.webp/);assert.match(css,/book-paper-face.webp/);});
