"use client";

import { Star } from "lucide-react";
import { useReducedMotion } from "framer-motion";

export function SpinStar({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <Star
      aria-hidden
      strokeWidth={3}
      className={`${reduce ? "" : "animate-spin-slow"} fill-yellow text-ink ${className}`}
    />
  );
}

export function ArrowBurst({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 40" fill="none" aria-hidden>
      <path d="M4 20 H68" stroke="currentColor" strokeWidth="4" />
      <path d="M54 8 L72 20 L54 32" stroke="currentColor" strokeWidth="4" fill="none" />
    </svg>
  );
}

export function ShapeFloater({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-10 w-10 border-4 border-border bg-violet shadow-brutal ${className}`}
    />
  );
}
