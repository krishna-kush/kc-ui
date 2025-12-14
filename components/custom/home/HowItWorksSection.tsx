"use client";

import { motion } from "framer-motion";
import { Upload, Shield, BarChart3, Sparkles, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { DualShadowText } from "@/components/custom/common/text";

export default function HowItWorksSection() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" || theme === "dark" : true;

  const steps = [
    {
      step: "1",
      icon: Upload,
      title: "Upload Your File",
      description:
        "Upload your file and configure license settings including check intervals, grace periods, and execution limits.",
      image: "/assets/upload/dark.png",
    },
    {
      step: "2",
      icon: Shield,
      title: "Get Protected File",
      description:
        "Our system merges your file with the protection layer and generates a license-protected .kc file.",
      image: "/assets/license/main.png",
    },
    {
      step: "3",
      icon: BarChart3,
      title: "Monitor & Control",
      description:
        "Track verification attempts, view analytics, revoke licenses instantly, and monitor usage patterns across all your protected files.",
      image: "/assets/license/all.png",
    },
  ];

  return (
    <section className="bg-transparent pt-0 pb-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Simple 3-Step Process
            </span>
          </motion.div>

          <DualShadowText
            as="h2"
            className="mb-4 text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight"
            left={{
              text: "How It",
              shadowDirection: isDark ? "left" : "none",
              shadowColor: "var(--primary)",
              textColor: isDark ? "var(--foreground)" : "var(--primary-shade)",
            }}
            right={{
              text: "Works",
              shadowDirection: isDark ? "right" : "none",
              shadowColor: "var(--foreground)",
              textColor: isDark ? "var(--primary)" : "var(--primary-shade)",
            }}
          />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Protect your binaries in minutes with our streamlined workflow.
          </p>
        </motion.div>

        {/* Steps with timeline */}
        <div className="mx-auto max-w-4xl relative">
          {/* Connecting timeline line */}
          <div
            className={`absolute left-6 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-1/2 ${
              isDark
                ? "bg-gradient-to-b from-primary/50 via-secondary/30 to-primary/50"
                : "bg-gradient-to-b from-primary/30 via-secondary/20 to-primary/30"
            }`}
          />

          <div className="space-y-12">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                id={`how-it-works-step-${item.step}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                {/* Step number circle - positioned on timeline */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`absolute left-0 md:left-1/2 md:-translate-x-1/2 z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-xl font-bold text-white shadow-lg shadow-primary/30 border-4 ${
                    isDark ? "border-background" : "border-background"
                  }`}
                >
                  {item.step}
                </motion.div>

                {/* Relative container - text card sets height, image positioned absolutely */}
                <div className="relative md:pl-0">
                  {/* Content card - in normal flow, sets the height */}
                  <motion.div
                    whileHover={{
                      y: -4,
                      boxShadow: isDark
                        ? "0 20px 40px -12px rgba(var(--primary-rgb), 0.15)"
                        : "0 20px 40px -12px rgba(0, 0, 0, 0.1)",
                    }}
                    className={`ml-16 md:ml-0 md:w-[calc(50%-1.5rem)] p-6 rounded-2xl border transition-all duration-300 ${
                      isDark
                        ? "bg-card/60 border-border/50 backdrop-blur-xl"
                        : "bg-card/80 border-border/30 backdrop-blur-xl"
                    } hover:border-primary/30 ${
                      index % 2 === 0 ? "" : "md:ml-auto md:text-right"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                        isDark ? "bg-primary/10" : "bg-primary/5"
                      }`}
                    >
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>

                    {/* Title */}
                    <h3
                      className="mb-2 text-xl font-semibold"
                      style={{
                        color: isDark
                          ? "var(--foreground)"
                          : "var(--primary-shade)",
                      }}
                    >
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.description}
                    </p>

                    {/* Arrow indicator for next step */}
                    {index < steps.length - 1 && (
                      <button
                        onClick={() => {
                          const nextStep = document.getElementById(
                            `how-it-works-step-${steps[index + 1].step}`
                          );
                          if (nextStep) {
                            nextStep.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          }
                        }}
                        className={`hidden md:flex items-center gap-1 mt-4 text-xs text-primary/60 hover:text-primary transition-colors cursor-pointer ${
                          index % 2 === 0 ? "" : "flex-row-reverse"
                        }`}
                      >
                        <span>Next step</span>
                        <ArrowRight
                          className={`w-3 h-3 ${
                            index % 2 === 0 ? "" : "rotate-180"
                          }`}
                        />
                      </button>
                    )}
                  </motion.div>

                  {/* Image container - absolutely positioned to match card height */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.15 + 0.1 }}
                    className={`hidden md:block absolute top-0 bottom-0 w-[calc(50%-1.5rem)] ${
                      index % 2 === 0 ? "right-0" : "left-0"
                    }`}
                  >
                    <div
                      className={`h-full rounded-2xl overflow-hidden border flex items-center justify-center ${
                        isDark
                          ? "border-border/30 bg-card/30"
                          : "border-border/20 bg-card/50"
                      } backdrop-blur-sm`}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="max-w-full max-h-full object-contain p-4"
                      />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
