import { lookalikePacks301To370 } from "./lookalike-packs-301-370.js";
import { lookalikePacks371To435 } from "./lookalike-packs-371-435.js";
import { lookalikePacks436To500 } from "./lookalike-packs-436-500.js";

// Independent spelling/root lookalike data for words 301–500. This does not
// merge into the meaning-based `comparisons` cards on each lesson.
export const lookalikePacks301To500 = {
  ...lookalikePacks301To370,
  ...lookalikePacks371To435,
  ...lookalikePacks436To500,
};

const packsByNumber = new Map(
  Object.values(lookalikePacks301To500).map((pack) => [pack.number, pack]),
);

export function getLookalikePack301To500(wordOrNumber) {
  if (typeof wordOrNumber === "number" || /^\d+$/.test(String(wordOrNumber))) {
    return packsByNumber.get(Number(wordOrNumber));
  }

  return lookalikePacks301To500[String(wordOrNumber).trim().toLowerCase()];
}

export {
  lookalikePacks301To370,
  lookalikePacks371To435,
  lookalikePacks436To500,
};
