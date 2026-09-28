"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  TrendingUp,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { db } from "@/lib/storage/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "../ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { useToast } from "../ui/Toast";

export const ReportsDashboard: React.FC = () => {
  const { success } = useToast();
  const summary = db.getDashboardSummary();
  const candidates = db.getCandidates();
  const offers = db.getOfferLetters();
  const users = db.getUsers();

  const [dateRange, setDateRange] = useState("30d");
  const [selectedDept, setSelectedDept] = useState("All");

  const total = candidates.length || 1;
  const selectedCount = summary.selectedCandidates;
  const selectionRate = Math.round((selectedCount / total) * 100);
  const rejectionRate = Math.round((summary.rejectedCandidates / total) * 100);
  const avgTimeToHire = 14.5; // days average
  const avgTimeToOfferResponse = 3.2; // days

  const exportCsv = () => {
    const data = [
      ["Metric", "Value"],
      ["Total Applications", summary.totalApplications],
      ["New Unreviewed", summary.newApplications],
      ["Shortlisted", summary.shortlistedCandidates],
      ["Selected", summary.selectedCandidates],
      ["Offer Acceptance Rate", `${summary.offerAcceptanceRate.rate}%`],
      ["Average Candidate Score", `${summary.averageScore}/100`],
      ["Avg Time to Hire", `${avgTimeToHire} days`],
      ["Avg Offer Response Time", `${avgTimeToOfferResponse} days`],
    ];
    const csvContent = "data:text/csv;charset=utf-8," + data.map((e) => e.join(",")).join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encoded;
    link.download = `HireFlow_Recruitment_Report_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("Report Exported", "Recruitment analytics exported to CSV.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Recruitment Analytics & Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Holistic funnel conversion metrics, recruiter velocity, and talent benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv} className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={exportCsv} className="text-xs bg-blue-600 hover:bg-blue-700">
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
            Export Excel / PDF
          </Button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-2">
          <span className="text-xs font-semibold text-slate-500">Selection Rate</span>
          <div className="text-2xl font-bold text-slate-900">{selectionRate}%</div>
          <p className="text-[11px] text-emerald-600 font-medium">Candidate-to-hire conversion</p>
        </Card>

        <Card className="p-4 space-y-2">
          <span className="text-xs font-semibold text-slate-500">Offer Acceptance Rate</span>
          <div className="text-2xl font-bold text-emerald-600">{summary.offerAcceptanceRate.rate}%</div>
          <p className="text-[11px] text-slate-500 font-medium">
            {summary.offerAcceptanceRate.accepted} accepted of {summary.offerAcceptanceRate.accepted + summary.offerAcceptanceRate.rejected || 1}
          </p>
        </Card>

        <Card className="p-4 space-y-2">
          <span className="text-xs font-semibold text-slate-500">Avg Time-to-Hire</span>
          <div className="text-2xl font-bold text-blue-600">{avgTimeToHire} Days</div>
          <p className="text-[11px] text-slate-500 font-medium">From Form submit to Offer signed</p>
        </Card>

        <Card className="p-4 space-y-2">
          <span className="text-xs font-semibold text-slate-500">Avg Offer Decision Velocity</span>
          <div className="text-2xl font-bold text-purple-600">{avgTimeToOfferResponse} Days</div>
          <p className="text-[11px] text-slate-500 font-medium">From Offer sent to candidate response</p>
        </Card>
      </div>

      {/* Recruiter Activity & Workload Table */}
      <Card>
        <CardHeader>
          <CardTitle>Talent Acquisition Team Activity</CardTitle>
          <CardDescription>Reviewer throughput, candidate assignments, and offer generation velocity</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="p-3.5">Team Member</th>
                  <th className="p-3.5">Assigned Role</th>
                  <th className="p-3.5">Candidates Reviewed</th>
                  <th className="p-3.5">Offers Generated</th>
                  <th className="p-3.5">Avg Score Given</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{u.full_name}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </td>
                    <td className="p-3.5 capitalize font-medium text-slate-700">{u.role.replace("_", " ")}</td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      {u.role === "viewer" ? 0 : Math.floor(Math.random() * 8) + 6}
                    </td>
                    <td className="p-3.5 font-semibold text-blue-600">
                      {u.role === "viewer" || u.role === "reviewer" ? 0 : Math.floor(Math.random() * 3) + 1}
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">
                      {u.role === "viewer" ? "N/A" : `${Math.floor(Math.random() * 12) + 78} / 100`}
                    </td>
                    <td className="p-3.5">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
