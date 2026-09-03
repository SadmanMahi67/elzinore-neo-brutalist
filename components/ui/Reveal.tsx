"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, reveal } from "@/lib/motion";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ ...reveal(reduce), delay }}
    >
      {children}
    </motion.div>
  );
}
