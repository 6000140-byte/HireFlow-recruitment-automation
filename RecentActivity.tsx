import React from "react";
import Link from "next/link";
import {
  FileCheck,
  UserPlus,
  Mail,
  FileSignature,
  Sliders,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { AuditLog } from "@/types/database";
import { formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";

export const RecentActivity: React.FC<{ logs: AuditLog[] }> = ({ logs }) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case "STATUS_CHANGED":
        return <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />;
      case "OFFER_GENERATED":
      case "OFFER_SENT":
        return <FileSignature className="w-3.5 h-3.5 text-amber-600" />;
      case "OFFER_ACCEPTED":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case "CANDIDATE_CREATED":
        return <UserPlus className="w-3.5 h-3.5 text-indigo-600" />;
      case "SCORE_OVERRIDDEN":
      case "CANDIDATE_SCORED":
        return <Sliders className="w-3.5 h-3.5 text-purple-600" />;
      case "INTEGRATION_SYNCED":
        return <FileCheck className="w-3.5 h-3.5 text-teal-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const formatActionTitle = (log: AuditLog) => {
    switch (log.action) {
      case "STATUS_CHANGED":
        return `${log.metadata?.candidate || "Candidate"} moved to ${log.metadata?.newStatus}`;
      case "OFFER_GENERATED":
        return `Offer ${log.metadata?.offerNumber || ""} generated for ${log.metadata?.candidate}`;
      case "OFFER_SENT":
        return `Offer delivered to ${log.metadata?.candidate}`;
      case "OFFER_ACCEPTED":
        return `Offer ACCEPTED by ${log.metadata?.candidate}! 🎉`;
      case "CANDIDATE_CREATED":
        return `New application received: ${log.metadata?.name} (${log.metadata?.position})`;
      case "SCORE_OVERRIDDEN":
        return `Score overridden for ${log.metadata?.candidate} (${log.metadata?.newScore}/100)`;
      case "INTEGRATION_SYNCED":
        return `Google Sheet auto-sync completed (+${log.metadata?.recordsImported || 0} imported)`;
      default:
        return `${log.action.replace(/_/g, " ")} (${log.entity_type})`;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Recent Hiring Operations</CardTitle>
          <CardDescription>Live event stream of candidate state changes & offer letters</CardDescription>
        </div>
        <Link
          href="/audit-logs"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View Full Audit Trail <ExternalLink className="w-3 h-3" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {logs.slice(0, 7).map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-100 shrink-0 mt-0.5">{getActionIcon(log.action)}</div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900">{formatActionTitle(log)}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                  <span className="font-medium text-slate-700">{log.user_name}</span>
                  <span>•</span>
                  <span>{formatDateTime(log.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
