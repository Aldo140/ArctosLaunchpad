"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./ui";

/**
 * The command bar: ⌘K, Ctrl+K or / opens it; type to filter, Enter runs.
 * Two-key shortcuts ("g i" for Inbox) work anywhere outside a text field.
 */

export interface PaletteItem { id: string; label: string; hint?: string; icon?: string; keys?: string; run: () => void }

const typing = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));

export function Palette({ items, open, setOpen }: { items: PaletteItem[]; open: boolean; setOpen: (v: boolean) => void }) {
  const prefix = useRef<{ key: string; at: number } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
        return;
      }
      if (open || typing(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "/") {
        e.preventDefault();
        setOpen(true);
        return;
      }
      const p = prefix.current;
      if (p && Date.now() - p.at < 1200) {
        const hit = items.find((i) => i.keys === `${p.key} ${e.key.toLowerCase()}`);
        prefix.current = null;
        if (hit) {
          e.preventDefault();
          hit.run();
        }
        return;
      }
      if (items.some((i) => i.keys?.startsWith(`${e.key.toLowerCase()} `))) prefix.current = { key: e.key.toLowerCase(), at: Date.now() };
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items, open, setOpen]);

  return open ? <Panel items={items} close={() => setOpen(false)} /> : null;
}

/** Mounted fresh on every open, so the search starts empty and focused. */
function Panel({ items, close }: { items: PaletteItem[]; close: () => void }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const back = useRef<Element | null>(typeof document === "undefined" ? null : document.activeElement);

  useEffect(() => {
    const was = back.current;
    return () => {
      if (was instanceof HTMLElement) was.focus();
    };
  }, []);

  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();
    const words = query.split(/\s+/).filter(Boolean);
    const hits = items.filter((i) => words.every((w) => `${i.label} ${i.hint ?? ""}`.toLowerCase().includes(w)));
    /* Labels that start with what was typed come first, then labels that contain it. */
    const rank = (i: PaletteItem) => (i.label.toLowerCase().startsWith(query) ? 0 : i.label.toLowerCase().includes(query) ? 1 : 2);
    return query ? hits.sort((a, b) => rank(a) - rank(b)) : hits;
  }, [items, q]);

  const run = (i: PaletteItem | undefined) => {
    if (!i) return;
    close();
    i.run();
  };

  return (
    <div className="hq-palette" role="dialog" aria-modal="true" aria-label="Command bar" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="hq-palette__panel">
        <input
          autoFocus
          className="hq-palette__input"
          placeholder="Go anywhere, do anything…"
          value={q}
          aria-label="Search commands"
          aria-controls="hq-palette-list"
          aria-activedescendant={shown[sel] ? `hq-pal-${shown[sel].id}` : undefined}
          onChange={(e) => {
            setQ(e.target.value);
            setSel(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
            else if (e.key === "ArrowDown") {
              e.preventDefault();
              setSel((s) => Math.min(s + 1, shown.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setSel((s) => Math.max(s - 1, 0));
            } else if (e.key === "Enter") run(shown[sel]);
          }}
        />
        <ul id="hq-palette-list" className="hq-palette__list" role="listbox" aria-label="Commands">
          {shown.map((i, n) => (
            <li key={i.id} id={`hq-pal-${i.id}`} role="option" aria-selected={n === sel} onMouseEnter={() => setSel(n)} onClick={() => run(i)}>
              <Icon name={i.icon ?? "more"} />
              <span>{i.label}{i.hint ? <small>{i.hint}</small> : null}</span>
              {i.keys ? <kbd>{i.keys}</kbd> : null}
            </li>
          ))}
          {!shown.length ? <li className="hq-palette__none">Nothing matches “{q}”.</li> : null}
        </ul>
        <p className="hq-palette__foot hq-mono"><span>↑↓ move</span><span>↵ open</span><span>esc close</span></p>
      </div>
    </div>
  );
}
