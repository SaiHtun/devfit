import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(text: string): string {
  if (!text || text.trim().length === 0) {
    return "UNK";
  }

  return text
    .trim()
    .split(/[\s-]+/)
    .filter((word) => word.length > 0)
    .map((word) => word[0].toUpperCase())
    .join("")
    .substring(0, 4);
}
