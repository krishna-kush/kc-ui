"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function HowItWorksSection() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = mounted ? (resolvedTheme === 'dark' || theme === 'dark') : true;
  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`mb-6 text-center text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight ${isDark ? 'text-shadow-primary-left' : ''}`}
          style={!isDark ? { color: 'var(--primary-shade)' } : undefined}
        >
          How It Works
        </motion.h2>
        
        <div className="mx-auto max-w-3xl space-y-8">
          {[
            {
              step: "1",
              title: "Upload Your File",
              description: "Upload your file and configure license settings including check intervals, grace periods, and execution limits.",
            },
            {
              step: "2",
              title: "Get Protected File",
              description: "Our system merges your file with the protection layer and generates a license-protected .kc file.",
            },
            {
              step: "3",
              title: "Monitor & Control",
              description: "Track verification attempts, view analytics, revoke licenses instantly, and monitor usage patterns across all your protected files.",
            },
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="flex gap-6"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-destructive text-xl font-bold text-white shadow-lg"
              >
                {item.step}
              </motion.div>
              <div>
                <h3
                  className="mb-2 text-xl font-semibold"
                  style={{ color: isDark ? 'var(--foreground)' : 'var(--primary-shade)' }}
                >
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
