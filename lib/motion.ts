import type { Transition, Variants } from "framer-motion";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export const snap: Transition = { duration: 0.1, ease: "easeOut" };

export const reveal = (reduce: boolean | null): Transition =>
  reduce ? { duration: 0 } : { duration: 0.25, ease: "easeOut" };

export const modalSnap = (reduce: boolean | null): Transition =>
  reduce ? { duration: 0 } : { duration: 0.2, ease: "easeOut" };
