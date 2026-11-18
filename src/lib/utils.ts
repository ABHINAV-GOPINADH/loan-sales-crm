import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export const LEAD_STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  NEW: { label: "New", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  CONTACTED: { label: "Contacted", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  INTERESTED: { label: "Interested", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  NOT_INTERESTED: { label: "Not Interested", bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
  DOCS_PENDING: { label: "Docs Pending", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  DOCS_COLLECTED: { label: "Docs Collected", bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  APPLIED: { label: "Applied to Bank", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  APPROVED: { label: "Approved", bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  DISBURSED: { label: "Disbursed", bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  REJECTED: { label: "Rejected", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  CLOSED: { label: "Closed", bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" },
};
