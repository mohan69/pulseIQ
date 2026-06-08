import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return "—"
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(0)}Cr`
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(0)}L`
  }
  return `₹${amount.toLocaleString("en-IN")}`
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch {
    return "—"
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}
