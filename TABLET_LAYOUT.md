# Small-tablet landscape reader

This release adapts the current illustrated storybook app, not the historical
GRE/IELTS dashboard. Primary target: Huawei MatePad Mini, landscape 16:10.

## Layout contract

- Landscape from 760 CSS pixels wide and 480 pixels high uses a fixed-height book.
- The left 37% holds the headword, pronunciation, original media controller and
  previous/next controls. No live media node is moved or duplicated on rotation.
- The right reading pane owns vertical scrolling. Body copy is 20px, the English
  definition 21px, and mnemonic entries are stacked rather than compressed into
  two narrow cards. Definitions, usages, examples and equivalents remain intact.
- The document itself does not scroll. Contents and Settings use their own leaf
  scrollport; portrait/mobile retain the original document-scroll behavior.
- Section bookmarks, local reading persistence and page-turn impressions share
  the same scroll-root contract. A signed section offset preserves the breathing
  room above a chapter heading when rotating the device.

## Verification performed

Chromium touch-enabled viewports: 1280×800, 1024×640, 960×600, 853×533, and
1280×680 with reduced browser-chrome space. Checked: document height equals
viewport height, no horizontal overflow, fixed left geometry while the right
pane scrolls, native vertical touch without accidental word turns, chapter
navigation, rotation in both directions, directory centering/search/return,
long-headword fitting, next-word reset, and 390×844 portrait fallback.

No physical MatePad Mini was attached. Device browser density and system text
settings can differ; a real-device review is still useful.

Focused automated checks:

```
node --test tests/reading-scroll.test.mjs tests/tablet-swipe.test.mjs tests/navigation-init-recovery.test.mjs
PYTHONDONTWRITEBYTECODE=1 python3 tests/rebuild-offline-shell.test.py
```

## Layout-only publication

`scripts/rebuild-offline-shell.py --build 204-offline3500-v61` refreshes the shell
version and hashes. It preserves absent media/lesson metadata in sparse
checkouts rather than treating missing working files as withdrawn content.
The content catalog, authored word lessons and hosted-media ranges are unchanged.
