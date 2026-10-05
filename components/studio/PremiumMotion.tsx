"use client";

import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP, ScrollTrigger);

/** The layout is complete by default. CSS owns entrances; GSAP owns depth. */
export function PremiumMotion() {
  const pathname = usePathname();
  useGSAP(() => {
    const main = document.querySelector("main");
    if (!main?.querySelector(".v3-home, .v3-page")) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const element = entry.target as HTMLElement;
          element.dataset.motionActive = String(entry.isIntersecting);
          if (entry.isIntersecting) element.dataset.motionEntered = "true";
        });
      }, { threshold: 0.12 });
      const selectors = ".v3-section-head, .v3-project, .v3-work-list > a, .v3-connection, .v3-process__steps, .v3-close, .v3-page-lead, .v3-route article, .v3-principles article, .v3-case, .v3-service-index > a, .v3-contact, .v3-footer, .v3-journey, .v3-finder";
      main.querySelectorAll(selectors).forEach(element => observer.observe(element));
      const hero = main.querySelector(".v3-hero");
      if (hero) observer.observe(hero);
      const footer = document.querySelector(".v3-footer");
      if (footer) observer.observe(footer);

      const art = main.querySelector(".v3-hero__machine");
      if (art) gsap.to(art, {
        scale: 1.075, yPercent: -5, ease: "none",
        scrollTrigger: { trigger: ".v3-hero", start: "top top", end: "bottom top", scrub: 0.8 },
      });
      main.querySelectorAll<HTMLElement>(".v3-project__report, .v3-project__media, .v3-case__visual, .v3-studio-art").forEach(plate => {
        gsap.fromTo(plate, { scale: 0.97, rotate: plate.classList.contains("v3-project__report") ? -2 : 0 }, {
          scale: 1, rotate: plate.classList.contains("v3-project__report") ? 1.5 : 0, ease: "none",
          scrollTrigger: { trigger: plate, start: "top 95%", end: "center 48%", scrub: 0.65 },
        });
      });
      main.querySelectorAll<HTMLElement>(".v3-journey").forEach(rail => {
        gsap.fromTo(rail, { "--trace": 1 }, { "--trace": 0, ease: "none", scrollTrigger: { trigger: rail, start: "top 88%", end: "bottom 45%", scrub: 0.5 } });
      });
      main.querySelectorAll<SVGPathElement>(".v3-project .rpt__line").forEach(line => {
        const length = line.getTotalLength();
        gsap.fromTo(line, { strokeDasharray: length, strokeDashoffset: length }, {
          strokeDashoffset: 0, ease: "none",
          scrollTrigger: { trigger: line.closest(".v3-project"), start: "top 82%", end: "center 50%", scrub: 0.5 },
        });
      });
      return () => {
        observer.disconnect();
        document.querySelectorAll("[data-motion-entered], [data-motion-active]").forEach(element => {
          element.removeAttribute("data-motion-entered");
          element.removeAttribute("data-motion-active");
        });
      };
    });
    return () => mm.revert();
  }, { dependencies: [pathname], revertOnUpdate: true });
  return null;
}
