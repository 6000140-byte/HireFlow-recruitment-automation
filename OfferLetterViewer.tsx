"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileDown,
  Send,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Calendar,
  DollarSign,
  UserCheck,
} from "lucide-react";
import { OfferLetter } from "@/types/offer";
import { Candidate } from "@/types/candidate";
import { useAuth } from "@/lib/auth/context";
import { db } from "@/lib/storage/db";
import { formatDate, getOfferStatusBadgeClass } from "@/lib/utils";
import { downloadOfferPdf } from "@/lib/pdf/offer-generator";
import { Button } from "../ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { useToast } from "../ui/Toast";

export const OfferLetterViewer: React.FC<{
  offer: OfferLetter;
  onUpdate: () => void;
}> = ({ offer, onUpdate }) => {
  const { permissions } = useAuth();
  const { success, error } = useToast();
  const [isSending, setIsSending] = useState(false);

  const candidate = db.getCandidateById(offer.candidate_id);
  const statusStyle = getOfferStatusBadgeClass(offer.status);

  const handleDownload = () => {
    downloadOfferPdf({ offer, candidate });
    success("PDF Downloaded", `Official offer PDF saved.`);
  };

  const handleSendOffer = () => {
    setIsSending(true);
    try {
      db.sendOfferLetter(offer.id);
      success("Offer Letter Sent", `Email dispatched with portal link to ${offer.candidate_email}`);
      onUpdate();
    } catch (err: any) {
      error("Error sending offer", err.message);
    } finally {
      setIsSending(false);
    }
  };

  const candidatePortalUrl = `/offer/${offer.id}`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900">{offer.job_title}</h1>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
              {offer.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Offer Ref: <span className="font-mono font-semibold text-slate-800">{offer.offer_number}</span> • Issued for{" "}
            <strong className="text-slate-900">{offer.candidate_name}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload} className="text-xs">
            <FileDown className="w-3.5 h-3.5 mr-1.5" />
            Download PDF
          </Button>

          {permissions.canSendEmails && offer.status !== "Accepted" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSendOffer}
              isLoading={isSending}
              className="text-xs bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {offer.status === "Sent" ? "Resend Offer Email" : "Send Offer Letter"}
            </Button>
          )}

          <Link href={candidatePortalUrl} target="_blank">
            <Button variant="outline" size="sm" className="text-xs">
              <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              Preview Candidate Portal
            </Button>
          </Link>
        </div>
      </div>

      {/* Offer Letter Document Preview Canvas */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-md p-8 max-w-4xl mx-auto font-sans space-y-6 text-slate-800">
        {/* Letterhead */}
        <div className="bg-slate-900 text-white p-6 rounded-xl flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight">HIREFLOW TECHNOLOGIES INC.</h2>
            <p className="text-xs text-slate-400 mt-0.5">100 Innovation Way, Suite 400, San Francisco, CA 94105</p>
          </div>
          <div className="text-right text-xs text-slate-300">
            <p>Official Offer Document</p>
            <p className="font-mono text-blue-400 font-bold">{offer.offer_number}</p>
          </div>
        </div>

        {/* Date & Recipient */}
        <div className="flex justify-between items-start text-xs text-slate-600 border-b border-slate-100 pb-4">
          <div>
            <p className="font-bold text-slate-900 text-sm">{offer.candidate_name}</p>
            <p>{offer.candidate_email}</p>
            <p>{candidate?.address || "United States"}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-slate-700">Date: {formatDate(offer.created_at)}</p>
            <p className="text-red-600 font-semibold mt-0.5">Valid Until: {formatDate(offer.expiry_date)}</p>
          </div>
        </div>

        {/* Salutation & Intro */}
        <div className="space-y-3 text-xs leading-relaxed">
          <p className="font-bold text-slate-900 text-sm">Dear {offer.candidate_name},</p>
          <p>
            On behalf of <strong>HireFlow Technologies Inc.</strong>, we are thrilled to formally extend this offer of employment for the position of <strong>{offer.job_title}</strong> in the <strong>{offer.department}</strong> department.
          </p>
        </div>

        {/* Key Terms Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 font-semibold">Position:</span>
            <p className="font-bold text-slate-900">{offer.job_title}</p>
          </div>
          <div>
            <span className="text-slate-500 font-semibold">Department:</span>
            <p className="font-bold text-slate-900">{offer.department}</p>
          </div>
          <div>
            <span className="text-slate-500 font-semibold">Compensation / Salary:</span>
            <p className="font-bold text-blue-600 text-sm">{offer.salary}</p>
          </div>
          <div>
            <span className="text-slate-500 font-semibold">Employment Type:</span>
            <p className="font-bold text-slate-900">{offer.employment_type || "Full-time Permanent"}</p>
          </div>
          <div>
            <span className="text-slate-500 font-semibold">Projected Start Date:</span>
            <p className="font-bold text-slate-900">{formatDate(offer.joining_date)}</p>
          </div>
          <div>
            <span className="text-slate-500 font-semibold">Work Location:</span>
            <p className="font-bold text-slate-900">{offer.work_location || "Remote"}</p>
          </div>
          <div>
            <span className="text-slate-500 font-semibold">Reporting Manager:</span>
            <p className="font-bold text-slate-900">{offer.reporting_manager}</p>
          </div>
          <div>
            <span className="text-slate-500 font-semibold">Offer Expiration:</span>
            <p className="font-bold text-red-600">{formatDate(offer.expiry_date)}</p>
          </div>
          <div className="md:col-span-2">
            <span className="text-slate-500 font-semibold">Benefits & Equity:</span>
            <p className="text-slate-800 mt-0.5">{offer.benefits}</p>
          </div>
        </div>

        {/* Terms */}
        <div className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-4 space-y-2">
          <p className="font-bold text-slate-800">Terms of Employment:</p>
          <p>
            Employment with HireFlow Technologies Inc. is at-will. This offer is contingent on the successful completion of background checks and verification of professional credentials. To confirm your acceptance, please sign digitally using your verified portal link prior to {formatDate(offer.expiry_date)}.
          </p>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200">
          <div>
            <p className="text-xs font-bold text-slate-900">For HireFlow Technologies Inc.:</p>
            <div className="h-12 flex items-end">
              <span className="font-serif italic text-base text-slate-800 font-bold border-b border-slate-300 pb-1 w-full block">
                {offer.signatory_name}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{offer.signatory_designation}</p>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-900">Candidate Acceptance:</p>
            <div className="h-12 flex items-end">
              {offer.status === "Accepted" ? (
                <span className="font-mono text-sm text-emerald-700 font-bold border-b border-emerald-300 pb-1 w-full block">
                  Digitally Signed: {offer.candidate_signature_name || offer.candidate_name}
                </span>
              ) : (
                <span className="text-xs text-slate-400 italic border-b border-slate-300 pb-1 w-full block">
                  Awaiting electronic signature...
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {offer.status === "Accepted"
                ? `Accepted on ${formatDate(offer.responded_at)}`
                : `Must be signed by ${formatDate(offer.expiry_date)}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
