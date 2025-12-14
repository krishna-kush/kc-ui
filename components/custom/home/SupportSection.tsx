"use client";

import { motion } from "framer-motion";
import TiltedCard from "@/components/TiltedCard";
import InfiniteMenu from "@/components/InfiniteMenu";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Monitor, Terminal, Apple, Cpu, Sparkles, Zap } from "lucide-react";
import { DualShadowText } from "@/components/custom/common/text";

export default function SupportSection() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" || theme === "dark" : true;

  const operatingSystems = [
    {
      name: "Windows",
      logo: "/assets/os/windows.png",
      icon: Monitor,
      gradient: "from-blue-500/20 to-cyan-500/20",
      borderGlow: "hover:shadow-orange-500/30",
      description: "Full Windows support",
    },
    {
      name: "Linux",
      logo: "/assets/os/linux.png",
      icon: Terminal,
      gradient: "from-orange-500/20 to-yellow-500/20",
      borderGlow: "hover:shadow-orange-500/30",
      description: "All major distros",
    },
    {
      name: "macOS",
      logo: "/assets/os/macos.png",
      icon: Apple,
      gradient: "from-gray-500/20 to-slate-400/20",
      borderGlow: "hover:shadow-orange-500/30",
      description: "Intel & Apple Silicon",
    },
  ];

  const cpuArchitectures = [
    {
      image: "/assets/arch/intel.png",
      link: "https://www.intel.com/",
      title: "Intel",
      description: "Intel with 32-bit and 64-bit architecture support",
    },
    {
      image: "/assets/arch/ryzen.png",
      link: "https://www.amd.com/en/products/processors/desktops/ryzen.html",
      title: "AMD",
      description: "AMD with 32-bit and 64-bit architecture support",
    },
    {
      image: "/assets/arch/apple-m1.png",
      link: "https://en.wikipedia.org/wiki/Apple_M1",
      title: "M1",
      description: "Apple M-Series processors support",
    },
    {
      image: "/assets/arch/intel-i9.png",
      link: "https://www.intel.com/content/www/us/en/ark/products/series/236143/intel-core-i9-processors-14th-gen.html",
      title: "Intel",
      description: "Intel with 32-bit and 64-bit architecture support",
    },
    {
      image: "/assets/arch/apple-m1-pro.png",
      link: "https://en.wikipedia.org/wiki/Apple_M1",
      title: "M1 Pro",
      description: "Apple M-Series processors support",
    },
    {
      image: "/assets/arch/intel.png",
      link: "https://en.wikipedia.org/wiki/X86",
      title: "x86",
      description: "32-bit architecture support for legacy systems",
    },
    {
      image: "/assets/arch/ryzen.png",
      link: "https://en.wikipedia.org/wiki/X86-64",
      title: "x86-64",
      description: "64-bit architecture support for modern computers",
    },
    {
      image: "/assets/arch/apple-m1.png",
      link: "https://en.wikipedia.org/wiki/ARM_architecture_family",
      title: "ARM",
      description: "32-bit ARM processors for mobile and embedded systems",
    },
    {
      image: "/assets/arch/intel-i9.png",
      link: "https://en.wikipedia.org/wiki/AArch64",
      title: "ARM64",
      description: "64-bit ARM architecture for Apple Silicon and servers",
    },
  ];

  return (
    <section className="relative bg-transparent py-24 overflow-hidden">
      <div className="container relative z-10 mx-auto px-4">
        {/* OS Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
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
              Cross-Platform Compatibility
            </span>
          </motion.div>

          <DualShadowText
            as="h2"
            className="mb-4 text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight"
            left={{
              text: "One Binary,",
              shadowDirection: isDark ? "left" : "none",
              shadowColor: "var(--primary)",
              textColor: isDark ? "var(--foreground)" : "var(--primary-shade)",
            }}
            right={{
              text: "Every Platform",
              shadowDirection: isDark ? "right" : "none",
              shadowColor: "var(--foreground)",
              textColor: isDark ? "var(--primary)" : "var(--primary-shade)",
            }}
          />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Deploy your protected software seamlessly across all major operating
            systems with native performance and security.
          </p>
        </motion.div>

        {/* OS Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mb-8">
          {operatingSystems.map((os, index) => (
            <motion.div
              key={os.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="flex justify-center"
            >
              <div
                className={`relative group w-full rounded-2xl p-1 transition-all duration-500 ${os.borderGlow} hover:shadow-2xl`}
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)"
                    : "linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.01) 100%)",
                }}
              >
                {/* Animated border gradient on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%)`,
                    backgroundSize: "200% 200%",
                    animation: "borderGlow 3s linear infinite",
                    padding: "1px",
                    WebkitMask:
                      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                  }}
                />

                {/* Card inner content */}
                <div
                  className={`relative rounded-xl overflow-hidden ${
                    isDark ? "bg-card/80" : "bg-card/90"
                  } backdrop-blur-xl`}
                >
                  {/* OS Name badge */}
                  <div className="relative z-10 pt-4 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <os.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {os.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-primary/80">
                      <Zap className="w-3 h-3" />
                      <span>Native</span>
                    </div>
                  </div>

                  {/* TiltedCard wrapper */}
                  <div className="os-card-wrapper relative">
                    <style jsx>{`
                      .os-card-wrapper {
                        position: relative;
                        width: 100%;
                        height: 280px;
                      }
                      .os-card-wrapper::before {
                        content: "";
                        position: absolute;
                        inset: 0;
                        background: linear-gradient(
                          -30deg,
                          hsla(0, 0%, 0%, 0) 60%,
                          rgba(255, 255, 255, 0.35) 70%,
                          hsla(0, 0%, 0%, 0),
                          hsla(0, 0%, 0%, 0) 100%
                        );
                        background-size: 300% 300%;
                        background-repeat: no-repeat;
                        background-position: -100% -100%;
                        transition: 800ms ease;
                        pointer-events: none;
                        z-index: 10;
                        -webkit-mask-image: url(${os.logo});
                        mask-image: url(${os.logo});
                        -webkit-mask-size: 180px 180px;
                        mask-size: 180px 180px;
                        -webkit-mask-position: center;
                        mask-position: center;
                        -webkit-mask-repeat: no-repeat;
                        mask-repeat: no-repeat;
                      }
                      .os-card-wrapper:hover::before {
                        background-position: 100% 100%;
                      }
                      @keyframes borderGlow {
                        0% {
                          background-position: 0% 50%;
                        }
                        50% {
                          background-position: 100% 50%;
                        }
                        100% {
                          background-position: 0% 50%;
                        }
                      }
                    `}</style>
                    <TiltedCard
                      imageSrc={os.logo}
                      altText={`${os.name} logo`}
                      containerHeight="280px"
                      containerWidth="100%"
                      imageHeight="180px"
                      imageWidth="180px"
                      scaleOnHover={1.12}
                      rotateAmplitude={10}
                      showMobileWarning={false}
                      showTooltip={false}
                    />
                  </div>

                  {/* Description footer */}
                  <div className="relative z-10 pb-4 px-4 text-center">
                    <span className="text-sm text-muted-foreground">
                      {os.description}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Decorative divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center gap-4 my-24"
        >
          <div
            className={`h-px flex-1 max-w-xs ${
              isDark
                ? "bg-gradient-to-r from-transparent via-border to-transparent"
                : "bg-gradient-to-r from-transparent via-border to-transparent"
            }`}
          />
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
            <Cpu className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Architecture Support
            </span>
          </div>
          <div
            className={`h-px flex-1 max-w-xs ${
              isDark
                ? "bg-gradient-to-l from-transparent via-border to-transparent"
                : "bg-gradient-to-l from-transparent via-border to-transparent"
            }`}
          />
        </motion.div>

        {/* CPU Architecture Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <DualShadowText
            as="h2"
            className="mb-4 text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight"
            left={{
              text: "Multi-Architecture",
              shadowDirection: isDark ? "left" : "none",
              shadowColor: "var(--primary)",
              textColor: isDark ? "var(--foreground)" : "var(--primary-shade)",
            }}
            right={{
              text: "Ready",
              shadowDirection: isDark ? "right" : "none",
              shadowColor: "var(--foreground)",
              textColor: isDark ? "var(--primary)" : "var(--primary-shade)",
            }}
          />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From legacy x86 to cutting-edge ARM64, your binaries run everywhere
            with full protection intact.
          </p>
        </motion.div>

        {/* Infinite Menu with enhanced container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Subtle glow behind the sphere */}
          <div
            className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
              isDark ? "opacity-40" : "opacity-20"
            }`}
          >
            <div
              className="w-[500px] h-[500px] rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
              }}
            />
          </div>

          <div style={{ height: "600px", position: "relative" }}>
            <InfiniteMenu
              items={cpuArchitectures}
              backgroundColor="transparent"
              titleColor="var(--foreground)"
              descColor="var(--foreground)"
              actionColor="var(--secondary)"
              actionBorderColor="var(--foreground)"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
