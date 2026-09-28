"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2, Eye, MousePointerClick, AlertCircle, Clock } from "lucide-react";
import { EmailLog, EmailDeliveryStatus } from "@/types/email";
import { db } from "@/lib/storage/db";
import { formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";

export const EmailLogsList: React.FC = () => {
  const [logs] = useState<EmailLog[]>(() => db.getEmailLogs());

  const getStatusBadge = (status: EmailDeliveryStatus) => {
    switch (status) {
      case "Opened":
        return <Badge variant="purple" size="sm"><Eye className="w-3 h-3 mr-1" /> Opened</Badge>;
      case "Clicked":
        return <Badge variant="secondary" size="sm"><MousePointerClick className="w-3 h-3 mr-1" /> Clicked</Badge>;
      case "Delivered":
        return <Badge variant="success" size="sm"><CheckCircle2 className="w-3 h-3 mr-1" /> Delivered</Badge>;
      case "Failed":
      case "Bounced":
        return <Badge variant="danger" size="sm"><AlertCircle className="w-3 h-3 mr-1" /> {status}</Badge>;
      default:
        return <Badge variant="default" size="sm"><Clock className="w-3 h-3 mr-1" /> Sent</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Delivery & Open Tracking Logs</CardTitle>
        <CardDescription>Live real-time delivery confirmations and interaction telemetry</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="p-3.5">Candidate / Recipient</th>
                <th className="p-3.5">Template / Subject</th>
                <th className="p-3.5">Delivery Status</th>
                <th className="p-3.5">Dispatched At</th>
                <th className="p-3.5">Provider ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900">{log.candidate_name || "Applicant"}</p>
                    <p className="text-[11px] text-slate-400">{log.recipient_email}</p>
                  </td>
                  <td className="p-3.5 max-w-xs">
                    <p className="font-medium text-slate-800 truncate">{log.subject}</p>
                    <p className="text-[11px] text-slate-400 truncate">{log.template_name}</p>
                  </td>
                  <td className="p-3.5">{getStatusBadge(log.status)}</td>
                  <td className="p-3.5 text-slate-500">{formatDateTime(log.sent_at)}</td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-400">
                    {log.provider_message_id || "mock_id"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
