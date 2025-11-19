"use client";

import { useRef, ReactNode, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface SmoothCardStackProps {
  children: ReactNode[];
  stackOffset?: number;
  scaleStep?: number;
}

export default function SmoothCardStack({ 
  children, 
  stackOffset = 30,
  scaleStep = 0.05 
}: SmoothCardStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative">
      {children.map((child, index) => (
        <Card
          key={index}
          index={index}
          total={children.length}
          stackOffset={stackOffset}
          scaleStep={scaleStep}
          containerRef={containerRef}
        >
          {child}
        </Card>
      ))}
      {/* Spacer for smooth ending */}
      <div style={{ height: '50vh' }} />
    </div>
  );
}

interface CardProps {
  children: ReactNode;
  index: number;
  total: number;
  stackOffset: number;
  scaleStep: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function Card({ children, index, total, stackOffset, scaleStep, containerRef }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardTop, setCardTop] = useState(0);

  useEffect(() => {
    if (cardRef.current) {
      setCardTop(cardRef.current.offsetTop);
    }
  }, []);

  const { scrollY } = useScroll();

  // Calculate scroll progress for this card
  const scrollYProgress = useTransform(
    scrollY,
    [cardTop - window.innerHeight, cardTop - 100],
    [0, 1]
  );

  // Pin position
  const stickyTop = 80 + (index * stackOffset);
  
  // Scale - cards underneath get smaller
  const targetScale = 1 - ((total - 1 - index) * scaleStep);
  
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    [0.9, 1]
  );

  // TranslateY - starts from below and moves to sticky position
  const y = useTransform(
    scrollY,
    [cardTop - window.innerHeight, cardTop - stickyTop],
    [200, 0]
  );

  return (
    <div
      ref={cardRef}
      style={{
        position: 'relative',
        marginBottom: index < total - 1 ? '200px' : '0',
      }}
    >
      <motion.div
        style={{
          position: 'sticky',
          top: `${stickyTop}px`,
          zIndex: index,
          scale,
          y,
        }}
        className="will-change-transform origin-top"
      >
        <motion.div
          initial={{ scale: targetScale }}
          whileInView={{ scale: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
