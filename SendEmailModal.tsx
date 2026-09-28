"use client";

import React, { useState, useEffect } from "react";
import { Candidate } from "@/types/candidate";
import { EmailTemplate } from "@/types/email";
import { Modal } from "../ui/Modal";
import { Select } from "../ui/Select";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { Tabs } from "../ui/Tabs";
import { useToast } from "../ui/Toast";
import { db } from "@/lib/storage/db";
import { buildInterpolationContext, interpolateEmailVariables, sendEmail } from "@/lib/email/service";

export const SendEmailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
  onEmailSent?: () => void;
}> = ({ isOpen, onClose, candidate, onEmailSent }) => {
  const { success, error } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [interviewDate, setInterviewDate] = useState("2026-10-05 at 10:00 AM PST");
  const [activeTab, setActiveTab] = useState<"compose" | "preview">("compose");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const allTemplates = db.getEmailTemplates();
      setTemplates(allTemplates);
      // Auto-select template matching candidate status or first template
      const matched =
        allTemplates.find((t) => t.template_type.includes(candidate.status.toLowerCase().replace(/\s+/g, "_"))) ||
        allTemplates[0];
      if (matched) {
        setSelectedTemplateId(matched.id);
        setSubject(matched.subject);
        setBody(matched.body);
      }
    }
  }, [isOpen, candidate]);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const found = templates.find((t) => t.id === templateId);
    if (found) {
      setSubject(found.subject);
      setBody(found.body);
    }
  };

  const context = buildInterpolationContext(candidate, undefined, {
    interview_date: interviewDate,
  });

  const previewSubject = interpolateEmailVariables(subject, context);
  const previewBody = interpolateEmailVariables(body, context);

  const handleSend = async () => {
    setIsSending(true);
    try {
      const template = templates.find((t) => t.id === selectedTemplateId);
      const result = await sendEmail({
        candidate,
        template,
        customSubject: subject,
        customBody: body,
      });

      db.logEmail(result.log);
      success("Email Sent", `Message successfully sent to ${candidate.email}`);
      if (onEmailSent) onEmailSent();
      onClose();
    } catch (err: any) {
      error("Error sending email", err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Send Email to ${candidate.full_name}`} maxWidth="2xl">
      <div className="space-y-4">
        <Tabs
          tabs={[
            { id: "compose", label: "Compose & Variables" },
            { id: "preview", label: "Live Interpolated Preview" },
          ]}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as any)}
        />

        {activeTab === "compose" ? (
          <div className="space-y-3.5">
            <Select
              label="Choose Email Template"
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              options={templates.map((t) => ({ value: t.id, label: `${t.name} (${t.template_type})` }))}
            />

            <Input
              label="Subject Line (supports {{variables}})"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <Textarea
              label="Email Body"
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />

            {/* Variable Pills */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-700 block mb-1.5">Click variable to insert:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "{{candidate_name}}",
                  "{{position}}",
                  "{{department}}",
                  "{{candidate_score}}",
                  "{{interview_date}}",
                  "{{joining_date}}",
                  "{{salary}}",
                  "{{offer_letter_url}}",
                  "{{company_name}}",
                  "{{recruiter_name}}",
                ].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setBody((prev) => `${prev} ${v}`)}
                    className="text-[10px] bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 px-2 py-0.5 rounded-md text-slate-700 font-mono transition-colors"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="border-b border-slate-200 pb-2.5">
              <div className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700">To:</span> {candidate.full_name} &lt;{candidate.email}&gt;
              </div>
              <div className="text-xs text-slate-500 mt-1">
                <span className="font-semibold text-slate-700">Subject:</span>{" "}
                <span className="font-bold text-slate-900">{previewSubject}</span>
              </div>
            </div>
            <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans bg-white p-4 rounded-lg border border-slate-200">
              {previewBody}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setActiveTab(activeTab === "compose" ? "preview" : "compose")}>
            Switch to {activeTab === "compose" ? "Preview" : "Compose"}
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSending}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSend} isLoading={isSending}>
              Send Official Email
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
