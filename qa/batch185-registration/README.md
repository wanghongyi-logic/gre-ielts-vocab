#185–189 additive motion gate

Run the complete fifteen-scene gate from a clean release checkout:

    python qa/batch185-registration/check_batch.py --root . --report motion-report.json
    python qa/batch185-registration/test_batch.py
    python qa/batch-registration/test_batch.py
    python qa/registration/test_guard.py
    python qa/registration/test_phase_guard.py

Dependencies: Python3.10+, ffmpeg, NumPy and Pillow. Existing175–184 packages are pinned byte-for-byte. Their reviewed thresholds and exceptions remain unchanged. The new runner owns the exact active/approved/reviewed scene-set check and calls the preserved per-scene entrypoints. Unknown media, omitted scenes, changed hashes and incomplete five-scene review policies fail closed.

## Contact and camera checks

Every declared visible foot must have its own reviewed contact ROI, including secondary characters. Complete redrawn poses may vary naturally. At312px-equivalent resolution, adjacent contact displacement is limited to3px horizontally and2px vertically, with sole-band width change at most6px. Contact-position range across the complete planted cycle also remains within3px/2px, catching gradual drift. Suitable upright body-height proxies retain the3% limit; deliberately changing poses are explicitly visual-review-only when that proxy is unsuitable.

For textured floors, tiny hash-bound background samples isolate the shoe foreground without changing any animation pixel. The contact band uses the lowest three foreground rows, separating closely adjacent soles while preserving the same displacement/width limits. The detector requires a distinct, unclipped dominant component with sufficient evidence; missing or ambiguous shoes fail. This prevents floor lines from falsely appearing to be perfectly stationary soles.

Two or more independent fixed scene anchors remain checked in every frame. Maximum RGB mean error is1 and minimum dark-contour overlap is0.985. Anchors cannot be disabled during gestures. Meaningful action ROIs must show visible change; ordered-pose and full-loop visual review still establish anatomy, meaning and motion quality.

## Native dialogue

Motion measurements use decoded MP4 pixels only. Native text overlays cannot count as character animation. Configured visual anchors must avoid every declared overlay region. Dialogue wording, placement, timing, contrast, pause and page-entry behavior require separate integrated-app review; the media gate does not claim to certify them.

## Review and mutation tests

Each new video, poster, geometry config and review record is hash-bound. Only188 may use the reviewed solid-cabinet occlusion scope, with no visible-foot pass and a continuously measured counter face.189 may use reviewed stationary shoe landmarks, under the same drift limits and without claiming ground contact. These scopes require explicit all-pose review flags. No moving-foot exemption is enabled. Any necessary movement or genuine occlusion needs a narrowly scoped, explicitly reviewed extension; phase labels alone cannot suppress a contact failure.

Tests use correctly hash-bound synthetic media with textured floors and actual injected shoe displacement, scale changes, gradual drift, camera translation and loop corruption. Separate cases cover frozen action, missing visible-foot coverage, dialogue-covered anchors, stale hashes, unknown scenes, invalid references and exception misuse. The policy lock is reviewed release data, not a cryptographic authorization service.

###185 adjacent-shoe proxy

Only185's speaker-right shoe may use the reviewed exposed-toe X and supported sole Y proxy: its heel nearly overlaps the other shoe, making the full lower-band width codec-sensitive. Its full-width/contour check is explicitly visual-review-only. The other three visible shoes retain numerical sole-band width checks. Reuse on another scene or shoe, or without the specific review flag, fails. A correctly hash-bound shifted-toe fixture must fail the same displacement limits.

Contact rows require at least five foreground pixels. Isolated codec-edge speckles are not sole-contact evidence; the lowest-three-row band excludes unsupported pixels below that row. Tests distinguish this benign edge noise from real shoe displacement.

###189 stationary shoe landmarks

The left outer heel and right exposed toe are measured independently, with each supported sole height and the ordinary drift caps. The inner shoe edges overlap in projection, so both full-width/contour checks are explicitly visual-only. Only the hidden inner ROI edge may be clipped; each measured outer edge must remain visible and unclipped. Missing either shoe fails. Tests independently translate and remove each shoe, and reject unreviewed or wrong-foot proxy reuse. These are stationary image landmarks, not a claim that the shoes are planted on the ground.

The final stages/posterDialogue metadata digest is checked against the integrated catalog, including dialogue anchors. The native band remains outside artwork. Metadata identity and pixel-motion checks supplement the separate layout/wording/timing review.
