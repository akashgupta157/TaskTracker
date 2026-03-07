"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number;
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  ...props
}: AnimatedThemeTogglerProps) => {
  const [theme, setThemeState] = useState<"light" | "dark">("dark");
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const isDark = document.documentElement.classList.contains("dark");
    setThemeState(stored ?? (isDark ? "dark" : "light"));
  }, []);

  const toggleTheme = useCallback(() => {
    if (!buttonRef.current) return;

    const cycleTheme = () => {
      const nextTheme = theme === "dark" ? "light" : "dark";

      setThemeState(nextTheme);
      localStorage.setItem("theme", nextTheme);

      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    const doc = document as typeof document & {
      startViewTransition?: (callback: () => void) => {
        ready: Promise<void>;
      };
    };

    if (typeof document === "undefined" || !doc.startViewTransition) {
      cycleTheme();
      return;
    }

    const transition = doc.startViewTransition(() => {
      flushSync(cycleTheme);
    });

    const ready = transition?.ready;
    if (ready && typeof ready.then === "function") {
      ready.then(() => {
        const button = buttonRef.current;
        if (!button) return;

        const { top, left, width, height } = button.getBoundingClientRect();

        const x = left + width / 2;
        const y = top + height / 2;

        const maxRadius = Math.hypot(
          Math.max(left, window.innerWidth - left),
          Math.max(top, window.innerHeight - top),
        );

        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      });
    }
  }, [theme, duration]);

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(className)}
      {...props}
    >
      {theme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};
