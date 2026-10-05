# Rebuild v2 completion

Completed the interrupted rebuild on `rebuild-v2`. Recovered the uncommitted teardown, services, work, contact and trust work from their original worktrees without modifying those worktrees. Replaced the remaining Process, Studio and Industries index compositions. All existing service, industry, case-file, local and legal routes remain available.

The homepage now has all nine sections. Fresh Prep and True North Kromes lead the proof. The primary conversion path is `/teardown`; Contact retains the project, question and other enquiry paths. The header uses solid ink over artwork. Integration adjustments reduce desktop homepage height from 15,424px to about 12,481px while retaining the proof and service detail. This remains above the brief's approximate 9,000–11,000px target.

Visual passes:
1. Assembled desktop view exposed low-contrast Process type and excessive section spacing. Added a paper field behind the type and reduced gaps.
2. Scrolled desktop and mobile views confirmed lazy-loaded artwork, case-file footage and report structure render. Tightened offer and trust ledgers.
3. Mobile views exposed excess space above the Studio headline. Removed the held viewport height on small screens. Expanded hero proof links to 44px touch targets.
4. Final mobile opening check confirmed the circular hero crop and a CTA ending at approximately 660px in the 390×844 viewport.

Validation:
- TypeScript, ESLint and production build pass; 49 pages generated.
- Internal link audit found no broken destinations.
- Desktop 1440px, tablet 768px and mobile 390/360px checks found no horizontal page overflow.
- Scrolled page checks found no unloaded images on the homepage and eight reviewed index/conversion pages.
- Homepage normal and reduced motion checks at 1440/390/360 found no JavaScript errors or invisible headings.
- Both enquiry forms passed client validation, payload and success-state checks with delivery mocked. Mobile navigation passed open and Escape-close checks.
- Actual email delivery was not exercised. No deployment or push performed.

Existing assets were sufficient. QA screenshots and machine-readable results are retained locally under `.qa/` and excluded from Git.
