import React from "react";
import { CheckCircle2, Circle, Clock, FileSignature, Mail, UserCheck, XCircle } from "lucide-react";
import { Candidate, CandidateStatus } from "@/types/candidate";
import { formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";

export const ApplicationTimeline: React.FC<{ candidate: Candidate }> = ({ candidate }) => {
  const steps: { key: string; label: string; desc: string; icon: any }[] = [
    { key: "New", label: "Application Submitted", desc: `Imported on ${formatDate(candidate.application_date)}`, icon: CheckCircle2 },
    { key: "Under Review", label: "Application Evaluated", desc: "Profile & resume reviewed by talent team", icon: CheckCircle2 },
    { key: "Shortlisted", label: "Candidate Shortlisted", desc: "Candidate passed rubric benchmark", icon: UserCheck },
    { key: "Interview", label: "Interview Round", desc: "Technical / cultural evaluation", icon: Clock },
    { key: "Selected", label: "Selected for Offer", desc: "Hiring committee approved offer issuance", icon: CheckCircle2 },
    { key: "Offer Sent", label: "Offer Delivered", desc: "Official PDF offer letter sent to candidate", icon: FileSignature },
    { key: "Offer Accepted", label: "Offer Response", desc: "Candidate finalized acceptance / decision", icon: CheckCircle2 },
  ];

  const statusOrder: CandidateStatus[] = [
    "New",
    "Under Review",
    "Shortlisted",
    "Interview",
    "Selected",
    "Offer Sent",
    "Offer Accepted",
  ];

  const currentIdx = statusOrder.indexOf(candidate.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recruitment Lifecycle Timeline</CardTitle>
        <CardDescription>Step-by-step progression of this application</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {steps.map((step, idx) => {
            const isCompleted = currentIdx >= idx && candidate.status !== "Rejected" && candidate.status !== "Offer Rejected";
            const isCurrent = candidate.status === step.key;
            const isRejectedAtStep = (candidate.status === "Rejected" || candidate.status === "Offer Rejected") && idx === currentIdx;

            return (
              <div key={idx} className="relative flex items-start gap-4 text-xs">
                {/* Step indicator dot */}
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                    isRejectedAtStep
                      ? "bg-red-500 text-white"
                      : isCompleted
                      ? "bg-blue-600 text-white"
                      : isCurrent
                      ? "bg-blue-500 text-white animate-pulse"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {isRejectedAtStep ? (
                    <XCircle className="w-3 h-3" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <Circle className="w-2.5 h-2.5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className={`font-bold ${isCompleted || isCurrent ? "text-slate-900" : "text-slate-400"}`}>
                    {step.label}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
