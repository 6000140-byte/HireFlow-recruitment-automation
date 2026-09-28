"use client";

import React, { useState } from "react";
import { Plus, Edit2, Copy, Trash2, Mail, CheckCircle2, Eye, Sparkles } from "lucide-react";
import { EmailTemplate, EmailTemplateType } from "@/types/email";
import { db } from "@/lib/storage/db";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "../ui/Toast";
import { Button } from "../ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { Switch } from "../ui/Switch";
import { interpolateEmailVariables } from "@/lib/email/service";

export const EmailTemplateEditor: React.FC = () => {
  const { permissions } = useAuth();
  const { success, error } = useToast();

  const [templates, setTemplates] = useState<EmailTemplate[]>(() => db.getEmailTemplates());
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(templates[0] || null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isTestEmailModalOpen, setIsTestEmailModalOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("admin@hireflow.io");

  // Form state
  const [formData, setFormData] = useState<Partial<EmailTemplate>>({
    name: "",
    template_type: "application_received",
    subject: "",
    body: "",
    enabled: true,
  });

  const reload = () => {
    const list = db.getEmailTemplates();
    setTemplates(list);
    if (selectedTemplate) {
      setSelectedTemplate(list.find((t) => t.id === selectedTemplate.id) || list[0] || null);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      name: "New Email Template",
      template_type: "shortlisted",
      subject: "Update regarding your application for {{position}}",
      body: `Hi {{candidate_name}},\n\nThank you for applying for {{position}} at {{company_name}}.\n\nBest regards,\n{{recruiter_name}}`,
      enabled: true,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (t: EmailTemplate) => {
    setFormData(t);
    setIsEditModalOpen(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.subject || !formData.body) {
      error("Incomplete Form", "Please fill in all template fields.");
      return;
    }

    if (formData.id) {
      db.updateEmailTemplate(formData.id, formData);
      success("Template Updated", `Changes saved for ${formData.name}`);
    } else {
      const created = db.addEmailTemplate(formData);
      setSelectedTemplate(created);
      success("Template Created", `New email template created.`);
    }

    setIsEditModalOpen(false);
    reload();
  };

  const handleDuplicate = (t: EmailTemplate) => {
    const duplicated = db.addEmailTemplate({
      ...t,
      id: undefined,
      name: `${t.name} (Copy)`,
    });
    reload();
    setSelectedTemplate(duplicated);
    success("Template Duplicated", `Created a copy of ${t.name}`);
  };

  const handleDelete = (id: string) => {
    db.deleteEmailTemplate(id);
    reload();
    success("Template Removed", "Email template deleted.");
  };

  const handleSendTestEmail = () => {
    if (!testEmailAddress) {
      error("Email Required", "Please specify a test recipient address.");
      return;
    }
    success("Test Email Dispatched", `Sent simulated test email to ${testEmailAddress}`);
    setIsTestEmailModalOpen(false);
  };

  const sampleContext = {
    candidate_name: "Eleanor Wright",
    candidate_email: "eleanor.wright@example.com",
    position: "Senior Full Stack Engineer",
    department: "Engineering",
    application_date: "2026-09-20",
    candidate_score: "92/100",
    interview_date: "October 5th, 2026 at 10:00 AM PST",
    offer_expiry_date: "October 12th, 2026",
    salary: "$150,000 / year",
    joining_date: "November 1st, 2026",
    offer_letter_url: "https://hireflow.io/offer/demo",
    company_name: "HireFlow Technologies Inc.",
    recruiter_name: "Alex Morgan (Head of Talent)",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Automated Email System</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Design dynamic email notifications with variables for every stage of your recruitment funnel.
          </p>
        </div>

        {permissions.canManageTemplates && (
          <Button variant="primary" size="sm" onClick={handleOpenCreate} className="text-xs">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Create Email Template
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="lg:col-span-1 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Active Templates ({templates.length})
          </div>
          <div className="space-y-2">
            {templates.map((tpl) => {
              const isSelected = selectedTemplate?.id === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-50/70 border-blue-500 shadow-xs"
                      : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 truncate max-w-[180px]">{tpl.name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                      {tpl.template_type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-1">{tpl.subject}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Template Detail / Preview Panel */}
        <div className="lg:col-span-2">
          {selectedTemplate ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle>{selectedTemplate.name}</CardTitle>
                  <CardDescription>Type: {selectedTemplate.template_type}</CardDescription>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => setIsPreviewModalOpen(true)} className="text-xs">
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsTestEmailModalOpen(true)}
                    className="text-xs text-purple-600"
                  >
                    <Mail className="w-3.5 h-3.5 mr-1" />
                    Test Send
                  </Button>
                  {permissions.canManageTemplates && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicate(selectedTemplate)}
                        className="text-xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(selectedTemplate)}
                        className="text-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(selectedTemplate.id)}
                        className="text-xs text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Subject Line
                  </span>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900">
                    {selectedTemplate.subject}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Message Body Template
                  </span>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-mono">
                    {selectedTemplate.body}
                  </div>
                </div>

                {/* Variable Cheat-Sheet */}
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs">
                  <span className="font-bold text-blue-900 block mb-1">Interpolated Template Variables:</span>
                  <div className="flex flex-wrap gap-1 text-[11px] font-mono text-blue-700">
                    {[
                      "{{candidate_name}}",
                      "{{candidate_email}}",
                      "{{position}}",
                      "{{department}}",
                      "{{candidate_score}}",
                      "{{interview_date}}",
                      "{{salary}}",
                      "{{joining_date}}",
                      "{{offer_letter_url}}",
                      "{{company_name}}",
                      "{{recruiter_name}}",
                    ].map((v) => (
                      <span key={v} className="bg-white border border-blue-200 px-1.5 py-0.5 rounded">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
              Select or create a template to view details
            </div>
          )}
        </div>
      </div>

      {/* Edit / Create Template Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={formData.id ? "Edit Email Template" : "Create Email Template"}
        maxWidth="3xl"
      >
        <form onSubmit={handleSaveTemplate} className="space-y-4">
          <Input
            label="Template Name"
            placeholder="e.g. Technical Interview Invitation"
            value={formData.name}
            required
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Select
            label="Template Category Type"
            value={formData.template_type}
            onChange={(e) => setFormData({ ...formData, template_type: e.target.value as EmailTemplateType })}
            options={[
              { value: "application_received", label: "Application Received Confirmation" },
              { value: "application_under_review", label: "Application Under Review" },
              { value: "shortlisted", label: "Candidate Shortlisted" },
              { value: "interview_invitation", label: "Interview Invitation" },
              { value: "selection_notification", label: "Selection Notification" },
              { value: "rejection_notification", label: "Rejection Notification" },
              { value: "offer_letter_email", label: "Official Offer Letter Delivery" },
              { value: "offer_reminder", label: "Offer Expiry Reminder" },
              { value: "offer_accepted_confirmation", label: "Offer Accepted - Welcome Aboard" },
              { value: "offer_rejected_confirmation", label: "Offer Rejected Confirmation" },
            ]}
          />

          <Input
            label="Subject Line (Supports {{variables}})"
            placeholder="Subject line..."
            value={formData.subject}
            required
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          />

          <Textarea
            label="Template Body"
            rows={8}
            value={formData.body}
            required
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Template
            </Button>
          </div>
        </form>
      </Modal>

      {/* Live Preview Modal */}
      {selectedTemplate && (
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title={`Preview: ${selectedTemplate.name}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-600">Subject:</span>{" "}
                <strong className="text-slate-900">
                  {interpolateEmailVariables(selectedTemplate.subject, sampleContext)}
                </strong>
              </div>
              <div className="p-4 bg-white rounded-lg border border-slate-200 whitespace-pre-wrap leading-relaxed font-sans text-slate-800">
                {interpolateEmailVariables(selectedTemplate.body, sampleContext)}
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsPreviewModalOpen(false)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Test Email Modal */}
      <Modal
        isOpen={isTestEmailModalOpen}
        onClose={() => setIsTestEmailModalOpen(false)}
        title="Send Test Email"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <Input
            label="Recipient Email Address"
            type="email"
            value={testEmailAddress}
            required
            onChange={(e) => setTestEmailAddress(e.target.value)}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsTestEmailModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSendTestEmail}>
              Send Test
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
