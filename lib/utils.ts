import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "yyyy-MM-dd")
}

export function formatDateLong(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "MMMM d, yyyy")
}

export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
