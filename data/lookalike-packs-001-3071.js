import {lookalikePacks001To100} from "./lookalike-packs-001-100.js";
import {lookalikePacks101To200} from "./lookalike-packs-101-200.js";
import {lookalikePacks201To300} from "./lookalike-packs-201-300.js";
import {lookalikePacks301To500} from "./lookalike-packs-301-500.js";
import {lookalikePacks501To700} from "./lookalike-packs-501-700.js";
import {lookalikePacks701To1000} from "./lookalike-packs-701-1000.js";
import {lookalikePacks1001To3071} from "./lookalike-packs-1001-3071.js";
import {lessons001To3071} from "./sets-001-3071.js";
const segments=[lookalikePacks001To100,lookalikePacks101To200,lookalikePacks201To300,lookalikePacks301To500,lookalikePacks501To700,lookalikePacks701To1000,lookalikePacks1001To3071];
const sourceByNumber=new Map(segments.flatMap(segment=>Object.values(segment)).map(pack=>[pack.number,pack]));
const seenWords=new Set();
export const lookalikePacks001To3071=Object.fromEntries(lessons001To3071.map(lesson=>{const key=seenWords.has(lesson.word)?`${lesson.word}#${lesson.number}`:lesson.word;seenWords.add(lesson.word);return[key,sourceByNumber.get(lesson.number)];}));
const byNumber=new Map(Object.values(lookalikePacks001To3071).map(pack=>[pack.number,pack]));
const byWord=new Map(Object.values(lookalikePacks001To3071).map(pack=>[pack.word,pack]).reverse());
export function getLookalikePack001To3071(wordOrNumber){if(typeof wordOrNumber==="number"||/^\d+$/.test(String(wordOrNumber)))return byNumber.get(Number(wordOrNumber));return byWord.get(String(wordOrNumber).trim().toLowerCase());}
