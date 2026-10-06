/** Original illustrations in the approved bridge family. */
export const brandArt = {
  gateway: { src: "/assets/art/growth-gateway.webp", width: 1536, height: 1024, alt: "A polar bear opening a rust-orange gateway between floating islands." },
  workflow: { src: "/assets/art/workflow-loop.webp", width: 1536, height: 1024, alt: "A polar bear moving parcels along a continuous rust-orange route." },
  software: { src: "/assets/art/software-builder.webp", width: 1536, height: 1024, alt: "A polar bear assembling a modular rust-orange structure." },
} as const;

export function serviceArtwork(slug: string) {
  if (["web-design-development", "seo-ai-search", "paid-media-lead-generation", "branding-content", "ui-ux-design"].includes(slug)) return brandArt.gateway;
  if (["business-automation", "crm-integrations"].includes(slug)) return brandArt.workflow;
  if (["custom-software", "app-software-development", "ai-product-development"].includes(slug)) return brandArt.software;
  return undefined;
}
