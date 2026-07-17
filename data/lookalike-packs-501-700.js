import { lookalikePacks501To570 } from "./lookalike-packs-501-570.js";
import { lookalikePacks571To635 } from "./lookalike-packs-571-635.js";
import { lookalikePacks636To700 } from "./lookalike-packs-636-700.js";

// Independent spelling/root lookalike data for words 501–700. This remains
// separate from each lesson's meaning-based `comparisons` cards.
export const lookalikePacks501To700 = {
  ...lookalikePacks501To570,
  ...lookalikePacks571To635,
  ...lookalikePacks636To700,
};

const packsByNumber = new Map(
  Object.values(lookalikePacks501To700).map((pack) => [pack.number, pack]),
);

export function getLookalikePack501To700(wordOrNumber) {
  if (typeof wordOrNumber === "number" || /^\d+$/.test(String(wordOrNumber))) {
    return packsByNumber.get(Number(wordOrNumber));
  }

  return lookalikePacks501To700[String(wordOrNumber).trim().toLowerCase()];
}

export {
  lookalikePacks501To570,
  lookalikePacks571To635,
  lookalikePacks636To700,
};
