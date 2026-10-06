import { industries, projects, servicePages } from "@/lib/content";
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
    "> Arctos Launchpad is a digital growth and technology studio based in Calgary, Alberta, working with organizations anywhere in Canada. It designs and builds conversion-focused websites, lead-generation systems, custom software, workflow automation, and reporting, connected into one system.",
    "",
    "Arctos works best with growing businesses and organizations whose website, tools, and manual processes have become disconnected. It does not guarantee search rankings.",
    "",
    "## Calgary services",
    "",
    `- [Web design Calgary](${url("/calgary-web-design")}): Website design and development for Calgary businesses, connected to lead capture, CRM workflows, and analytics.`,
    `- [Custom software development Calgary](${url("/calgary-custom-software")}): Web applications, client portals, internal tools, and workflow systems.`,
    `- [Business automation Calgary](${url("/calgary-business-automation")}): Workflow review, forms, approvals, follow-up, and integrations that remove manual work.`,
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
    "## Frequently asked questions",
    "",
    ...servicePages.flatMap((s) =>
      s.faq.map((f) => `- **${f.question}** (${s.title}) ${f.answer}`),
    ),
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
