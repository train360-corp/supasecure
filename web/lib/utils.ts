import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sleep for a desired duration
 * @param ms {number} the number of milliseconds to sleep for
 */
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));