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

/** Secondary destinations: still one tap away, but not competing with the offer. */
const MORE = [
  ["Industries", "/industries"],
  ["Contact", "/contact"],
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const condensed = useScrolledPast(80);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) {
      requestAnimationFrame(() => trigger.current?.focus());
    }
  }, []);

  // A route can also change through browser history while the menu is open.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  // Modal behaviour: lock scroll, trap focus, close on Escape.
  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const scrollY = window.scrollY;
    const previousStyles = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };

    // `overflow: hidden` alone still allows the page to drift behind a modal
    // in iOS Safari. Fixing the body preserves the exact reading position.
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    panel.current
      ?.querySelector<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])')
      ?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const items = Array.from(
        panel.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
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
      body.style.overflow = previousStyles.overflow;
      body.style.position = previousStyles.position;
      body.style.top = previousStyles.top;
      body.style.width = previousStyles.width;
      window.scrollTo(0, scrollY);
    };
  }, [close, open]);

  return (
    <header
      className={`header${condensed ? " is-condensed" : ""}${open ? " is-menu-open" : ""}`}
    >
      <div className="header__inner">
        <Link className="header__brand" href="/">
          <ArctosLockup size={30} />
          <span className="visually-hidden">Arctos Launchpad — home</span>
        </Link>

        <nav className="header__nav" aria-label="Primary">
          {LINKS.map(([label, href]) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`header__link${active ? " is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
          <Link className="chr-cta-btn" href="/contact">
            Let’s talk
            <span aria-hidden="true">→</span>
          </Link>
        </nav>

        <div className="chr-bar-right">
          <Link className="chr-cta-btn chr-cta-btn--bar" href="/contact">
            Let’s talk
          </Link>
          <button
            ref={trigger}
            type="button"
            className="header__menu"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-haspopup="dialog"
            aria-label="Open site menu"
          >
            <span className="header__menu-bars" aria-hidden="true">
              <i />
              <i />
            </span>
            Menu
          </button>
        </div>
      </div>

      {/* Full-screen menu. The page stays faintly visible behind it so you keep
          your bearings — the brief asks for translucency, not a blackout. */}
      <div
        id="site-menu"
        className={`menu${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
        inert={!open}
      >
        <div
          className="menu__scrim"
          onClick={() => close()}
          aria-hidden="true"
        />
        <div className="menu__panel" ref={panel} data-material="instrument">
          <div className="menu__head">
            <ArctosLockup size={28} />
            <button
              type="button"
              className="menu__close"
              onClick={() => close()}
              aria-label="Close site menu"
            >
              Close
            </button>
          </div>

          <nav className="menu__nav" aria-label="Site">
            {LINKS.map(([label, href], i) => {
              const active =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`menu__item${active ? " is-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => close(false)}
                >
                  <span className="t-folio">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="menu__item-label">{label}</span>
                  <span className="menu__item-rule" aria-hidden="true" />
                </Link>
              );
            })}
          </nav>

          <div className="chr-menu-foot">
            <ul className="chr-menu-more">
              {MORE.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} onClick={() => close(false)}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              className="chr-menu-cta"
              href="/contact"
              onClick={() => close(false)}
            >
              <span>Discuss your project</span>
              <span aria-hidden="true">→</span>
            </Link>
            <p className="chr-menu-note">
              Start with what needs to change. Reply within two business days.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
