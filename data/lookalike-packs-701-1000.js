import { lookalikePacks701To800 } from "./lookalike-packs-701-800.js";
import { lookalikePacks801To900 } from "./lookalike-packs-801-900.js";
import { lookalikePacks901To1000 } from "./lookalike-packs-901-1000.js";

// Independent spelling/root lookalike data for words 701–1000. This remains
// separate from each lesson's meaning-based `comparisons` cards.
export const lookalikePacks701To1000 = {
  ...lookalikePacks701To800,
  ...lookalikePacks801To900,
  ...lookalikePacks901To1000,
};

const packsByNumber = new Map(
  Object.values(lookalikePacks701To1000).map((pack) => [pack.number, pack]),
);

export function getLookalikePack701To1000(wordOrNumber) {
  if (typeof wordOrNumber === "number" || /^\d+$/.test(String(wordOrNumber))) {
    return packsByNumber.get(Number(wordOrNumber));
  }

  return lookalikePacks701To1000[String(wordOrNumber).trim().toLowerCase()];
}

export {
  lookalikePacks701To800,
  lookalikePacks801To900,
  lookalikePacks901To1000,
};
