"use client";

import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DashboardSummary } from "@/types/database";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";

export const AnalyticsCharts: React.FC<{ summary: DashboardSummary }> = ({ summary }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />;
  }

  const PIE_COLORS = ["#3B82F6", "#8B5CF6", "#06B6D4", "#6366F1", "#10B981", "#F59E0B", "#22C55E", "#EF4444", "#EAB308"];

  return (
    <div className="space-y-6">
      {/* Row 1: Trend & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Applications Inflow Over Time</CardTitle>
            <CardDescription>Daily candidate submissions imported from Google Forms</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.applicationsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tickLine={false} axisLine={{ stroke: "#E2E8F0" }} tick={{ fill: "#64748B", fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "8px", border: "none", color: "#FFF", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="count" name="Applications" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Candidate Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Stage Distribution</CardTitle>
            <CardDescription>Active candidate volume per status</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="status"
                >
                  {summary.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "8px", border: "none", color: "#FFF", fontSize: "12px" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Score Distribution & Department Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Candidate Score Distribution</CardTitle>
            <CardDescription>Auto-evaluated scoring bracket counts (0 - 100)</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.scoreDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="range" tickLine={false} axisLine={{ stroke: "#E2E8F0" }} tick={{ fill: "#64748B", fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "8px", border: "none", color: "#FFF", fontSize: "12px" }}
                />
                <Bar dataKey="count" name="Candidates" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Applications by Department */}
        <Card>
          <CardHeader>
            <CardTitle>Applications by Department</CardTitle>
            <CardDescription>Applicant demand breakdown</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={summary.applicationsByDepartment}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" tickLine={false} axisLine={{ stroke: "#E2E8F0" }} tick={{ fill: "#64748B", fontSize: 11 }} />
                <YAxis type="category" dataKey="department" tickLine={false} axisLine={false} tick={{ fill: "#475569", fontSize: 11 }} width={85} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "8px", border: "none", color: "#FFF", fontSize: "12px" }}
                />
                <Bar dataKey="count" name="Applicants" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Offer Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Offer Acceptance Health</CardTitle>
            <CardDescription>Acceptance versus rejection ratio</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex flex-col justify-center items-center">
            <div className="text-center mb-4">
              <span className="text-4xl font-extrabold text-emerald-600 tracking-tight">
                {summary.offerAcceptanceRate.rate}%
              </span>
              <p className="text-xs text-slate-500 font-medium mt-1">Overall Offer Acceptance Rate</p>
            </div>

            <div className="w-full space-y-2 max-w-xs">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-emerald-700">Accepted ({summary.offerAcceptanceRate.accepted})</span>
                <span className="text-amber-700">Pending ({summary.offerAcceptanceRate.pending})</span>
                <span className="text-red-700">Declined ({summary.offerAcceptanceRate.rejected})</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{
                    width: `${
                      (summary.offerAcceptanceRate.accepted /
                        (summary.offerAcceptanceRate.accepted + summary.offerAcceptanceRate.pending + summary.offerAcceptanceRate.rejected || 1)) *
                      100
                    }%`,
                  }}
                />
                <div
                  className="bg-amber-400 h-full"
                  style={{
                    width: `${
                      (summary.offerAcceptanceRate.pending /
                        (summary.offerAcceptanceRate.accepted + summary.offerAcceptanceRate.pending + summary.offerAcceptanceRate.rejected || 1)) *
                      100
                    }%`,
                  }}
                />
                <div
                  className="bg-red-500 h-full"
                  style={{
                    width: `${
                      (summary.offerAcceptanceRate.rejected /
                        (summary.offerAcceptanceRate.accepted + summary.offerAcceptanceRate.pending + summary.offerAcceptanceRate.rejected || 1)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
