"use client";

import { motion } from "framer-motion";
import TiltedCard from "@/components/TiltedCard";
import InfiniteMenu from "@/components/InfiniteMenu";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function SupportSection() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = mounted ? (resolvedTheme === 'dark' || theme === 'dark') : true;
  const operatingSystems = [
    {
      name: "Windows",
      logo: "/assets/os/windows.png",
    },
    {
      name: "Linux",
      logo: "/assets/os/linux.png",
    },
    {
      name: "macOS",
      logo: "/assets/os/macos.png",
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

    // Only Arch for Future, Get only arch images, above is some brand examples
    {
      image: "/assets/arch/intel.png",
      link: "https://en.wikipedia.org/wiki/X86",
      title: "x86",
      description: "32-bit architecture support for lagacy systems",
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
    <section className="bg-background py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 
            className={`mb-6 text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight ${isDark ? 'text-shadow-primary-left' : ''}`}
            style={!isDark ? { color: 'var(--primary-shade)' } : undefined}
          >
            Support for All Operating Systems
          </h2>
        </motion.div>

        {/* OS Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {operatingSystems.map((os, index) => (
            <motion.div
              key={os.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex justify-center"
            >
              <div className="os-card-wrapper">
                <style jsx>{`
                  /*
                   * Custom glare hover effect that follows the PNG image shape
                   * 
                   * How it works:
                   * 1. Creates a pseudo-element (::before) positioned over the entire card
                   * 2. Applies a linear gradient that sweeps from -100% to 100% on hover
                   * 3. Uses CSS mask-image with the PNG logo to confine the glare effect
                   * 4. The mask ensures the glare only appears on opaque pixels of the PNG
                   * 5. Transparent areas of the PNG won't show the glare effect
                   * 
                   * This creates a natural glare that respects the actual shape of OS logos
                   * instead of filling the entire rectangular container
                   */
                  .os-card-wrapper {
                    position: relative;
                    width: 100%;
                    height: 300px;
                  }
                  .os-card-wrapper::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                      -30deg,
                      hsla(0, 0%, 0%, 0) 60%,
                      rgba(255, 255, 255, 0.3) 70%,
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
                    -webkit-mask-size: 250px 250px;
                    mask-size: 250px 250px;
                    -webkit-mask-position: center;
                    mask-position: center;
                    -webkit-mask-repeat: no-repeat;
                    mask-repeat: no-repeat;
                  }
                  .os-card-wrapper:hover::before {
                    background-position: 100% 100%;
                  }
                `}</style>
                <TiltedCard
                  imageSrc={os.logo}
                  altText={`${os.name} logo`}
                  containerHeight="300px"
                  containerWidth="100%"
                  imageHeight="250px"
                  imageWidth="250px"
                  scaleOnHover={1.15}
                  rotateAmplitude={12}
                  showMobileWarning={false}
                  showTooltip={false}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CPU Architecture Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-32 text-center"
        >
          <h2 
            className={`mb-16 text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight ${isDark ? 'text-shadow-primary-left' : ''}`}
            style={!isDark ? { color: 'var(--primary-shade)' } : undefined}
          >
            There's More, Support for Multi CPU Arch
          </h2>
        </motion.div>

        {/* Infinite Menu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ height: '600px', position: 'relative' }}
        >
          <InfiniteMenu items={cpuArchitectures} backgroundColor="var(--background)" 
  titleColor="var(--foreground)" descColor="var(--foreground)" actionColor="var(--secondary)" actionBorderColor="var(--foreground)"/>
        </motion.div>
      </div>
    </section>
  );
}
