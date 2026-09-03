"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-12 w-12 items-center justify-center border-4 border-border bg-panel shadow-brutal transition-all duration-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
    >
      {dark ? (
        <Moon strokeWidth={3} className="h-5 w-5" />
      ) : (
        <Sun strokeWidth={3} className="h-5 w-5" />
      )}
    </button>
  );
}
