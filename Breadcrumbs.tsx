"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0 || pathname === "/") return null;

  const formatSegment = (seg: string) => {
    return seg
      .replace(/-/g, " ")
      .replace(/cand_\w+/g, "Candidate Profile")
      .replace(/off_\w+/g, "Offer Letter")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 py-3 px-4 sm:px-6 bg-slate-50/50 border-b border-slate-200/60">
      <Link href="/dashboard" className="flex items-center gap-1 hover:text-slate-900 transition-colors">
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <span className="sr-only sm:not-sr-only">Home</span>
      </Link>

      {segments.map((seg, idx) => {
        const path = `/${segments.slice(0, idx + 1).join("/")}`;
        const isLast = idx === segments.length - 1;

        return (
          <React.Fragment key={path}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                {formatSegment(seg)}
              </span>
            ) : (
              <Link href={path} className="hover:text-slate-900 transition-colors truncate max-w-[150px]">
                {formatSegment(seg)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
