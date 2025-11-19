import { FC, CSSProperties, useEffect, useState } from 'react';
import './GlitchText.css';

interface GlitchTextProps {
  children: string;
  speed?: number;
  enableShadows?: boolean;
  enableOnHover?: boolean;
  glitchTimeout?: number; // Time in seconds to stop glitch effect (0 or undefined = infinite)
  loop?: number; // Time in seconds to restart glitch after timeout (0 = no loop)
  firstGlitchColor?: string; // Color for the first glitch (default: red)
  secondGlitchColor?: string; // Color for the second glitch (default: cyan)
  keepFirstGlitch?: boolean; // Keep first glitch after timeout
  keepSecondGlitch?: boolean; // Keep second glitch after timeout
  size?: string | number; // Font size (e.g., '2rem', '24px', 24)
  minSize?: string | number; // Minimum font size (e.g., '1.5rem', '24px', 24)
  glitchIntensity?: number; // Percentage for glitch offset (default: 5)
  textColor?: string; // Hardcoded text color (e.g., 'white', '#fff', 'rgb(255,255,255)'). If not set, inherits from parent
  className?: string;
}

interface CustomCSSProperties extends CSSProperties {
  '--after-duration': string;
  '--before-duration': string;
  '--after-shadow': string;
  '--before-shadow': string;
  '--stopped-shadow'?: string;
  '--left-offset': string;
  '--text-color'?: string;
  '--min-font-size'?: string;
}

const GlitchText: FC<GlitchTextProps> = ({
  children,
  speed = 0.5,
  enableShadows = true,
  enableOnHover = false,
  glitchTimeout = 0,
  loop = 0,
  firstGlitchColor = 'red',
  secondGlitchColor = 'cyan',
  keepFirstGlitch = false,
  keepSecondGlitch = false,
  size,
  minSize,
  glitchIntensity = 5,
  textColor,
  className = ''
}) => {
  const [isGlitching, setIsGlitching] = useState(true);
  const [resolvedFirstColor, setResolvedFirstColor] = useState(firstGlitchColor);
  const [resolvedSecondColor, setResolvedSecondColor] = useState(secondGlitchColor);

  // Resolve CSS variables to actual colors
  useEffect(() => {
    const resolveCSSVariable = (color: string): string => {
      if (color.startsWith('var(')) {
        const varName = color.match(/var\(([^)]+)\)/)?.[1];
        if (varName) {
          const computedValue = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
          // If it's an oklch value, we need to convert it
          if (computedValue.startsWith('oklch(')) {
            // For oklch colors, we'll use the CSS variable directly in the shadow
            return `oklch(${computedValue.slice(6, -1)})`;
          }
          return computedValue || color;
        }
      }
      return color;
    };

    setResolvedFirstColor(resolveCSSVariable(firstGlitchColor));
    setResolvedSecondColor(resolveCSSVariable(secondGlitchColor));
  }, [firstGlitchColor, secondGlitchColor]);

  useEffect(() => {
    if (glitchTimeout > 0) {
      const stopTimer = setTimeout(() => {
        setIsGlitching(false);
      }, glitchTimeout * 1000);

      // Set up loop if specified
      let loopInterval: NodeJS.Timeout | undefined;
      if (loop > 0) {
        loopInterval = setInterval(() => {
          setIsGlitching(true);
          setTimeout(() => {
            setIsGlitching(false);
          }, glitchTimeout * 1000);
        }, loop * 1000);
      }

      return () => {
        clearTimeout(stopTimer);
        if (loopInterval) clearInterval(loopInterval);
      };
    }
  }, [glitchTimeout, loop]);

  // Calculate responsive shadow offset based on font size
  const getFontSizeValue = (): number => {
    if (size) {
      if (typeof size === 'number') return size;
      const match = String(size).match(/([\d.]+)/);
      if (match) {
        const value = parseFloat(match[1]);
        if (String(size).includes('rem')) return value * 16;
        return value;
      }
    }
    return 64; // default fallback
  };

  const fontSize = getFontSizeValue();
  const intensityDecimal = glitchIntensity / 100; // Convert percentage to decimal
  const shadowOffset = Math.max(2, Math.round(fontSize * intensityDecimal * 0.6)); // 60% of intensity for shadows

  // Build stopped shadow based on what to keep
  let stoppedShadow = 'none';
  if (!isGlitching) {
    const shadows = [];
    if (keepFirstGlitch) shadows.push(`-${shadowOffset}px 0 ${resolvedFirstColor}`);
    if (keepSecondGlitch) shadows.push(`${shadowOffset}px 0 ${resolvedSecondColor}`);
    stoppedShadow = shadows.length > 0 ? shadows.join(', ') : 'none';
  }

  const glitchShadowOffset = Math.max(2, Math.round(fontSize * intensityDecimal)); // Use intensity for glitch effect
  const leftOffset = Math.max(2, Math.round(fontSize * intensityDecimal)); // Use intensity for offset

  const inlineStyles: CustomCSSProperties = {
    '--after-duration': `${speed * 3}s`,
    '--before-duration': `${speed * 2}s`,
    '--after-shadow': enableShadows ? `-${glitchShadowOffset}px 0 ${resolvedFirstColor}` : 'none',
    '--before-shadow': enableShadows ? `${glitchShadowOffset}px 0 ${resolvedSecondColor}` : 'none',
    '--stopped-shadow': stoppedShadow,
    '--left-offset': `${leftOffset}px`,
    ...(textColor && { '--text-color': textColor }),
    ...(minSize && { '--min-font-size': typeof minSize === 'number' ? `${minSize}px` : minSize }),
    ...(size && { fontSize: typeof size === 'number' ? `${size}px` : size })
  };

  const hoverClass = enableOnHover ? 'enable-on-hover' : '';
  const glitchClass = !isGlitching ? 'glitch-stopped' : '';

  return (
    <div className={`glitch ${hoverClass} ${glitchClass} ${className}`} style={inlineStyles} data-text={children}>
      {children}
    </div>
  );
};

export default GlitchText;
