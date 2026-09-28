import React from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  TrendingUp,
} from "lucide-react";
import { DashboardSummary } from "@/types/database";

export const StatCards: React.FC<{ summary: DashboardSummary }> = ({ summary }) => {
  const cards = [
    {
      title: "Total Applications",
      value: summary.totalApplications,
      icon: Users,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      change: "+18% from last cycle",
    },
    {
      title: "New Unreviewed",
      value: summary.newApplications,
      icon: UserPlus,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      change: "Requires triage",
    },
    {
      title: "Shortlisted Candidates",
      value: summary.shortlistedCandidates,
      icon: UserCheck,
      color: "text-cyan-600 bg-cyan-50 border-cyan-100",
      change: "In interview loop",
    },
    {
      title: "Selected for Offer",
      value: summary.selectedCandidates,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      change: "Ready for generation",
    },
    {
      title: "Pending Offers",
      value: summary.pendingOffers,
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      change: "Awaiting signature",
    },
    {
      title: "Accepted Offers",
      value: summary.acceptedOffers,
      icon: Award,
      color: "text-green-600 bg-green-50 border-green-100",
      change: `${summary.offerAcceptanceRate.rate}% acceptance rate`,
    },
    {
      title: "Rejected / Withdrawn",
      value: summary.rejectedCandidates,
      icon: XCircle,
      color: "text-red-600 bg-red-50 border-red-100",
      change: "Archived records",
    },
    {
      title: "Avg Candidate Score",
      value: `${summary.averageScore} / 100`,
      icon: TrendingUp,
      color: "text-purple-600 bg-purple-50 border-purple-100",
      change: "Overall talent benchmark",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-500">{card.title}</span>
              <div className={`p-2 rounded-lg border ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900 tracking-tight">{card.value}</div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">{card.change}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
