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

export function formatCount(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function formatExecutiveCurrency(
  value: number | null | undefined,
  options?: { suffix?: string },
): string {
  if (value == null || Number.isNaN(value)) return "—"
  const abs = Math.abs(value)
  const sign = value < 0 ? "-" : ""
  const suffix = options?.suffix ?? ""
  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(1).replace(/\.0$/, "")}Cr${suffix}`
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(1).replace(/\.0$/, "")}L${suffix}`
  }
  return `${sign}₹${abs.toLocaleString("en-IN")}${suffix}`
}

const riskMetricKeys = new Set(["cash", "receivables"])

export function isRiskMetric(key: string): boolean {
  return riskMetricKeys.has(key)
}

export function getGapLabel(key: string): string {
  return isRiskMetric(key) ? "Risk gap" : "Variance"
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}
