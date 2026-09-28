"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  FileSpreadsheet,
  UserPlus,
  FileSignature,
  Mail,
  Sliders,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { Modal } from "../ui/Modal";

export const QuickActionsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();

  const actions = [
    {
      title: "Import from Google Sheets",
      desc: "Connect sheet responses, map columns, and auto-evaluate incoming applicants.",
      icon: FileSpreadsheet,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
      href: "/integrations",
    },
    {
      title: "Add Candidate Manually",
      desc: "Directly enter applicant details, experience, skills, and resume URL.",
      icon: UserPlus,
      color: "bg-blue-50 text-blue-600 border-blue-200",
      href: "/applications?action=add",
    },
    {
      title: "Generate Official Offer Letter",
      desc: "Draft executive PDF offer with customized compensation and electronic signing.",
      icon: FileSignature,
      color: "bg-amber-50 text-amber-600 border-amber-200",
      href: "/offer-letters?action=create",
    },
    {
      title: "Create Email Automation Template",
      desc: "Compose dynamic rejection, shortlist, or invitation email with variables.",
      icon: Mail,
      color: "bg-purple-50 text-purple-600 border-purple-200",
      href: "/email-templates?action=create",
    },
    {
      title: "Tune Selection Criteria & Weights",
      desc: "Adjust education, years of experience, and technical skill scoring formula.",
      icon: Sliders,
      color: "bg-cyan-50 text-cyan-600 border-cyan-200",
      href: "/selection-criteria",
    },
    {
      title: "Export Performance Reports",
      desc: "Download full recruitment funnel statistics in CSV, Excel, or PDF format.",
      icon: BarChart3,
      color: "bg-rose-50 text-rose-600 border-rose-200",
      href: "/reports",
    },
  ];

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Actions Hub" maxWidth="2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSelect(act.href)}
              className="p-4 rounded-xl border border-slate-200/90 hover:border-blue-500 hover:shadow-md bg-white hover:bg-slate-50/50 transition-all text-left flex items-start gap-3.5 group"
            >
              <div className={`p-2.5 rounded-xl border shrink-0 ${act.color} group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {act.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{act.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
};
