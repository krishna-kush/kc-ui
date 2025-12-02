"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
  /**
   * Optional leading element (e.g., back button)
   */
  leading?: ReactNode;
}

/**
 * Reusable page header component for consistent styling across protected pages.
 * 
 * @example
 * ```tsx
 * <PageHeader 
 *   title="Dashboard"
 *   subtitle="System-wide overview of your binary protection system"
 *   actions={<Button>Refresh</Button>}
 * />
 * ```
 */
export function PageHeader({ 
  title, 
  subtitle, 
  actions, 
  className,
  leading 
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex items-start gap-4">
        {leading}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
