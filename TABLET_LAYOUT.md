# Borderless responsive storybook reader

This release adapts the current illustrated storybook app, not the historical
GRE/IELTS dashboard. Primary target: Huawei MatePad Mini in both orientations,
with iPhone landscape/portrait and desktop monitor layouts retained.

## Layout contract

- Landscape from 600 CSS pixels wide and 280 pixels high uses a fixed-height
  reader, including short iPhone browser viewports. Portrait is a borderless
  single-column page with normal document scrolling; the word card is not fixed.
- The left 37% holds the headword, pronunciation, original media controller and
  previous/next controls. No live media node is moved or duplicated on rotation.
- The landscape right reading pane owns vertical scrolling. Body copy is 20px,
  or 18px in a compact phone landscape; the English
  definition 21px, and mnemonic entries are stacked rather than compressed into
  two narrow cards. Definitions, usages, examples and equivalents remain intact.
- The document itself does not scroll. Contents and Settings use their own leaf
  scrollport; portrait/mobile retain the original document-scroll behavior.
- Section bookmarks, local reading persistence and page-turn impressions share
  the same scroll-root contract. A signed section offset preserves the breathing
  room above a chapter heading when rotating the device.
- IPA, part of speech and pronunciation share one row. The visible audio glyph
  is 20px while its transparent touch target stays 44×44px.
- All orientations use a one-column index with a sticky title/search header.
  Portrait still scrolls normally; only landscape uses the directory scrollport.
- Page transitions use two empty paper layers with transform/opacity. They do
  not clone the reading tree or capture video into a canvas. Media stays in place
  until adoption; reduced-motion users navigate without the visual transition.

## Verification performed

Chromium touch-enabled viewports: 1280×800, 1024×640, 960×600, 853×533, and
1280×680 with reduced browser-chrome space. Checked: document height equals
viewport height, no horizontal overflow, fixed left geometry while the right
pane scrolls, native vertical touch without accidental word turns, chapter
navigation, rotation in both directions, directory centering/search/return,
long-headword fitting, next-word reset, and 390×844 portrait fallback.
The borderless follow-up additionally checked 640×1024 and 800×1280 portrait,
844×390 iPhone landscape, 1440×900 desktop, metadata alignment, audio touch target,
sticky one-column search in both scroll roots, and transition cleanup.

No physical MatePad Mini was attached. Device browser density and system text
settings can differ; a real-device review is still useful.

Focused automated checks:

```
node --test tests/reading-scroll.test.mjs tests/tablet-swipe.test.mjs tests/navigation-init-recovery.test.mjs tests/contents-layout.test.mjs tests/page-transitions.test.mjs
PYTHONDONTWRITEBYTECODE=1 python3 tests/rebuild-offline-shell.test.py
```

## Layout-only publication

`scripts/rebuild-offline-shell.py --build 204-offline3500-v63` refreshes the shell
version and hashes. It preserves absent media/lesson metadata in sparse
checkouts rather than treating missing working files as withdrawn content.
The content catalog, authored word lessons and hosted-media ranges are unchanged.
