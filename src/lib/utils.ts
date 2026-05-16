import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes with shadcn/ui compatibility.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
