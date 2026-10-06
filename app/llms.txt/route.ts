import { KEYSTONE, calgaryLandingPages, guides, industries, projects, servicePages } from "@/lib/content";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * /llms.txt — a plain-Markdown summary of the studio for AI assistants
 * (ChatGPT, Claude, Perplexity, Gemini) that read it when answering questions
 * like "who builds websites in Calgary?". Generated from the same content
 * records as the pages, so it can never claim something the site does not.
 */
export function GET() {
  const url = (path: string) => `${SITE_URL}${path}`;

  const body = [
    `# ${SITE_NAME}`,
    "",
    "> Arctos Launchpad is a digital growth and technology studio based in Calgary, Alberta, working with organizations across Canada and the United States. It designs and builds conversion-focused websites, lead-generation systems, custom software, workflow automation, and reporting, connected into one system.",
    "",
    "Arctos works best with growing businesses and organizations whose website, tools, and manual processes have become disconnected. It does not guarantee search rankings.",
    "",
    "## Calgary services",
    "",
    ...calgaryLandingPages.map((p) => `- [${p.title}](${url(p.route)}): ${p.summary}`),
    "",
    `- [Across Canada](${url("/canada")}): The same studio for organizations anywhere in Canada, with Canadian privacy law and hosting in mind.`,
    `- [For US companies](${url("/united-states")}): A nearshore Canadian studio on Mountain Time, with the full US workday in reach; builds to WCAG AA for ADA expectations.`,
    "",
    "## Services",
    "",
    ...servicePages.map((s) => `- [${s.title}](${url(s.route)}): ${s.summary}`),
    "",
    "## Selected work",
    "",
    ...projects.map((p) => `- [${p.title}](${url(p.route)}): ${p.summary}`),
    "",
    "## Industries",
    "",
    ...industries.map((i) => `- [${i.title}](${url(`/industries/${i.slug}`)}): ${i.summary}`),
    "",
    "## Guides",
    "",
    ...guides.map((g) => `- [${g.title}](${url(g.route)}): ${g.summary}`),
    "",
    "## Frequently asked questions",
    "",
    ...servicePages.flatMap((s) =>
      s.faq.map((f) => `- **${f.question}** (${s.title}) ${f.answer}`),
    ),
    "",
    "## Pro bono",
    "",
    `- [Keystone, the Arctos pro bono program](${url("/pro-bono")}): ${KEYSTONE.cadence}, Arctos designs and builds for a nonprofit, community group, social enterprise or small business in a hard season at no cost: websites, automation and impact reporting, with the same team and standards as paid work. The organization owns everything; Arctos asks to share the work as a case study.`,
    "",
    "## Contact",
    "",
    `- [Start a project](${url("/contact")}): Describe what you need and Arctos replies with next steps.`,
    `- [How Arctos works](${url("/process")})`,
    `- [About the studio](${url("/studio")})`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
