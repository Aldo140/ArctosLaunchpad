# Arctos motion pass

The studio now has a coordinated motion layer across the homepage and main interior pages.

- Timed headline, illustration and rule choreography on the homepage.
- Two gently rotating gear interiors, sampled from the existing illustration. No new bitmap asset or change to the original artwork.
- Scroll-linked depth on the hero illustration, report and project media.
- Report chart lines draw with scroll progress.
- A new connected customer journey draws across the page. A moving packet follows the sequence while it is in view.
- Solution diagrams assemble when first reached and replay when the selected business need changes. Their numbered steps carry a recurring signal.
- Section headings, case spreads, process steps, footer branding and the enquiry form get coordinated native CSS entrances.
- Buttons, links, work images and optional form details respond to deliberate interaction.

CSS owns entrances so a cancelled JavaScript tween cannot strand readable content. GSAP owns scroll depth and line progress. Layout and content are complete by default. There is no scroll hijacking or waiting loader. Recurring animations pause off screen; reduced motion removes them and restores the static composition, including when the preference changes during the session.

Verification includes TypeScript, ESLint and a production build; desktop/mobile normal and reduced-motion checks; animation pause/resume; live preference switching; solution selection and enquiry context; client navigation; and fast scroll to the end and back. QA frames and results are stored locally under `.qa/premium/`.
