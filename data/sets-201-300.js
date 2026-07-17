import * as m41 from "./sets-41-43.js"; import * as m44 from "./sets-44-47.js";
import * as m48 from "./sets-48-50.js"; import * as m51 from "./sets-51-54.js";
import * as m55 from "./sets-55-57.js"; import * as m58 from "./sets-58-60.js";
const modules=[m41,m44,m48,m51,m55,m58];
export const sets201To300=modules.flatMap(module=>Object.entries(module).filter(([name,value])=>/^set\d+$/.test(name)&&value?.id>=41&&value.id<=60).map(([,value])=>value)).sort((a,b)=>a.id-b.id);
export const lessons201To300=sets201To300.flatMap(set=>set.lessons);
