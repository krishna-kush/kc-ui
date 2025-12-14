"use client";

import { CSSProperties, ReactNode } from "react";

export type ShadowDirection = "left" | "right" | "none";

export interface ShadowTextProps {
  children: ReactNode;
  /** Direction of the text shadow */
  shadowDirection?: ShadowDirection;
  /** CSS color value for the shadow (e.g., "var(--primary)", "#ff0000") */
  shadowColor?: string;
  /** CSS color value for the text (e.g., "var(--foreground)", "#ffffff") */
  textColor?: string;
  /** Shadow offset in em units (default: 0.07) */
  shadowOffset?: number;
  /** Additional CSS classes */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
  /** HTML tag to render (default: span) */
  as?: "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div";
}

export default function ShadowText({
  children,
  shadowDirection = "none",
  shadowColor = "var(--primary)",
  textColor = "var(--foreground)",
  shadowOffset = 0.07,
  className = "",
  style = {},
  as: Component = "span",
}: ShadowTextProps) {
  const getShadowStyle = (): CSSProperties => {
    if (shadowDirection === "none") {
      return {
        color: textColor,
        ...style,
      };
    }

    const offsetValue =
      shadowDirection === "left" ? -shadowOffset : shadowOffset;

    return {
      color: textColor,
      textShadow: `${offsetValue}em 0 ${shadowColor}`,
      ...style,
    };
  };

  return (
    <Component className={className} style={getShadowStyle()}>
      {children}
    </Component>
  );
}
