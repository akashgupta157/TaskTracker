"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────
type State = "idle" | "loading" | "completing" | "done";

// ─── Hook: detects navigation changes ─────────────────────────
function useNavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<State>("idle");
  const [progress, setProgress] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPathRef = useRef<string | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const complete = useCallback(() => {
    clearTimers();
    setProgress(100);
    setState("completing");
    timerRef.current = setTimeout(() => {
      setState("done");
      timerRef.current = setTimeout(() => {
        setState("idle");
        setProgress(0);
      }, 300);
    }, 400);
  }, [clearTimers]);

  const start = useCallback(() => {
    clearTimers();
    setProgress(0);
    setState("loading");

    // Ease the bar from 0 → ~85% in increments that slow as they approach the cap
    let current = 0;
    intervalRef.current = setInterval(() => {
      current += Math.random() * 8 + 4; // random step 4–12
      if (current >= 85) {
        current = 85;
        clearInterval(intervalRef.current!);
      }
      setProgress(current);
    }, 120);
  }, [clearTimers]);

  useEffect(() => {
    const currentPath = `${pathname}?${searchParams.toString()}`;
    if (prevPathRef.current === null) {
      prevPathRef.current = currentPath;
      return;
    }
    if (prevPathRef.current !== currentPath) {
      prevPathRef.current = currentPath;
      start();
      // The new page has mounted by the time this effect fires, so complete quickly
      timerRef.current = setTimeout(() => complete(), 50);
    }
  }, [pathname, searchParams, start, complete]);

  // Cleanup on unmount
  useEffect(() => () => clearTimers(), [clearTimers]);

  return { state, progress };
}

// ─── Component ────────────────────────────────────────────────
export default function NavigationProgress() {
  const { state, progress } = useNavigationProgress();

  const visible = state !== "idle";

  return (
    <>
      {/* Top progress bar */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          height: "3px",
          pointerEvents: "none",
          opacity: visible ? 1 : 0,
          transition: "opacity 300ms ease",
        }}
      >
        {/* Track (subtle background) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--progress-track, rgba(99,102,241,0.15))",
          }}
        />

        {/* Animated fill */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: `${progress}%`,
            background:
              "linear-gradient(90deg, #6366f1 0%, #818cf8 60%, #a5b4fc 100%)",
            boxShadow:
              state === "loading"
                ? "0 0 10px 1px rgba(99,102,241,0.6)"
                : "none",
            borderRadius: "0 2px 2px 0",
            transition:
              state === "loading"
                ? "width 120ms linear"
                : state === "completing"
                ? "width 200ms cubic-bezier(0.4,0,0.2,1)"
                : "none",
          }}
        />

        {/* Sheen — the travelling bright spot */}
        {state === "loading" && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "80px",
              left: `calc(${progress}% - 60px)`,
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
              transition: "left 120ms linear",
            }}
          />
        )}
      </div>

      {/* Spinner in top-right — visible during loading */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "14px",
          right: "16px",
          zIndex: 9999,
          pointerEvents: "none",
          opacity: state === "loading" ? 1 : 0,
          transform: state === "loading" ? "scale(1)" : "scale(0.6)",
          transition: "opacity 200ms ease, transform 200ms ease",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          style={{ animation: "tt-spin 0.7s linear infinite" }}
        >
          <circle
            cx="9"
            cy="9"
            r="7"
            stroke="rgba(99,102,241,0.25)"
            strokeWidth="2.5"
          />
          <path
            d="M9 2 a7 7 0 0 1 7 7"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Keyframes injected once */}
      <style>{`
        @keyframes tt-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}