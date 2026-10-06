"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useScrolledPast } from "@/lib/useMedia";
import { ArctosLockup } from "../brand/ArctosLockup";

const LINKS = [
  ["Work", "/work"],
  ["Services", "/services"],
  ["Process", "/process"],
  ["Studio", "/studio"],
] as const;

const MORE = [
  ["Industries", "/industries"],
  ["Free reporting teardown", "/teardown"],
  ["Contact", "/contact"],
] as const;

type Tone = "ink" | "paper" | "bone" | "pine";

/**
 * The header reads the tone of whatever section sits beneath it, so it stays
 * legible over dark chapters and light ones without a fixed background.
 */
function useToneUnderHeader(pathname: string) {
  const [tone, setTone] = useState<Tone>("ink");
  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const sections = document.querySelectorAll<HTMLElement>("main [data-tone]");
      let next: Tone = "ink";
      for (const section of sections) {
        const r = section.getBoundingClientRect();
        if (r.top <= 36 && r.bottom > 36) next = section.dataset.tone as Tone;
      }
      setTone(next);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);
  return tone;
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const condensed = useScrolledPast(40);
  const tone = useToneUnderHeader(pathname);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => trigger.current?.focus());
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  // Modal behaviour: lock scroll (iOS-safe), trap focus, close on Escape.
  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const scrollY = window.scrollY;
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    panel.current?.querySelector<HTMLElement>("a, button")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const items = Array.from(
        panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      ).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const head = items[0];
      const tail = items[items.length - 1];
      if (e.shiftKey && document.activeElement === head) {
        e.preventDefault();
        tail.focus();
      } else if (!e.shiftKey && document.activeElement === tail) {
        e.preventDefault();
        head.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.overflow = previous.overflow;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      window.scrollTo(0, scrollY);
    };
  }, [close, open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={`hdr tone-${open ? "ink" : tone}${condensed ? " is-condensed" : ""}${open ? " is-open" : ""}`}
    >
      <div className="hdr__bar">
        <Link className="hdr__brand" href="/" aria-label="Arctos Launchpad — home">
          <ArctosLockup size={32} />
        </Link>

        <nav className="hdr__nav" aria-label="Primary">
          {LINKS.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={`hdr__link${isActive(href) ? " is-active" : ""}`}
              aria-current={isActive(href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hdr__end">
          <Link className="hdr__cta" href="/contact">
            <span>Start a project</span>
            <span aria-hidden="true">→</span>
          </Link>
          <button
            ref={trigger}
            type="button"
            className="hdr__menu"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-haspopup="dialog"
          >
            <span className="hdr__menu-bars" aria-hidden="true">
              <i />
              <i />
            </span>
            Menu
          </button>
        </div>
      </div>

      <div
        id="site-menu"
        className={`menu tone-ink${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
        inert={!open}
      >
        <div className="menu__panel" ref={panel}>
          <div className="menu__head">
            <ArctosLockup size={30} />
            <button type="button" className="menu__close" onClick={() => close()}>
              Close
            </button>
          </div>
          <nav className="menu__nav" aria-label="Site">
            {LINKS.map(([label, href], i) => (
              <Link
                key={href}
                href={href}
                className={`menu__item${isActive(href) ? " is-active" : ""}`}
                aria-current={isActive(href) ? "page" : undefined}
                onClick={() => close(false)}
                style={{ transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}
              >
                <span className="index">{String(i + 1).padStart(2, "0")}</span>
                <span className="menu__label">{label}</span>
              </Link>
            ))}
          </nav>
          <div className="menu__foot">
            <ul>
              {MORE.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} onClick={() => close(false)}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link className="btn btn--block" href="/contact" onClick={() => close(false)}>
              <span>Start a project</span>
              <span className="btn__dot" aria-hidden="true">
                →
              </span>
            </Link>
            <p>Calgary, Alberta · Replies within two business days.</p>
          </div>
        </div>
      </div>
    </header>
  );
}
