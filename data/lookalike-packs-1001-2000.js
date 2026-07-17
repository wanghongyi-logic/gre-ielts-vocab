import {lookalikePacks1001To1100} from "./lookalike-packs-1001-1100.js";
import {lookalikePacks1101To1200} from "./lookalike-packs-1101-1200.js";
import {lookalikePacks1201To1300} from "./lookalike-packs-1201-1300.js";
import {lookalikePacks1301To1400} from "./lookalike-packs-1301-1400.js";
import {lookalikePacks1401To1500} from "./lookalike-packs-1401-1500.js";
import {lookalikePacks1501To1600} from "./lookalike-packs-1501-1600.js";
import {lookalikePacks1601To1700} from "./lookalike-packs-1601-1700.js";
import {lookalikePacks1701To1800} from "./lookalike-packs-1701-1800.js";
import {lookalikePacks1801To1900} from "./lookalike-packs-1801-1900.js";
import {lookalikePacks1901To2000} from "./lookalike-packs-1901-2000.js";

const segments=[lookalikePacks1001To1100,lookalikePacks1101To1200,lookalikePacks1201To1300,lookalikePacks1301To1400,lookalikePacks1401To1500,lookalikePacks1501To1600,lookalikePacks1601To1700,lookalikePacks1701To1800,lookalikePacks1801To1900,lookalikePacks1901To2000];
export const lookalikePacks1001To2000=Object.assign({},...segments);
const packsByNumber=new Map(Object.values(lookalikePacks1001To2000).map(pack=>[pack.number,pack]));
export function getLookalikePack1001To2000(wordOrNumber){
  if(typeof wordOrNumber==="number"||/^\d+$/.test(String(wordOrNumber)))return packsByNumber.get(Number(wordOrNumber));
  return lookalikePacks1001To2000[String(wordOrNumber).trim().toLowerCase()];
}

export {lookalikePacks1001To1100,lookalikePacks1101To1200,lookalikePacks1201To1300,lookalikePacks1301To1400,lookalikePacks1401To1500,lookalikePacks1501To1600,lookalikePacks1601To1700,lookalikePacks1701To1800,lookalikePacks1801To1900,lookalikePacks1901To2000};
