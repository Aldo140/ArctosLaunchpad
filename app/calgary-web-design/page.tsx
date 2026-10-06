import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { LocalBrief } from "@/components/LocalBrief";

export const metadata: Metadata = pageMetadata({
  title: "Calgary Web Design & Development | Arctos Launchpad",
  absoluteTitle: true,
  description:
    "Calgary web design and development: conversion-focused websites for growing businesses, connected to lead capture, CRM workflows, and analytics.",
  path: "/calgary-web-design",
  eyebrow: "Calgary web design",
  cardTitle: "A website built to carry the business forward.",
});

const faq = [
  {
    question: "How much does a website cost in Calgary?",
    answer:
      "It depends on the number of pages, how much content needs writing, and what the site must connect to, such as a CRM, booking tool, or quote form. Tell Arctos what the site needs to do and you will get an estimate based on that scope.",
  },
  {
    question: "Can Arctos redesign or improve our existing website?",
    answer:
      "Yes. The work can begin with an audit and targeted improvements when a full rebuild is not necessary, and a rebuild is recommended only when the current site is holding the business back.",
  },
  {
    question: "Do you build custom websites or use WordPress?",
    answer:
      "Both. Arctos builds custom websites and WordPress sites, choosing based on your content, how often your team updates it, and long-term maintenance needs.",
  },
  {
    question: "Will the new website help us show up on Google?",
    answer:
      "Every site is built with search foundations in place: clear service pages, fast loading, accessible markup, structured data, and a sitemap. Arctos does not promise rankings, because results depend on competition and demand, but the groundwork is done properly from the start.",
  },
  {
    question: "Can the website connect to our CRM and send us leads automatically?",
    answer:
      "Yes. Forms, lead routing, follow-up emails, and reporting can be connected so every enquiry lands in the right place instead of sitting in an inbox.",
  },
  {
    question: "Do you only work with Calgary businesses?",
    answer:
      "Arctos is based in Calgary, Alberta, and works with organizations anywhere in Canada.",
  },
];

export default function Page() {
  return (
    <LocalBrief
      canonical="/calgary-web-design"
      title="A website built to carry the business forward."
      intro="Arctos designs and develops websites for Calgary organizations that need clearer positioning, stronger conversion, and a better system behind every enquiry."
      thesis={{
        lead: "Your website is often where search, advertising, referrals, reputation, and sales meet.",
        punch: "It should do more than look current.",
      }}
      auditTitle="When the website becomes the bottleneck"
      audit={[
        "Qualified visitors cannot quickly understand the offer.",
        "Pages are difficult for your team to update.",
        "Forms create manual follow-up instead of a clear workflow.",
        "Search visibility, speed, or accessibility has fallen behind.",
        "Analytics do not explain what visitors do next.",
      ]}
      serviceSlug="web-design-development"
      proofSlug="rio-alto"
      ctaTitle="What should your website do better?"
      faq={faq}
      ctaBody="Tell us where the current experience is costing attention, enquiries, time, or confidence."
    />
  );
}
