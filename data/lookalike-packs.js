import {
  lookalikePacks001To3071,
  getLookalikePack001To3071,
} from "./lookalike-packs-001-3071.js";

// Meaning-based comparisons stay on lesson.comparisons. This aggregate is
// exclusively for spelling/root lookalikes and is keyed safely by number.
export const lookalikePacks = lookalikePacks001To3071;
export const getLookalikePack = getLookalikePack001To3071;
export { lookalikePacks001To3071, getLookalikePack001To3071 };
