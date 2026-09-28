"use client";

import React, { useState } from "react";
import { Candidate, CandidateStatus } from "@/types/candidate";
import { Modal } from "../ui/Modal";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { db } from "@/lib/storage/db";
import { sendEmail } from "@/lib/email/service";

export const BulkActionsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedCandidates: Candidate[];
  mode: "status" | "email";
  onSuccess: () => void;
}> = ({ isOpen, onClose, selectedCandidates, mode, onSuccess }) => {
  const { success, error } = useToast();
  const [newStatus, setNewStatus] = useState<CandidateStatus>("Shortlisted");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const templates = db.getEmailTemplates();

  const handleApplyStatus = () => {
    setIsLoading(true);
    try {
      const ids = selectedCandidates.map((c) => c.id);
      db.bulkUpdateStatus(ids, newStatus);
      success("Status Updated", `Updated status to "${newStatus}" for ${ids.length} candidates.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      error("Error", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendBulkEmail = async () => {
    setIsLoading(true);
    try {
      const template = templates.find((t) => t.id === selectedTemplateId);
      for (const candidate of selectedCandidates) {
        const result = await sendEmail({
          candidate,
          template,
          customSubject: customSubject || undefined,
          customBody: customBody || undefined,
        });
        db.logEmail(result.log);
      }
      success("Emails Dispatched", `Sent email notifications to ${selectedCandidates.length} candidate(s).`);
      onSuccess();
      onClose();
    } catch (err: any) {
      error("Error sending emails", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "status" ? `Bulk Update Status (${selectedCandidates.length} Selected)` : `Bulk Email Delivery (${selectedCandidates.length} Selected)`}
      maxWidth="lg"
    >
      {mode === "status" ? (
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Select the new pipeline status to assign to all {selectedCandidates.length} selected candidates.
          </p>

          <Select
            label="New Candidate Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as CandidateStatus)}
            options={[
              { value: "New", label: "New" },
              { value: "Under Review", label: "Under Review" },
              { value: "Shortlisted", label: "Shortlisted" },
              { value: "Interview", label: "Interview" },
              { value: "Selected", label: "Selected" },
              { value: "Offer Sent", label: "Offer Sent" },
              { value: "Rejected", label: "Rejected" },
              { value: "On Hold", label: "On Hold" },
            ]}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApplyStatus} isLoading={isLoading}>
              Update All Selected
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Choose an email template to merge and send dynamically to each selected candidate.
          </p>

          <Select
            label="Select Email Template"
            value={selectedTemplateId}
            onChange={(e) => {
              const tId = e.target.value;
              setSelectedTemplateId(tId);
              const found = templates.find((t) => t.id === tId);
              if (found) {
                setCustomSubject(found.subject);
                setCustomBody(found.body);
              }
            }}
            options={[
              { value: "", label: "-- Choose Template or Write Custom --" },
              ...templates.map((t) => ({ value: t.id, label: `${t.name} (${t.template_type})` })),
            ]}
          />

          <Input
            label="Email Subject"
            placeholder="Subject line with {{position}} variables..."
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
          />

          <Textarea
            label="Email Body (supports {{candidate_name}}, {{position}}, {{company_name}})"
            rows={5}
            value={customBody}
            onChange={(e) => setCustomBody(e.target.value)}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSendBulkEmail} isLoading={isLoading}>
              Send to {selectedCandidates.length} Candidates
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
