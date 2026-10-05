"use client";

import { useState } from "react";
import Link from "next/link";

const NEEDS = [
  {
    id: "website", number: "01", label: "I need more enquiries.", category: "Websites & growth",
    title: "Give the right people a reason to get in touch.",
    body: "A clear website, a convincing offer and a straightforward way to enquire. Then connect search and campaigns to the same customer journey.",
    deliverables: ["Website strategy, design & development", "Search visibility & landing pages", "Enquiry forms, CRM & lead routing"],
    steps: ["Someone finds you", "They see what you offer", "An enquiry reaches your team"],
    action: "Discuss my website", services: ["web-design-development", "seo-ai-search", "paid-media-lead-generation"],
  },
  {
    id: "automation", number: "02", label: "My team does too much by hand.", category: "Automation & integrations",
    title: "Make the handoffs happen without the chasing.",
    body: "When work depends on copying information, chasing approvals or remembering to follow up, we connect the tools and automate the repeatable steps.",
    deliverables: ["Workflow mapping & automation", "CRM and platform integrations", "Intake, approvals & follow-up"],
    steps: ["A form is submitted", "The right records update", "The next person gets the task"],
    action: "Discuss my workflow", services: ["business-automation", "crm-integrations"],
  },
  {
    id: "software", number: "03", label: "Our tools don't fit how we work.", category: "Custom software & applications",
    title: "Build the tool your business actually needs.",
    body: "A customer portal, an internal application or a product of your own. We turn the workflow into useful software, with clear responsibilities and room to evolve.",
    deliverables: ["Product strategy & interface design", "Web apps, portals & internal tools", "Development, integration & support"],
    steps: ["Map the real workflow", "Design one useful tool", "Put it into everyday use"],
    action: "Discuss my software", services: ["custom-software", "app-software-development", "ai-product-development"],
  },
  {
    id: "reporting", number: "04", label: "I can't see what's working.", category: "Reporting & business intelligence",
    title: "Turn scattered data into a view you can use.",
    body: "Campaign exports, event data and operational records brought into one clear report. Built around the questions your team needs answered.",
    deliverables: ["Dashboards & automated reporting", "Connected data sources", "Campaign and operational views"],
    steps: ["Data from your platforms", "One consistent reporting flow", "A clear view of performance"],
    action: "Discuss my reporting", services: ["analytics-reporting", "crm-integrations", "custom-software"],
  },
] as const;

export function NeedFinder() {
  const [selected, setSelected] = useState(0);
  const need = NEEDS[selected];
  return <div className="v3-finder">
    <div className="v3-finder__choices" role="group" aria-label="What would you like to improve?">
      {NEEDS.map((item, index) => <button key={item.id} type="button" aria-pressed={index === selected} aria-controls="need-detail" onClick={() => setSelected(index)}>
        <span className="v3-mono">{item.number}</span><span>{item.label}</span><span className="v3-finder__arrow" aria-hidden="true">↗</span>
      </button>)}
    </div>
    <div className="v3-finder__detail" id="need-detail" aria-live="polite" aria-atomic="true">
      <div className="v3-finder__copy" key={need.id}>
        <p className="v3-kicker">{need.category}</p>
        <h3>{need.title}</h3>
        <p>{need.body}</p>
        <ul className="v3-deliverables">{need.deliverables.map(item => <li key={item}><span aria-hidden="true">+</span>{item}</li>)}</ul>
        <Link className="v3-button" href={`/contact?need=${need.id}`}>{need.action}<span aria-hidden="true">↗</span></Link>
        <div className="v3-finder__links">{need.services.map(slug => <Link key={slug} href={`/services/${slug}`}>{slug === "seo-ai-search" ? "SEO & AI search" : slug.replaceAll("-", " ")}<span aria-hidden="true">↗</span></Link>)}</div>
      </div>
      <div className="v3-flow" aria-label="An example of the connected workflow">
        <p className="v3-mono">The pieces, connected</p>
        <ol>{need.steps.map((step, index) => <li key={step}><span className="v3-flow__number">{String(index + 1).padStart(2,"0")}</span><span>{step}</span></li>)}</ol>
        <span className="v3-flow__stamp">Built around your business.</span>
      </div>
    </div>
  </div>;
}
