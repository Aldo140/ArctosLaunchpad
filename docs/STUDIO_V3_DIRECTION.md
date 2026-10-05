# Arctos / More business. Less busywork.

This direction replaces the reporting-first homepage with a broader, clearer business offer. The visitor can recognise a problem, see the relevant deliverables, and start a project conversation without knowing the technical solution.

## What changed

- New homepage composition and original editorial artwork; warm orange, ink and paper palette.
- Four interactive starting points: more enquiries, less manual work, tools that fit, and clearer reporting. Each has concrete deliverables, an example workflow and a contextual CTA.
- Primary action: **Discuss your project**. Selected needs carry into the enquiry form. **Not sure yet** is a valid starting point.
- The short form asks for name, email and the change the visitor wants. Company, website, budget and timing are tucked into an optional panel. Existing API validation and the honeypot remain intact.
- Fresh Prep and True North Kromes provide the first proof, with client status shown honestly. The report contains no published client figures.
- Services, Work, Process, Studio, Industries and Contact have new compositions. Existing detail, local and legal routes stay available, with the updated shared frame and project CTA.
- The free reporting teardown remains a specific, secondary offer.
- Removed the loading intro and survey rail. Content arrives immediately.
- The desktop homepage is approximately 7,500px, compared with about 12,500px in the previous rebuild.

## Verification

- Typecheck, ESLint and production build pass.
- Eight main/conversion pages checked at 1440, 1024, 768, 390, 360 and 320px: one H1 each, no horizontal page overflow, unloaded images, invalid JSON-LD or browser errors.
- No broken internal links in the audited navigation and page content.
- All four problem-selector states lead to the right enquiry context.
- Empty form validation, context preservation, minimal submission, success state, optional-field error focus and mobile menu dismissal checked using mocked delivery. Actual email delivery was not exercised.
- Normal and reduced motion checked separately on the homepage.
- Local screenshots and audit results are under `.qa/v3/`, excluded from Git.

## Generated asset

Saved asset: `public/assets/v3/the-work-moves.webp`.

Generated with the built-in `image_gen` tool, using `public/assets/illustrations/connected-automation.webp` as a character/style reference. Original generation remains in the Codex generated-images directory. The selected image was converted to WebP for the website.

Final prompt:

> Use case: illustration-story. Asset type: bespoke wide editorial illustration for Arctos Launchpad, a premium Calgary website and software studio. Create a new illustration inspired by the provided brand reference, not an edit. Primary request: 'the work moves'. A large cream polar bear at a thoughtfully designed industrial drafting desk guides a flowing ribbon of scattered papers through one rust-orange open-frame mechanical sorting apparatus; the papers emerge on the right as a beautifully orderly stack with a single clean flat panel behind them. This is an evocative metaphor for turning business busywork into a working system. Style: sophisticated tactile linocut and mid-century editorial print, expressive thin ink contour lines, rough paper edges, light stipple, subtle hand-printed registration, highly art-directed, beautiful silhouette. Landscape 3:2 composition, subject filling canvas at generous scale, bear in left-middle, flow traveling left to right. Entire scene on uniform deep almost-black navy #081319, cream #e7e2d7, bright restrained vermilion/rust #c1541f and muted sage details. Consistent flat navy background runs to every edge so it blends into website. No circle, no badge, no roundel, no torn-paper background, no enclosing border, no typography or letters, no numbers, no logos, no mountains, no trees, no gradients, no glow, no 3D rendering, no cartoon emoji. The bear should look intelligent, friendly and purposeful. Strong visual hierarchy, beautifully composed with some breathing room at the top. Reference image 1 is a style and character reference only; replace its composition entirely.
