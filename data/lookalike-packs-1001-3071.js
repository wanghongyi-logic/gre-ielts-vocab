import {lookalikePacks1001To2000,lookalikePacks1001To1100,lookalikePacks1101To1200,lookalikePacks1201To1300,lookalikePacks1301To1400,lookalikePacks1401To1500,lookalikePacks1501To1600,lookalikePacks1601To1700,lookalikePacks1701To1800,lookalikePacks1801To1900,lookalikePacks1901To2000} from "./lookalike-packs-1001-2000.js";
import {lookalikePacks2001To3071} from "./lookalike-packs-2001-3071.js";
import {lessons1001To3071} from "./sets-1001-3071.js";
const sourceSegments=[lookalikePacks1001To1100,lookalikePacks1101To1200,lookalikePacks1201To1300,lookalikePacks1301To1400,lookalikePacks1401To1500,lookalikePacks1501To1600,lookalikePacks1601To1700,lookalikePacks1701To1800,lookalikePacks1801To1900,lookalikePacks1901To2000,lookalikePacks2001To3071];
const sourceByNumber=new Map(sourceSegments.flatMap(segment=>Object.values(segment)).map(pack=>[pack.number,pack]));
const seenWords=new Set();
export const lookalikePacks1001To3071=Object.fromEntries(lessons1001To3071.map(lesson=>{const key=seenWords.has(lesson.word)?`${lesson.word}#${lesson.number}`:lesson.word;seenWords.add(lesson.word);return[key,sourceByNumber.get(lesson.number)];}));
const byNumber=new Map(Object.values(lookalikePacks1001To3071).map(pack=>[pack.number,pack]));
const byWord=new Map(Object.values(lookalikePacks1001To3071).map(pack=>[pack.word,pack]).reverse());
export function getLookalikePack1001To3071(wordOrNumber){if(typeof wordOrNumber==="number"||/^\d+$/.test(String(wordOrNumber)))return byNumber.get(Number(wordOrNumber));return byWord.get(String(wordOrNumber).trim().toLowerCase());}
export {lookalikePacks1001To2000,lookalikePacks2001To3071};
