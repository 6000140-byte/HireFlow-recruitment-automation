import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CandidateStatus, RecommendationType } from "@/types/candidate";
import { OfferStatus } from "@/types/offer";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, currency = "USD"): string {
  if (typeof amount === "string" && (amount.includes("$") || amount.includes("₹") || amount.includes("€"))) {
    return amount;
  }
  const numeric = typeof amount === "string" ? parseFloat(amount.replace(/[^0-9.-]+/g, "")) : amount;
  if (isNaN(numeric)) return String(amount);
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function generateId(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}

export function getStatusBadgeClass(status: CandidateStatus): { bg: string; text: string; border: string } {
  switch (status) {
    case "New":
      return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" };
    case "Under Review":
      return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" };
    case "Shortlisted":
      return { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" };
    case "Interview":
      return { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" };
    case "Selected":
      return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
    case "Offer Sent":
      return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
    case "Offer Accepted":
      return { bg: "bg-green-50", text: "text-green-700", border: "border-green-300" };
    case "Offer Rejected":
      return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" };
    case "Rejected":
      return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
    case "On Hold":
      return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" };
    case "Withdrawn":
      return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" };
    default:
      return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" };
  }
}

export function getRecommendationBadgeClass(rec: RecommendationType): { bg: string; text: string; border: string } {
  switch (rec) {
    case "Strongly Recommended":
      return { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300" };
    case "Recommended":
      return { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" };
    case "Review Required":
      return { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300" };
    case "Not Recommended":
      return { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" };
    default:
      return { bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-300" };
  }
}

export function getOfferStatusBadgeClass(status: OfferStatus): { bg: string; text: string; border: string } {
  switch (status) {
    case "Draft":
      return { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300" };
    case "Generated":
      return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" };
    case "Sent":
      return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
    case "Viewed":
      return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" };
    case "Accepted":
      return { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" };
    case "Rejected":
      return { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" };
    case "Expired":
      return { bg: "bg-zinc-100", text: "text-zinc-700", border: "border-zinc-300" };
    case "Cancelled":
      return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" };
    default:
      return { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300" };
  }
}
