"use client";

import React, { useState } from "react";
import { ShieldCheck, Search, Filter, Clock, CheckCircle2, Sliders, FileSignature, UserPlus } from "lucide-react";
import { AuditLog } from "@/types/database";
import { db } from "@/lib/storage/db";
import { formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";

export const AuditLogViewer: React.FC = () => {
  const [logs] = useState<AuditLog[]>(() => db.getAuditLogs());
  const [search, setSearch] = useState("");

  const filteredLogs = logs.filter((l) => {
    const q = search.toLowerCase();
    return (
      !q ||
      l.action.toLowerCase().includes(q) ||
      l.user_name.toLowerCase().includes(q) ||
      l.entity_type.toLowerCase().includes(q) ||
      (l.metadata && JSON.stringify(l.metadata).toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Audit Trail & Compliance</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable event log of sensitive operations, score overrides, offer issuances, and user permission updates.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit trail by actor, action, or metadata..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Events Log ({filteredLogs.length})</CardTitle>
          <CardDescription>Chronological ledger of recruitment actions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Actor</th>
                  <th className="p-3.5">Action Executed</th>
                  <th className="p-3.5">Target Entity</th>
                  <th className="p-3.5">Metadata Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="p-3.5 text-slate-500 font-sans">{formatDateTime(log.created_at)}</td>
                    <td className="p-3.5 font-sans">
                      <p className="font-bold text-slate-900">{log.user_name}</p>
                      <p className="text-[10px] text-slate-400">{log.user_role}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 uppercase text-slate-700 font-sans">{log.entity_type}</td>
                    <td className="p-3.5 max-w-sm text-slate-600">
                      {log.metadata ? (
                        <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[10px] truncate">
                          {JSON.stringify(log.metadata)}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-sans italic">None</span>
                      )}
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
