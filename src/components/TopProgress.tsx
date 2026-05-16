"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const START_EVENT = "topprogress:start";

export function startTopProgress() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(START_EVENT));
}

export function TopProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start handler — covers both Link clicks and manual startTopProgress() calls
  useEffect(() => {
    const start = () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      setVisible(true);
      setProgress(15);
    };

    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor || !anchor.href) return;
      if (anchor.target && anchor.target !== "_self") return;
      try {
        const url = new URL(anchor.href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        )
          return;
      } catch {
        return;
      }
      start();
    };

    document.addEventListener("click", handleClick);
    window.addEventListener(START_EVENT, start);
    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener(START_EVENT, start);
    };
  }, []);

  // Trickle while visible — eases toward 90% but never reaches it
  useEffect(() => {
    if (!visible) return;
    trickleRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + (90 - p) * 0.12, 90));
    }, 200);
    return () => {
      if (trickleRef.current) {
        clearInterval(trickleRef.current);
        trickleRef.current = null;
      }
    };
  }, [visible]);

  // Complete when the URL actually changes
  useEffect(() => {
    if (!visible) return;
    if (trickleRef.current) clearInterval(trickleRef.current);
    setProgress(100);
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2px]"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms ease" }}
    >
      <div
        className="h-full bg-primary"
        style={{
          width: `${progress}%`,
          boxShadow: "0 0 8px var(--primary), 0 0 4px var(--primary)",
          transition: "width 200ms ease-out",
        }}
      />
    </div>
  );
}
