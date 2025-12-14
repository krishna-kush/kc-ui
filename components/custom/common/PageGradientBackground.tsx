"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState, ReactNode } from "react";

interface PageGradientBackgroundProps {
  children: ReactNode;
}

/**
 * A page-level wrapper component that provides continuous animated gradient orbs
 * that span across all child sections. Individual sections should use transparent
 * or semi-transparent backgrounds to allow the gradients to show through.
 */
export default function PageGradientBackground({
  children,
}: PageGradientBackgroundProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" || theme === "dark" : true;

  return (
    <div className="relative bg-background">
      {/* Floating gradient orbs scattered throughout the page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* First orb - appears near FeaturesSection (around 100vh from top) */}
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute w-80 h-80 rounded-full blur-3xl ${
            isDark
              ? "bg-gradient-to-br from-primary/20 to-secondary/10"
              : "bg-gradient-to-br from-primary/30 to-secondary/20"
          }`}
          style={{ top: "100vh", left: "-10rem" }}
        />

        {/* Second orb - appears near SupportSection (around 200vh from top) */}
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute w-96 h-96 rounded-full blur-3xl ${
            isDark
              ? "bg-gradient-to-bl from-secondary/15 to-primary/10"
              : "bg-gradient-to-bl from-secondary/25 to-primary/15"
          }`}
          style={{ top: "180vh", right: "-8rem" }}
        />

        {/* Third orb - appears in middle of SupportSection */}
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute w-64 h-64 rounded-full blur-3xl ${
            isDark
              ? "bg-gradient-to-tr from-primary/15 to-transparent"
              : "bg-gradient-to-tr from-primary/25 to-transparent"
          }`}
          style={{ top: "250vh", left: "25%" }}
        />
      </div>

      {/* Content with relative positioning to appear above gradients */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
