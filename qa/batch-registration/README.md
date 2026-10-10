# Additive five-scene registration gate

Run from a clean release checkout:

    python qa/batch-registration/check_batch.py --root . --report motion-report.json
    python qa/batch-registration/test_batch.py
    python qa/registration/test_guard.py
    python qa/registration/test_phase_guard.py

Dependencies remain Python3.10+, ffmpeg, NumPy and Pillow.

The combined gate pins the existing registration package byte-for-byte, evaluates its175–179 scenes using their unchanged policies, then checks the separately reviewed180–184 configs. Unknown catalog media, changed code/config/media, absent review evidence and reused exceptions fail. Files and videos use checkout-relative paths. The lock is reviewed release data, not a cryptographic authorization service.

## Planted scenes

Complete redrawn character poses retain natural contour variation. Each visible planted shoe is measured on every decoded frame, including the loop seam. Maximum contact displacement at312px-equivalent resolution is3px horizontally and2px vertically; sole-band width change is at most6px. The horizontal and vertical contact bounds also apply across the complete planted cycle, catching gradual drift; sole-band width uses the adjacent-frame bound, allowing natural gradual contour variation. Suitable upright body-height proxies permit at most3% range. Deliberate torso poses that invalidate this proxy must be named as visual-review-only rather than automatically classified as scale drift.

At least two visible stationary scene anchors are checked throughout the animation. Each allows at most1 RGB mean absolute error and at least0.985 dark-contour overlap relative to the opening frame. Anchor disappearance or empty evidence fails. ROIs must exclude moving-character occlusion, intended rain and moving objects.

At least one reviewed action ROI must show a peak average RGB change of1 or more. This catches a frozen replacement; it does not establish narrative correctness. Ordered poses and full-loop visual review remain required for meaning, anatomy, joins and motion quality.

## Contact scope

Scenes180–183 use planted contacts.184 may use an exact reviewed solid-front-counter occlusion scope: no visible feet, no numerical foot pass claimed, and an additional counter-face anchor checked throughout. The all-pose occlusion review is mandatory; other scenes cannot reuse it. No moving-foot exemption is enabled for180–184. The separate original179 phase policy remains unchanged. Any future stepping or pivoting scene needs fresh ordered-pose review and a separately scoped guard extension, rather than reusing a movement label to bypass contact checks.

## Tests and updates

Synthetic lossless videos have correctly matching media/config hashes. Numerical tests inject shoe displacement, shoe-width changes, gradual drift, body growth, camera translation, anchor disappearance and loop corruption. Separate tests exercise stale hashes, unknown scenes, widened thresholds, disabled anchors and invalid phase policies. Freeze, anatomy and storytelling must also pass visual review.

To add new media, first design camera/prop anchors and intended contact phases, then inspect actual redrawn poses. Review exact final video/poster/config hashes and all transitions before updating the lock. Never broaden a threshold merely to make a failing asset pass.

### Textured floors

For scenes where dark floor lines or paving could be mistaken for a sole, contact detection uses measurement-only fixed-background subtraction. Configs contain small compressed RGB samples for the two shoe ROIs, with dimensions and raw-pixel hashes. These are reference measurements, not replacement animation layers. Foreground requires a per-pixel RGB difference greater than25, enough detected pixels and an unclipped lower contact band. This avoids a false zero-drift result from tracking floor lines. Tests use the same subtraction detector and include corrupted-reference rejection. A new background, crop or reference requires an exact config/media review.
