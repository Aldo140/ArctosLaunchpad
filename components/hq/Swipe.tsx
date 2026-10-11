"use client";

import { useRef, useState } from "react";

export interface SwipeAction {
  label: string;
  run: () => void;
  /** "go" is the accent (approve, done, paid); "calm" is neutral (skip, later, open). */
  tone?: "go" | "calm";
}

/** A short buzz on phones that support it (Android). Silent everywhere else. */
export function buzz(ms = 10) {
  try {
    navigator.vibrate?.(ms);
  } catch {}
}

const COMMIT = 88;

/**
 * A row you can swipe on a touch screen: right runs `right`, left runs
 * `left`. Mouse and keyboard users never see a difference; the buttons on
 * the row still do the same things. Vertical scrolling wins whenever the
 * finger moves more down than across.
 */
export function Swipe({ left, right, children, className }: { left?: SwipeAction | null; right?: SwipeAction | null; children: React.ReactNode; className?: string }) {
  const [dx, setDx] = useState(0);
  const [settling, setSettling] = useState(false);
  const start = useRef<{ x: number; y: number; id: number; axis: "x" | "y" | null } | null>(null);
  const armed = useRef(false);
  const swiped = useRef(false);

  if (!left && !right) return <div className={className}>{children}</div>;

  const limit = (v: number) => (v > 0 ? (right ? Math.min(160, v) : 0) : left ? Math.max(-160, v) : 0);

  const end = () => {
    const s = start.current;
    start.current = null;
    if (!s || s.axis !== "x") return;
    const act = dx >= COMMIT ? right : dx <= -COMMIT ? left : null;
    setSettling(true);
    setDx(0);
    window.setTimeout(() => setSettling(false), 220);
    if (act) {
      buzz(12);
      act.run();
    }
  };

  const side = dx > 0 ? right : dx < 0 ? left : null;
  const past = Math.abs(dx) >= COMMIT;

  return (
    <div className={`hq-swipe ${className ?? ""}`} data-active={dx !== 0 || undefined}>
      {side ? (
        <div className="hq-swipe__under" data-side={dx > 0 ? "right" : "left"} data-tone={side.tone ?? "calm"} data-past={past} aria-hidden="true">
          <span>{side.label}</span>
        </div>
      ) : null}
      <div
        className="hq-swipe__top"
        data-settling={settling || undefined}
        style={dx ? { transform: `translateX(${dx}px)` } : undefined}
        onPointerDown={(e) => {
          if (e.pointerType !== "touch") return;
          start.current = { x: e.clientX, y: e.clientY, id: e.pointerId, axis: null };
          armed.current = false;
          swiped.current = false;
        }}
        onPointerMove={(e) => {
          const s = start.current;
          if (!s || s.id !== e.pointerId) return;
          const mx = e.clientX - s.x;
          const my = e.clientY - s.y;
          if (!s.axis) {
            if (Math.abs(mx) < 8 && Math.abs(my) < 8) return;
            s.axis = Math.abs(mx) > Math.abs(my) * 1.2 ? "x" : "y";
            if (s.axis === "x") {
              swiped.current = true;
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            }
          }
          if (s.axis !== "x") return;
          const v = limit(mx);
          if (Math.abs(v) >= COMMIT && !armed.current) {
            armed.current = true;
            buzz(6);
          } else if (Math.abs(v) < COMMIT) armed.current = false;
          setDx(v);
        }}
        onPointerUp={end}
        onPointerCancel={() => {
          start.current = null;
          setDx(0);
        }}
        onClickCapture={(e) => {
          // A swipe that ends over a button shouldn't also press it.
          if (swiped.current) {
            e.stopPropagation();
            e.preventDefault();
            swiped.current = false;
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
