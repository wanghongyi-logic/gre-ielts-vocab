# Redrawn animation registration gate

Run from a clean website checkout:

    python qa/registration/check.py --root . --report registration-report.json
    python qa/registration/test_guard.py
    python qa/registration/test_phase_guard.py

Dependencies: Python 3.10+, ffmpeg, NumPy and Pillow. The gate reads only committed MP4/poster files and the relative catalog paths. No source sprites, private workspace, browser or service credentials are needed.

## What passes and what does not

This is a supplemental technical gate for **redrawn raster keyframes**, not a skeletal rig and not a fixed-body or frozen-foot renderer. It checks every decoded frame and the last-to-first seam. All active catalog story-media scenes must have reviewed configs; unknown scenes, missing ROIs, changed media/config/code hashes, and unreviewed exceptions fail closed.

For175–178, contact landmarks use the dark sole contour's lowest pixel and the center/width of its lowest six-pixel band. At 312px-equivalent resolution, ordinary transitions permit at most 3px horizontal contact shift, 2px vertical sole shift, 6px sole-span change, and 3% body-height range. Larger native frames normalize displacement to the same scale. Natural line, color and contour variation is allowed; pixel equality and whole-frame mean differences are not substitutes for these measurements.

Two existing narrative-reset exceptions are explicit and narrowly bounded:
- 175: the exact unchanged approved video, frame168→0, left contact only, horizontal shift≤3.5px and vertical≤2px
- 177: the exact unchanged approved video, frame143→0, front contact only, horizontal shift≤3px and vertical≤3px

Those IDs, video hashes, frame endpoints, feet and caps are pinned in code and config. Internal transitions retain ordinary limits. An exception cannot be reused for a different video, foot or transition; every use appears in the report. Unknown hashes require a fresh review and intentional policy-lock update, never automatic threshold relaxation.

## Scope and limitations

Both people’s body heights are checked for176. The partly occluded rear shoe in177 is reviewed visually; its front shoe is the numeric contact proxy. Camera framing, stationary props, individual shoe anatomy, cuffs/joints, expression and the lift/watch/lower/watch story remain mandatory visual-review checks. Passing this gate is necessary but does not certify artistic quality or semantic correctness.

178 retains complete original redrawn frames; whole-frame native crops correct a6px row offset and equivalent original poses replace inconsistent ones. Whole-frame source reconstruction was verified separately before release. The release gate pins that reviewed encoded result and its exact decoded-frame0 poster; it does not require distributing source sprite sheets.

## Tests and maintenance

Tests create temporary synthetic lossless videos with correctly matching media/config hashes. Shifted shoes, changed sole proportions and a corrupted loop seam must fail actual motion thresholds, independently of checksum checks. Separate tests cover stale media, changed thresholds, unknown scenes, missing ROIs and unreviewed/reused exceptions.

To add or change an animation: review the redrawn source and complete loops, define suitable contact/body ROIs, run the gate, record any narrowly justified exception, and explicitly review updated hashes/configs. Do not make a failed result pass by silently broadening a global threshold. The policy-lock is reviewed release data, not a cryptographic authorization service.

## 179 intentional movement profile

179 uses complete redrawn character cels over a stationary authored background. Its exact video and phase plan are bound to the reviewed evidence record. Pipe and bench ROIs are checked in every decoded frame, including airborne intervals; disappearing anchor evidence fails. Each anchor permits RGB mean error at most1 and dark-contour IoU at least0.985.

Cream-shoe connected components provide contact landmarks during initial contact (frames0–21), settled contact (104–119), and return contact (120–143). Missing, clipped or ambiguous shoe evidence fails. Each contact interval has a reviewed absolute target; adjacent planted intervals and the loop also retain ordinary contact thresholds.

Frames22–103 contain reviewed lift, airborne, water-sweep, kick-lift/ripples and landing-settle phases. Their moving foot trajectories and anatomy are explicitly visual-review-only, with bounded departure and landing phases. Phase labels alone cannot authorize a new animation: changed media, intervals or review evidence require fresh review and hash-lock updates. Torso/head proportions while leaning are also visual-review-only. The final reviewed action shows visible ripples, without claiming a distinct shoe-thrown splash plume.

The phase tests include correctly hash-bound injected contact shifts, wrong landing targets, cross-phase contact teleportation, disappearing/ambiguous shoes, and camera or anchor corruption during flight. Additional failures cover missing landing, phase gaps, widened tolerances, reused scene policy and unreviewed phase changes.
