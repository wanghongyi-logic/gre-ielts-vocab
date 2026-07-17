import * as sets141To150 from "./sets-141-150.js";
import * as sets151To160 from "./sets-151-160.js";
import * as sets161To170 from "./sets-161-170.js";
import * as sets171To180 from "./sets-171-180.js";
import * as sets181To190 from "./sets-181-190.js";
import * as sets191To200 from "./sets-191-200.js";

const modules = [
  sets141To150,
  sets151To160,
  sets161To170,
  sets171To180,
  sets181To190,
  sets191To200,
];

export const sets701To1000 = modules
  .flatMap((module) => Object.entries(module))
  .filter(([name]) => /^set\d+$/.test(name))
  .map(([, set]) => set)
  .sort((left, right) => left.id - right.id);

export const lessons701To1000 = sets701To1000.flatMap((set) => set.lessons);

export * from "./sets-141-150.js";
export * from "./sets-151-160.js";
export * from "./sets-161-170.js";
export * from "./sets-171-180.js";
export * from "./sets-181-190.js";
export * from "./sets-191-200.js";
