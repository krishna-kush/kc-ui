import React from 'react';
import { LucideProps } from 'lucide-react';

/**
 * Wrapper component for Lucide icons that adds suppressHydrationWarning
 * to prevent hydration errors caused by browser extensions (e.g., Dark Reader)
 * modifying SVG attributes like data-darkreader-inline-stroke
 */
export const Icon = React.forwardRef<
  SVGSVGElement,
  React.PropsWithChildren<LucideProps> & { as: React.ComponentType<LucideProps> }
>(({ as: Component, ...props }, ref) => {
  return <Component ref={ref} {...props} suppressHydrationWarning />;
});

Icon.displayName = 'Icon';
