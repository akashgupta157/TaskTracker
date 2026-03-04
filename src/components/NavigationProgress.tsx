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

    let current = 0;
    intervalRef.current = setInterval(() => {
      current += Math.random() * 8 + 4;
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
      timerRef.current = setTimeout(() => complete(), 50);
    }
  }, [pathname, searchParams, start, complete]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return { state, progress };
}

// ─── Component ────────────────────────────────────────────────
export default function NavigationProgress() {
  const { state, progress } = useNavigationProgress();

  const visible = state !== "idle";
  const isLoading = state === "loading";

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
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--progress-track, rgba(99,102,241,0.15))",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: `${progress}%`,
            background: "linear-gradient(90deg, #6366f1 0%, #818cf8 60%, #a5b4fc 100%)",
            boxShadow: state === "loading" ? "0 0 10px 1px rgba(99,102,241,0.6)" : "none",
            borderRadius: "0 2px 2px 0",
            transition: state === "loading" ? "width 120ms linear" : state === "completing" ? "width 200ms cubic-bezier(0.4,0,0.2,1)" : "none",
          }}
        />
        {state === "loading" && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "80px",
              left: `calc(${progress}% - 60px)`,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
              transition: "left 120ms linear",
            }}
          />
        )}
      </div>

      {/* Full screen loading overlay */}
      {isLoading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9998,
            backdropFilter: "blur(2px)",
          }}
          className="dark:bg-black/60"
        >
          <div style={{ textAlign: "center" }}>
            {/* Animated spinner */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              style={{ animation: "tt-spin 0.7s linear infinite" }}
            >
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="rgba(99,102,241,0.2)"
                strokeWidth="4"
              />
              <path
                d="M24 4 a20 20 0 0 1 20 20"
                stroke="#6366f1"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            <p
              style={{
                marginTop: "16px",
                color: "#6366f1",
                fontWeight: 500,
                fontSize: "14px",
              }}
            >
              Loading...
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes tt-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}