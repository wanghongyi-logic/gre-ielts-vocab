# Core batch motion gate

Run from the repository root:

    python qa/core001-registration/check_batch.py --root . --report motion-report.json
    python qa/core001-registration/test_batch.py
    python qa/core001-registration/test_rig.py

Dependencies remain Python 3.10+, ffmpeg, NumPy and Pillow. The previous 43 guard files and all 15 media policies are immutable. Their respective test suites remain part of release checks.

## Canonical IDs and display order

The reviewed ordered IDs are 175–189, then 4477, 4688, 2524, 4011 and 2295. `learningRelease.approvedIds` is the sole ordered list; mode is `storybook-reviewed-order`, batch size is five, and each entry's `displayOrdinal` must match its position. Canonical IDs are not vocabulary counts or display ordinals. Duplicate, unsafe, unknown, missing, reordered and unreviewed IDs fail closed. Legacy modes remain governed by their unchanged code.

## Contact scope

The same 312-pixel-equivalent caps remain: maximum contact displacement/range 3px horizontally and 2px vertically, adjacent sole-width change 6px, suitable body-height variation 3%. Whole-character anatomy, posture and meaning still need visual review. No moving-foot exemption or frozen-leg repair is introduced.

Sterling checks the entire near shoe contact band and the exposed far toe/sole height behind the chair leg. Zealous checks the near shoe and the visible far sole segment's center, height and width to the left of the raised bed. Hidden portions are not a numerical whole-foot pass. Missing, shifted or clipped partial evidence fails. Small reference samples only isolate measurement evidence; they are never used to construct or edit animation frames.

Tribute declares four visible feet. The boy-right curved sole uses an exact reviewed exposed-toe X and supported sole Y proxy because YUV420 edge conversion makes its full lower-band width unstable. The full shoe contour/width remains visual-only; the other three feet retain full numerical checks. Minuscule and specious have genuinely opaque table framing, with explicit all-pose occlusion review and continuously checked table anchors. They make no numerical foot-pass claim.

## Fixed props and expressive action

Every frame and loop seam checks independent stationary scene anchors (MAE ≤1, dark-contour IoU ≥0.985), including specious's fixed balance pivot. Action regions must visibly change; dialogue does not count as artwork motion. Native stages and poster dialogue are identity-bound, while layout, timing, wording and meaning require integrated visual review.

Specious additionally checks four rigid pan/object patches against a reviewed 0–6.5° balance trajectory. Assemblies stay upright, tied to the fixed pivot and half-beam geometry. Matching tolerates only one native pixel around the expected position, with mean RGB error ≤8 for codec noise, and at least 15px table clearance. Missing objects, pan displacement, detached object motion and pivot drift have genuine numerical negative tests. Full pan/object contact contours and plausible hand release/regrasp remain visual-review-only.

## Review and tests

Media, decoded first-frame poster, config, code and review evidence are exact-hash bound. Global caps, scene scopes and ordered mapping cannot be silently broadened. Synthetic tests encode actual displaced/missing shoes and objects, drifting props, corrupted seams and body-size changes with correct hashes, separately from stale-hash and exception-misuse tests. Review snapshots and playback telemetry support acceptance but do not claim continuous human-like observation. The policy lock is reviewed release data, not an authorization service.
