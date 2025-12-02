"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, BarChart3, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import Beams from "@/components/Beams";
import ColorBends from "@/components/ColorBends";
import GlitchText from "@/components/GlitchText";
import { ThemeToggle } from "@/components/theme-toggle";
import { formatNumber } from "@/lib/utils";
import { statsApi } from "@/lib/api";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export default function HeroSection() {
  const [verificationCount, setVerificationCount] = useState<string>("10,000+");
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = mounted ? (resolvedTheme === 'dark' || theme === 'dark') : true; // Default to dark during SSR

  useEffect(() => {
    const fetchVerificationCount = async () => {
      try {
        const data = await statsApi.verifications();
        const formatted = formatNumber(data.total_verifications);
        setVerificationCount(formatted);
      } catch (error) {
        console.error('Failed to fetch verification count:', error);
        // Keep default "10,000+" on error
      }
    };

    fetchVerificationCount();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background flex items-center">
      {/* Theme Toggle Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-6 right-6 z-20"
      >
        <ThemeToggle
          variant="outline"
          className="rounded-full backdrop-blur-sm bg-background/50 border-primary/20 hover:bg-primary/10 text-primary"
        />
      </motion.div>

      <div className="absolute inset-0 w-full h-full">
        {isDark ? (
          <Beams
            beamWidth={3}
            beamHeight={30}
            beamNumber={20}
            lightColor="#ffffff"
            speed={2}
            noiseIntensity={1.75}
            scale={0.2}
            rotation={30}
          />
        ) : (
          <ColorBends
            speed={0.2}
            colors={['#b91c1cff', '#dc2626ff', '#f87171ff', '#fca5a5ff']}
            transparent={false}
            autoRotate={0.5}
            scale={1.2}
            frequency={1}
            warpStrength={1}
            mouseInfluence={0.5}
            parallax={0.3}
            noise={0.05}
            backgroundColor="#ffffffff"
          />
        )}
      </div>
      
      <section className="container relative z-10 mx-auto px-4 py-20 text-center w-full">
        <motion.div
          className="mx-auto max-w-4xl space-y-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm backdrop-blur-sm"
          >
            <Shield className="h-4 w-4 text-primary" suppressHydrationWarning />
            <span className="text-foreground">Secure Binary Licensing & Protection</span>
          </motion.div>
          
          <motion.h1
            variants={itemVariants}
            className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl"
            style={{ color: isDark ? 'var(--foreground)' : 'var(--primary-shade)' }}
          >
            Protect Your Binaries with{" "}
            <GlitchText 
              speed={0.5}
              minSize="4rem"
              enableShadows={true} 
              glitchTimeout={2}
              firstGlitchColor={isDark ? "var(--primary)" : "var(--primary-shade)"}
              secondGlitchColor="var(--secondary)"
              keepFirstGlitch={true}
              keepSecondGlitch={false}
              glitchIntensity={15}
              textColor="white"
              className="inline-block align-baseline [&]:!text-[inherit] [&]:!font-[inherit] [&]:!m-0"
            >
              killcode
            </GlitchText>
          </motion.h1>
          
          <motion.p
            variants={itemVariants}
            className="mx-auto max-w-2xl text-lg text-muted-foreground"
          >
            A comprehensive binary licensing and protection system that allows you to upload binaries, 
            attach licenses, and enforce usage restrictions through continuous verification.
          </motion.p>
          
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <Link href="/auth">
              <Button size="lg" className="gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" suppressHydrationWarning />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="gap-2">
                <BarChart3 className="h-4 w-4" suppressHydrationWarning />
                View Dashboard
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-8 pt-12"
          >
            {[
              { value: "50-100ms", label: "Verification Time" },
              { value: verificationCount, label: "Verifications" },
              { value: "256-bit", label: "Encryption" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-center"
              >
                <div 
                  className="text-3xl font-bold"
                  style={{ color: isDark ? 'var(--foreground)' : 'var(--primary-shade)' }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
