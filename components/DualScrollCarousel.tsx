"use client";

import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
}

interface DualScrollCarouselProps {
  topFeatures: FeatureItem[];
  bottomFeatures: FeatureItem[];
  scrollMultiplier?: number; // How much scroll height relative to content width
}

export default function DualScrollCarousel({ 
  topFeatures, 
  bottomFeatures,
  scrollMultiplier = 3 
}: DualScrollCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const topRowRef = useRef<HTMLDivElement>(null);
  const bottomRowRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const container = containerRef.current;
      const topRow = topRowRef.current;
      const bottomRow = bottomRowRef.current;

      if (!container || !topRow || !bottomRow) return;

      const topRowWidth = topRow.scrollWidth;
      const bottomRowWidth = bottomRow.scrollWidth;
      const containerWidth = container.offsetWidth;

      // Calculate scroll distances
      const topScroll = topRowWidth - containerWidth;
      const bottomScroll = bottomRowWidth - containerWidth;

      // Calculate dynamic scroll height based on content width
      // Add extra padding to ensure all cards are fully visible
      const maxScroll = Math.max(topScroll, bottomScroll);
      const dynamicScrollHeight = maxScroll * scrollMultiplier + 500;

      // Set initial position for bottom row (start from right)
      gsap.set(bottomRow, { x: -bottomScroll });

      // Create timeline for both rows
      gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: `+=${dynamicScrollHeight}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          markers: false, // Set to true to debug
        }
      })
      .to(topRow, {
        x: -topScroll,
        ease: 'none'
      }, 0)
      .to(bottomRow, {
        x: 0, // Move to left (opposite of top)
        ease: 'none'
      }, 0);

    }, containerRef);

    return () => ctx.revert();
  }, [scrollMultiplier, topFeatures.length, bottomFeatures.length]);

  const renderCards = (features: FeatureItem[]) => 
    features.map((feature, index) => (
      <div
        key={index}
        className="flex-shrink-0 w-[85vw] sm:w-[70vw] h-[300px] sm:h-[400px]"
      >
        <div className="relative h-full rounded-3xl overflow-hidden group">
          <img 
            src={feature.image}
            alt={feature.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-red-500/20 backdrop-blur-sm">
                <feature.icon className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold">{feature.title}</h3>
            </div>
            <p className="text-sm text-white/80">{feature.description}</p>
          </div>
        </div>
      </div>
    ));

  return (
    <div 
      ref={containerRef}
      className="relative w-full py-12 space-y-6 overflow-hidden"
    >
      {/* Top Row - Scrolls Left */}
      <div 
        ref={topRowRef}
        className="flex gap-6 px-6"
      >
        {renderCards(topFeatures)}
      </div>

      {/* Bottom Row - Scrolls Right */}
      <div 
        ref={bottomRowRef}
        className="flex gap-6 px-6"
      >
        {renderCards(bottomFeatures)}
      </div>
    </div>
  );
}
