"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  FileSignature,
  FileText,
  UserCheck,
} from "lucide-react";
import { Candidate, CandidateStatus } from "@/types/candidate";
import { useAuth } from "@/lib/auth/context";
import { db } from "@/lib/storage/db";
import { formatDate, getStatusBadgeClass, getRecommendationBadgeClass } from "@/lib/utils";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { SendEmailModal } from "./SendEmailModal";
import { GenerateOfferModal } from "./GenerateOfferModal";

export const CandidateProfileHeader: React.FC<{
  candidate: Candidate;
  onUpdate: () => void;
}> = ({ candidate, onUpdate }) => {
  const { permissions } = useAuth();
  const { success } = useToast();

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const statusStyle = getStatusBadgeClass(candidate.status);
  const recStyle = getRecommendationBadgeClass(candidate.recommendation);

  const setStatus = (status: CandidateStatus) => {
    db.updateCandidate(candidate.id, { status });
    onUpdate();
    success("Status Changed", `${candidate.full_name} moved to ${status}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {candidate.full_name.charAt(0)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900">{candidate.full_name}</h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                {candidate.status}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${recStyle.bg} ${recStyle.text} ${recStyle.border}`}>
                {candidate.recommendation}
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-700 mt-1">
              {candidate.position} • <span className="text-slate-500 font-normal">{candidate.department}</span>
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {candidate.email}
              </span>
              {candidate.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {candidate.phone}
                </span>
              )}
              {candidate.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {candidate.address}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Applied: {formatDate(candidate.application_date)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {permissions.canSendEmails && (
            <Button variant="outline" size="sm" onClick={() => setIsEmailModalOpen(true)} className="text-xs">
              <Send className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              Send Email
            </Button>
          )}

          {permissions.canGenerateOffers && (
            <Button variant="secondary" size="sm" onClick={() => setIsOfferModalOpen(true)} className="text-xs bg-blue-600 hover:bg-blue-700">
              <FileSignature className="w-3.5 h-3.5 mr-1.5" />
              Generate Offer
            </Button>
          )}

          {permissions.canChangeStatus && (
            <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
              {candidate.status !== "Shortlisted" && (
                <Button variant="outline" size="sm" onClick={() => setStatus("Shortlisted")} className="text-xs text-cyan-700 hover:bg-cyan-50">
                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                  Shortlist
                </Button>
              )}
              {candidate.status !== "Selected" && (
                <Button variant="outline" size="sm" onClick={() => setStatus("Selected")} className="text-xs text-emerald-700 hover:bg-emerald-50">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Select
                </Button>
              )}
              {candidate.status !== "Rejected" && (
                <Button variant="outline" size="sm" onClick={() => setStatus("Rejected")} className="text-xs text-red-700 hover:bg-red-50">
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Reject
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Candidate Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        {/* Experience & Education */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-500">
            Professional Credentials
          </h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Briefcase className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">Experience:</span> {candidate.experience} Years
              </div>
            </div>
            <div className="flex items-start gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">Education:</span> {candidate.education}
              </div>
            </div>
            {candidate.salary_expectation && (
              <div className="text-slate-600">
                <span className="font-semibold text-slate-800">Expected Compensation:</span> {candidate.salary_expectation}
              </div>
            )}
            {candidate.availability && (
              <div className="text-slate-600">
                <span className="font-semibold text-slate-800">Notice / Availability:</span> {candidate.availability}
              </div>
            )}
          </div>
        </div>

        {/* Skills & Certifications */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-500">
            Skills & Competencies
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.map((skill, idx) => (
              <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-800 px-2 py-1 rounded-md text-[11px] font-medium">
                {skill}
              </span>
            ))}
          </div>

          {candidate.certifications && candidate.certifications.length > 0 && (
            <div className="pt-2">
              <span className="font-semibold text-slate-700 block mb-1">Certifications:</span>
              <div className="flex flex-wrap gap-1.5">
                {candidate.certifications.map((c, idx) => (
                  <span key={idx} className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded text-[10px] font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Links & Attachments */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-500">
            Verified Links & Documents
          </h4>
          <div className="space-y-2">
            {candidate.resume_url ? (
              <a
                href={candidate.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors text-slate-800 group"
              >
                <span className="flex items-center gap-2 font-medium">
                  <FileText className="w-4 h-4 text-red-500" /> Official Resume PDF
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </a>
            ) : (
              <p className="text-slate-400 italic">No resume URL linked</p>
            )}

            {candidate.portfolio_url && (
              <a
                href={candidate.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors text-slate-800 group"
              >
                <span className="font-medium truncate max-w-[200px]">{candidate.portfolio_url}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </a>
            )}

            {candidate.linkedin_url && (
              <a
                href={candidate.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors text-slate-800 group"
              >
                <span className="font-medium text-blue-700">LinkedIn Profile</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <SendEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        candidate={candidate}
        onEmailSent={onUpdate}
      />

      <GenerateOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        candidate={candidate}
        onOfferGenerated={onUpdate}
      />
    </div>
  );
};
