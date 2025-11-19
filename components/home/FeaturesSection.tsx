"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Binary, Shield, Upload, RefreshCw, Lock, Activity, Zap, Code, Database } from "lucide-react";
import CardSwap, { Card as SwapCard } from "@/components/CardSwap";
import DualScrollCarousel from "@/components/DualScrollCarousel";
import GlitchText from "@/components/GlitchText";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function FeaturesSection() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = mounted ? (resolvedTheme === 'dark' || theme === 'dark') : true;

  const leftFeatures = [
    {
      icon: Binary,
      title: "Many Binaries",
      image: "/assets/binaries/all.png",
    },
    {
      icon: Shield,
      title: "Upload Any Binary",
      image: "/assets/binaries/upload.png",
      detail: "We support multiple executable formats and all OS platforms",
    },
    {
      icon: Activity,
      title: "Continuous Verification",
      image: "/assets/license/verification.png",
    },
  ];

  const rightFeatures = [
    {
      icon: Lock,
      title: "Many Licences",
      image: "/assets/license/all.png",
    },
    {
      icon: RefreshCw,
      title: "Patchable Licenses",
      image: "/assets/license/patch.png",
    },
    {
      icon: Shield,
      title: "Configurable Licenses",
      image: "/assets/license/create.png",
    },
  ];


  // Format features for ScrollCarousel
  const leftCarouselFeatures = leftFeatures.map(feature => ({
    icon: feature.icon,
    title: feature.title,
    description: feature.detail || "",
    image: feature.image,
  }));

  const rightCarouselFeatures = rightFeatures.map(feature => ({
    icon: feature.icon,
    title: feature.title,
    description: feature.detail || "",
    image: feature.image,
  }));

  const renderFeatureCard = (feature: typeof leftFeatures[0]) => (
    <Card className="w-full h-full border-2 p-0 border-border bg-card backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 overflow-hidden">
      <CardContent className="p-0 h-full flex flex-col">
        {/* Header with icon and title */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <div className="inline-flex rounded-lg bg-red-500/10 p-2.5">
            <feature.icon className="h-5 w-5 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
        </div>
        
        {/* Image */}
        <div className="relative flex-1 bg-background flex items-center justify-center">
          <img 
            src={feature.image} 
            alt={feature.title}
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Optional detail */}
        {feature.detail && (
          <div className="p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">{feature.detail}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <section className="bg-background py-20 overflow-hidden pt-32">
      <div className="container mx-auto px-4">
        {/* Large screens: Two CardSwaps with centered text */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8 items-center">
          {/* Left CardSwap */}
          <div className="relative flex justify-end items-center" style={{ left: '-23%' }}>
            <div className="relative w-full max-w-[350px] aspect-[4/5]" style={{ overflow: 'visible' }}>
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <div className="features-card-swap-left">

                  <CardSwap
                    width={350}
                    height={450}
                    cardDistance={60}
                    verticalDistance={70}
                    delay={5000}
                    pauseOnHover={false}
                    skewAmount={6}
                    easing="elastic"
                    faceSide="left"
                  >
                    {leftFeatures.map((feature) => (
                      <SwapCard key={feature.title}>
                        {renderFeatureCard(feature)}
                      </SwapCard>
                    ))}
                  </CardSwap>
                </div>
              </div>
            </div>
          </div>

          {/* Center Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center px-4"
          >
            <h2 
              className={`mb-6 text-4xl xl:text-6xl font-bold text-foreground leading-tight ${isDark ? 'text-shadow-primary-left' : ''}`}
              style={!isDark ? { color: 'var(--primary-shade)' } : undefined}
            >
              Extended Protection
            </h2>
            <p className="text-muted-foreground text-lg xl:text-xl">
              Everything you need to secure your software and monitor usage
            </p>
          </motion.div>

          {/* Right CardSwap */}
          <div className="relative flex justify-start items-center" style={{ right: '-17%' }}>
            <div className="relative w-full max-w-[350px] aspect-[4/5]" style={{ overflow: 'visible' }}>
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <div className="features-card-swap-right">

                  <CardSwap
                    width={350}
                    height={450}
                    cardDistance={60}
                    verticalDistance={70}
                    delay={5200}
                    pauseOnHover={false}
                    skewAmount={6}
                    easing="elastic"
                    faceSide="right"
                  >
                    {rightFeatures.map((feature) => (
                      <SwapCard key={feature.title}>
                        {renderFeatureCard(feature)}
                      </SwapCard>
                    ))}
                  </CardSwap>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Small screens: ScrollStack */}
        <div className="lg:hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 px-4"
          >
            <h2 
              className={`mb-6 text-3xl sm:text-4xl font-bold text-foreground leading-tight ${isDark ? 'text-shadow-primary-left' : ''}`}
              style={!isDark ? { color: 'var(--primary-shade)' } : undefined}
            >
              Powerful Features for Binary Protection
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Everything you need to secure your software and monitor usage
            </p>
          </motion.div>

          <DualScrollCarousel
            topFeatures={leftCarouselFeatures}
            bottomFeatures={rightCarouselFeatures}
          />
        </div>
      </div>
    </section>
  );
}
