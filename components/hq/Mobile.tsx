"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { buzz } from "./Swipe";
import { Icon } from "./ui";

const PULL = 72;

/**
 * Pull down from the top of the page on a phone to refresh, the way every
 * app does it. The browser's own pull-to-refresh is turned off on HQ (CSS),
 * so it only ever happens once.
 */
export function PullToRefresh({ onRefresh, busy }: { onRefresh: () => Promise<void> | void; busy: boolean }) {
  const [pull, setPull] = useState(0);
  const from = useRef<number | null>(null);
  const pullRef = useRef(0);
  const armed = useRef(false);

  useEffect(() => {
    const phone = () => window.matchMedia("(max-width: 1023px)").matches;
    const blocked = (t: EventTarget | null) => t instanceof Element && !!t.closest(".hq-quick, .hq-sheet, .hq-palette, textarea, input, select");
    const down = (e: TouchEvent) => {
      from.current = phone() && window.scrollY <= 0 && !blocked(e.target) ? e.touches[0].clientY : null;
      armed.current = false;
    };
    const move = (e: TouchEvent) => {
      if (from.current === null) return;
      const d = e.touches[0].clientY - from.current;
      if (d <= 0 || window.scrollY > 0) {
        if (pullRef.current) setPull((pullRef.current = 0));
        return;
      }
      // Resistance: the further you pull, the slower it follows.
      const v = Math.min(120, d * 0.5);
      if (v >= PULL && !armed.current) {
        armed.current = true;
        buzz(8);
      } else if (v < PULL) armed.current = false;
      setPull((pullRef.current = v));
    };
    const up = () => {
      if (from.current === null) return;
      from.current = null;
      if (pullRef.current >= PULL) void onRefresh();
      setPull((pullRef.current = 0));
    };
    window.addEventListener("touchstart", down, { passive: true });
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("touchend", up);
    window.addEventListener("touchcancel", up);
    return () => {
      window.removeEventListener("touchstart", down);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
      window.removeEventListener("touchcancel", up);
    };
  }, [onRefresh]);

  const shown = busy ? PULL : pull;
  if (!shown) return null;
  return (
    <div className="hq-ptr" style={{ transform: `translate(-50%, ${shown - 44}px)` }} data-ready={pull >= PULL || busy} aria-hidden="true">
      <span className="hq-spin" data-on={busy}><Icon name="refresh" /></span>
    </div>
  );
}

const standalone = () => window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
const noop = () => () => {};

/**
 * "Put HQ on your home screen": opens full screen with no browser bars,
 * like an app. Hidden once HQ is already running that way or on a laptop.
 */
export function InstallTip() {
  const installed = useSyncExternalStore(noop, standalone, () => true);
  const ios = useSyncExternalStore(noop, () => /iPhone|iPad|iPod/.test(navigator.userAgent), () => false);
  const [hidden, setHidden] = useState(() => {
    try {
      return typeof window !== "undefined" && window.localStorage.getItem("hq-install-tip") === "no";
    } catch {
      return false;
    }
  });
  if (installed || hidden) return null;
  return (
    <div className="hq-install">
      <span className="hq-install__icon" aria-hidden="true">HQ</span>
      <div>
        <b>Put HQ on your home screen</b>
        <p className="hq-small">{ios ? <>Tap <b>Share</b> at the bottom of Safari, then <b>Add to Home Screen</b>.</> : <>Open the browser menu (⋮), then <b>Add to Home screen</b> or <b>Install app</b>.</>} It opens full screen, like an app.</p>
      </div>
      <button
        type="button"
        className="hq-linkbtn hq-todo__x"
        aria-label="Hide this tip"
        onClick={() => {
          setHidden(true);
          try {
            window.localStorage.setItem("hq-install-tip", "no");
          } catch {}
        }}
      >
        ×
      </button>
    </div>
  );
}

/** Drag a sheet down by its handle to close it. */
export function useDragToClose(onClose: () => void) {
  const [dy, setDy] = useState(0);
  const start = useRef<number | null>(null);
  const handlers = {
    onPointerDown: (e: React.PointerEvent) => {
      if (e.pointerType !== "touch") return;
      start.current = e.clientY;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (start.current === null) return;
      setDy(Math.max(0, e.clientY - start.current));
    },
    onPointerUp: () => {
      if (start.current === null) return;
      start.current = null;
      if (dy > 90) {
        buzz(6);
        onClose();
      }
      setDy(0);
    },
    onPointerCancel: () => {
      start.current = null;
      setDy(0);
    },
  };
  return { dy, handlers };
}
