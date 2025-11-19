import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format large numbers into human-readable format
 * @param num - The number to format
 * @returns Formatted string (e.g., "1.23M+", "10K+", "1,234+")
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B+`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M+`;
  }
  if (num >= 10_000) {
    return `${(num / 1_000).toFixed(1)}K+`;
  }
  if (num >= 1_000) {
    return `${num.toLocaleString()}+`;
  }
  return `${num}+`;
}
