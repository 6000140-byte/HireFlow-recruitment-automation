"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  FileDown,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  DollarSign,
  ShieldCheck,
  Sparkles,
  Lock,
} from "lucide-react";
import { OfferLetter } from "@/types/offer";
import { Candidate } from "@/types/candidate";
import { db } from "@/lib/storage/db";
import { formatDate } from "@/lib/utils";
import { downloadOfferPdf } from "@/lib/pdf/offer-generator";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Modal } from "../ui/Modal";
import { useToast } from "../ui/Toast";

export const CandidateOfferPortal: React.FC<{
  initialOffer: OfferLetter;
  initialCandidate?: Candidate;
}> = ({ initialOffer, initialCandidate }) => {
  const { success, error } = useToast();
  const [offer, setOffer] = useState<OfferLetter>(initialOffer);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [signatureName, setSignatureName] = useState(offer.candidate_name || "");
  const [acceptComment, setAcceptComment] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownloadPdf = () => {
    downloadOfferPdf({ offer, candidate: initialCandidate });
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // Ignore if confetti not loaded
    }
  };

  const handleConfirmAccept = () => {
    if (!signatureName.trim()) {
      error("Signature Required", "Please type your full legal name to confirm acceptance.");
      return;
    }

    setIsProcessing(true);
    try {
      const updated = db.acceptOfferLetter(offer.id, signatureName.trim(), acceptComment);
      if (updated) {
        setOffer(updated);
        setIsAcceptModalOpen(false);
        triggerConfetti();
        success("Offer Accepted!", "Congratulations! Your signed acceptance has been submitted to HireFlow.");
      }
    } catch (err: any) {
      error("Error", err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = () => {
    setIsProcessing(true);
    try {
      const updated = db.rejectOfferLetter(offer.id, rejectReason);
      if (updated) {
        setOffer(updated);
        setIsRejectModalOpen(false);
        success("Response Recorded", "Your feedback has been submitted to the talent team.");
      }
    } catch (err: any) {
      error("Error", err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest mb-1.5">
              <Sparkles className="w-4 h-4" /> Official Candidate Portal
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Employment Offer of Appointment</h1>
            <p className="text-xs text-slate-300 mt-1">
              Prepared for <strong className="text-white">{offer.candidate_name}</strong> by HireFlow Technologies Inc.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs shrink-0"
          >
            <FileDown className="w-3.5 h-3.5 mr-1.5" />
            Download PDF
          </Button>
        </div>

        {/* Status Callout Banner */}
        {offer.status === "Accepted" && (
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-emerald-900 flex items-start gap-3 shadow-xs">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">Offer Officially Accepted! 🎉</h3>
              <p className="text-xs text-emerald-800 mt-1">
                Thank you, {offer.candidate_signature_name}! Your electronic signature was verified on {formatDate(offer.responded_at)}. The People Operations team is preparing your onboarding package.
              </p>
            </div>
          </div>
        )}

        {offer.status === "Rejected" && (
          <div className="bg-red-50 border border-red-200 p-5 rounded-2xl text-red-900 flex items-start gap-3 shadow-xs">
            <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">Offer Declined</h3>
              <p className="text-xs text-red-800 mt-1">
                You have declined this offer on {formatDate(offer.responded_at)}. We appreciate your time and wish you the best in your career.
              </p>
            </div>
          </div>
        )}

        {/* Offer Terms & Letter Details */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex justify-between items-center text-xs text-slate-500">
            <span>Offer Document Ref: <strong className="font-mono text-slate-800">{offer.offer_number}</strong></span>
            <span className="text-red-600 font-semibold">Valid Through: {formatDate(offer.expiry_date)}</span>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-slate-700">
            <p className="font-bold text-slate-900 text-sm">Dear {offer.candidate_name},</p>
            <p>
              We are delighted to extend this formal offer of employment for the position of <strong>{offer.job_title}</strong> at <strong>HireFlow Technologies Inc.</strong> We were extremely impressed with your skills and believe you will thrive in our culture.
            </p>
          </div>

          {/* Key Terms Grid */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Position:</span>
              <p className="font-bold text-slate-900 text-sm">{offer.job_title}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Department:</span>
              <p className="font-bold text-slate-900">{offer.department}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Annual Compensation:</span>
              <p className="font-bold text-blue-600 text-base">{offer.salary}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Employment Type:</span>
              <p className="font-bold text-slate-900">{offer.employment_type || "Full-time"}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Projected Start Date:</span>
              <p className="font-bold text-slate-900">{formatDate(offer.joining_date)}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Work Arrangement:</span>
              <p className="font-bold text-slate-900">{offer.work_location || "Remote"}</p>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 font-medium">Benefits & Perks:</span>
              <p className="text-slate-800 font-medium mt-0.5">{offer.benefits}</p>
            </div>
          </div>

          {/* Acceptance Action Footer */}
          {offer.status !== "Accepted" && offer.status !== "Rejected" && (
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Lock className="w-4 h-4 text-slate-400" />
                <span>256-bit encrypted electronic signature portal</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsRejectModalOpen(true)}
                  className="flex-1 sm:flex-none text-xs text-red-600 hover:bg-red-50"
                >
                  Decline Offer
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsAcceptModalOpen(true)}
                  className="flex-1 sm:flex-none text-xs bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Accept & Sign Electronically
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Accept Modal */}
      <Modal
        isOpen={isAcceptModalOpen}
        onClose={() => setIsAcceptModalOpen(false)}
        title="Electronic Offer Acceptance"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              By signing below, you formally accept the employment offer for <strong>{offer.job_title}</strong> with start date {formatDate(offer.joining_date)}.
            </p>
          </div>

          <Input
            label="Type Full Legal Name (Electronic Signature)"
            placeholder="e.g. Eleanor Wright"
            value={signatureName}
            required
            onChange={(e) => setSignatureName(e.target.value)}
          />

          <Textarea
            label="Comments / Message to Hiring Team (Optional)"
            placeholder="e.g. Extremely excited to join the team!"
            rows={2}
            value={acceptComment}
            onChange={(e) => setAcceptComment(e.target.value)}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsAcceptModalOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="success" size="sm" onClick={handleConfirmAccept} isLoading={isProcessing}>
              Confirm & Sign Offer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Decline Job Offer"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Please let us know if there is anything specific that led to your decision:
          </p>

          <Textarea
            label="Feedback / Reason (Optional)"
            placeholder="e.g. Accepted another offer closer to home, compensation discrepancy, etc."
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsRejectModalOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmReject} isLoading={isProcessing}>
              Confirm Decline
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
