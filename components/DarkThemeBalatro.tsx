"use client";

import { useEffect, useState } from 'react';
import Balatro from './Balatro';

interface DarkThemeBalatroProps {
  isRotate?: boolean;
  mouseInteraction?: boolean;
  pixelFilter?: number;
  spinRotation?: number;
  spinSpeed?: number;
  offset?: [number, number];
  contrast?: number;
  lighting?: number;
  spinAmount?: number;
  spinEase?: number;
}

export default function DarkThemeBalatro(props: DarkThemeBalatroProps) {
  const [colors, setColors] = useState({
    primary: 'oklch(0.55 0.22 25)',
    secondary: '#7928ca',
    background: 'oklch(0.09 0 0)'
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const updateColors = () => {
      // Force reading from .dark class by creating a temporary element
      const tempDiv = document.createElement('div');
      tempDiv.className = 'dark';
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);
      
      const styles = getComputedStyle(tempDiv);
      const primary = styles.getPropertyValue('--primary').trim();
      const secondary = styles.getPropertyValue('--secondary').trim();
      const background = styles.getPropertyValue('--background').trim();
      
      document.body.removeChild(tempDiv);
      
      setColors({
        primary: primary || 'oklch(0.55 0.22 25)',
        secondary: secondary || '#7928ca',
        background: background || 'oklch(0.09 0 0)'
      });
    };

    updateColors();

    // Watch for theme changes
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Balatro
      {...props}
      color1={colors.primary}
      color2={colors.secondary}
      color3={colors.background}
    />
  );
}
