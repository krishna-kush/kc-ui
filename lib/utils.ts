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

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
