"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Copy, FileText, Eye, Sparkles } from "lucide-react";
import { OfferLetterTemplate } from "@/types/offer";
import { db } from "@/lib/storage/db";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "../ui/Toast";
import { Button } from "../ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";

export const OfferTemplateEditor: React.FC = () => {
  const { permissions } = useAuth();
  const { success, error } = useToast();

  const [templates, setTemplates] = useState<OfferLetterTemplate[]>(() => db.getOfferLetterTemplates());
  const [selectedTemplate, setSelectedTemplate] = useState<OfferLetterTemplate | null>(templates[0] || null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<OfferLetterTemplate>>({
    name: "",
    content: "",
    enabled: true,
  });

  const reload = () => {
    const list = db.getOfferLetterTemplates();
    setTemplates(list);
    if (selectedTemplate) {
      setSelectedTemplate(list.find((t) => t.id === selectedTemplate.id) || list[0] || null);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      name: "New Offer Letter Template",
      content: `Dear {{candidate_name}},\n\nWe are pleased to offer you the position of {{position}} in the {{department}} department at {{company_name}}.\n\nCompensation: {{salary}}\nStart Date: {{joining_date}}\nWork Location: {{work_location}}\n\nSincerely,\n{{signatory_name}}`,
      enabled: true,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (t: OfferLetterTemplate) => {
    setFormData(t);
    setIsEditModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.content) {
      error("Missing fields", "Please provide a name and template content.");
      return;
    }

    if (formData.id) {
      db.updateOfferLetterTemplate(formData.id, formData);
      success("Template Updated", `Changes saved for ${formData.name}`);
    } else {
      const created = db.addOfferLetterTemplate(formData);
      setSelectedTemplate(created);
      success("Template Created", "New offer letter template added.");
    }

    setIsEditModalOpen(false);
    reload();
  };

  const handleDuplicate = (t: OfferLetterTemplate) => {
    const duplicated = db.addOfferLetterTemplate({
      ...t,
      id: undefined,
      name: `${t.name} (Copy)`,
    });
    reload();
    setSelectedTemplate(duplicated);
    success("Template Duplicated", `Created a copy of ${t.name}`);
  };

  const handleDelete = (id: string) => {
    db.deleteOfferLetterTemplate(id);
    reload();
    success("Template Removed", "Offer letter template deleted.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Offer Letter Templates</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure legal agreements, executive clauses, and compensation templates.
          </p>
        </div>

        {permissions.canManageTemplates && (
          <Button variant="primary" size="sm" onClick={handleOpenAdd} className="text-xs">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Create Offer Template
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates list */}
        <div className="lg:col-span-1 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Available Templates ({templates.length})
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
                    <span className="font-bold text-xs text-slate-900 truncate max-w-[200px]">{tpl.name}</span>
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{tpl.content}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Template Detail / Editor Panel */}
        <div className="lg:col-span-2">
          {selectedTemplate ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle>{selectedTemplate.name}</CardTitle>
                  <CardDescription>Official Offer Agreement Body</CardDescription>
                </div>

                <div className="flex items-center gap-1.5">
                  {permissions.canManageTemplates && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicate(selectedTemplate)}
                        className="text-xs"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        Duplicate
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
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-mono">
                  {selectedTemplate.content}
                </div>

                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs">
                  <span className="font-bold text-blue-900 block mb-1">Supported Offer Variables:</span>
                  <div className="flex flex-wrap gap-1 text-[11px] font-mono text-blue-700">
                    {[
                      "{{candidate_name}}",
                      "{{position}}",
                      "{{department}}",
                      "{{salary}}",
                      "{{joining_date}}",
                      "{{work_location}}",
                      "{{reporting_manager}}",
                      "{{offer_expiry_date}}",
                      "{{signatory_name}}",
                      "{{company_name}}",
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
              Select or create an offer template to view details
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={formData.id ? "Edit Offer Template" : "Create Offer Template"}
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Template Name"
            placeholder="e.g. Standard Full-Time Engineering Offer"
            value={formData.name}
            required
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Textarea
            label="Offer Agreement Terms & Content"
            rows={10}
            value={formData.content}
            required
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Template
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
