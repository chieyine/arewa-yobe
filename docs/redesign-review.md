# Field Signal redesign

Build `31640d7272696d4b`, 8 September 2026. Preview: http://localhost:3107/?design=field-signal.

Replaced the generic serif/green sign-in composition with a custom typographic entrance, original contour illustration, drawn signal paths and pointer-responsive depth. Updated workspace typography, navigation and metrics framing. The effect is SVG plus CSS perspective, not a WebGL scene or a geographically accurate map. Motion honors reduced-motion settings and essential controls remain usable without it.

Desktop and mobile screenshots are in `evidence/sign-in-desktop.png`, `evidence/sign-in-mobile.png` and the dashboard captures. `scripts/check-redesign.mjs` verifies mobile width, pointer depth and reduced-motion fallback. Syntax/build checks passed. Automated accessibility passed on the principal desktop and 360px screens. The four functional browser regressions passed. The combined run caught sidebar contrast failures, corrected in this build; the targeted rerun is recorded separately in `evidence/redesign-accessibility-verification.txt`. A first corrected scan exceeded the original 60-second overall test timeout during viewport evaluation, so the complete multi-screen scan was rerun with `npx playwright test --grep accessibility --timeout=180000`; no assertions were removed. The original run is preserved in `evidence/redesign-browser-verification.txt`.

The previous backend and deployment limitations still apply. This visual redesign does not imply hosted deployment, a physical-phone test, client acceptance or an award certification. Earlier full-suite evidence remains associated with its original build in `test-results.md`.

Final corrected accessibility rerun: PASS (1 test, 1.5 minutes including setup). The four functional browser tests, corrected accessibility scan, mobile sign-in width, pointer-depth and reduced-motion checks all passed. The longer scan duration is a test-run observation, not an application performance measurement.

## Motion pass — build cea025620bcfee53

Added a masked headline entrance, staggered supporting text, gently floating contour artwork, sequential pulsing markers, a visible pause/resume control, intersection-triggered workspace reveals, chart growth and button/navigation feedback. No fabricated animated counters or loading delays were introduced. Reduced-motion settings suppress both CSS choreography and scripted reveals; changing the setting cancels running animations. The artwork uses SVG/CSS, not a full WebGL 3D renderer.

Build and syntax checks passed. The browser motion check passed for 360px layout, pointer depth, pause/resume and reduced-motion behavior. This remains an entrance redesign plus workspace styling/motion pass; it is not a claim that every inner screen has been structurally redesigned. Current accessibility evidence is in `evidence/motion-accessibility-verification.txt`.

The motion scan identified transient text contrast loss during opacity fades. Build `9d295abca09eaf5e` keeps workspace and supporting-text reveals fully opaque, using translation rather than fading. The initial failure was corrected without removing accessibility assertions.
