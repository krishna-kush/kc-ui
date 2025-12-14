"use client";

import { CSSProperties, ReactNode } from "react";
import ShadowText, { ShadowDirection } from "./ShadowText";

export interface TextSegment {
  /** The text content for this segment */
  text: ReactNode;
  /** Direction of the text shadow for this segment */
  shadowDirection?: ShadowDirection;
  /** CSS color value for the shadow */
  shadowColor?: string;
  /** CSS color value for the text */
  textColor?: string;
  /** Shadow offset in em units */
  shadowOffset?: number;
  /** Additional CSS classes for this segment */
  className?: string;
}

export interface DualShadowTextProps {
  /** Left segment configuration */
  left: TextSegment;
  /** Right segment configuration */
  right: TextSegment;
  /** Text or element between segments (default: single space) */
  separator?: ReactNode;
  /** Additional CSS classes for the container */
  className?: string;
  /** Additional inline styles for the container */
  style?: CSSProperties;
  /** HTML tag to render as container (default: h2) */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div" | "span";
}

export default function DualShadowText({
  left,
  right,
  separator = " ",
  className = "",
  style = {},
  as: Component = "h2",
}: DualShadowTextProps) {
  return (
    <Component className={className} style={style}>
      <ShadowText
        shadowDirection={left.shadowDirection ?? "left"}
        shadowColor={left.shadowColor ?? "var(--primary)"}
        textColor={left.textColor ?? "var(--foreground)"}
        shadowOffset={left.shadowOffset}
        className={left.className}
      >
        {left.text}
      </ShadowText>
      {separator}
      <ShadowText
        shadowDirection={right.shadowDirection ?? "right"}
        shadowColor={right.shadowColor ?? "var(--secondary)"}
        textColor={right.textColor ?? "var(--foreground)"}
        shadowOffset={right.shadowOffset}
        className={right.className}
      >
        {right.text}
      </ShadowText>
    </Component>
  );
}
