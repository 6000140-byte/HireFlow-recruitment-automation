"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Candidate } from "@/types/candidate";
import { OfferLetterTemplate, OfferLetter } from "@/types/offer";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { db } from "@/lib/storage/db";
import { downloadOfferPdf } from "@/lib/pdf/offer-generator";
import { FileDown, FileSignature } from "lucide-react";

export const GenerateOfferModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
  onOfferGenerated?: (offer: OfferLetter) => void;
}> = ({ isOpen, onClose, candidate, onOfferGenerated }) => {
  const router = useRouter();
  const { success, error } = useToast();
  const templates = db.getOfferLetterTemplates();

  const [templateId, setTemplateId] = useState(templates[0]?.id || "off_tpl_01");
  const [jobTitle, setJobTitle] = useState(candidate.position || "Senior Full Stack Engineer");
  const [department, setDepartment] = useState(candidate.department || "Engineering");
  const [reportingManager, setReportingManager] = useState("David Zhao (VP Engineering)");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [workLocation, setWorkLocation] = useState("Remote (US/Canada)");
  const [salary, setSalary] = useState(candidate.salary_expectation || "$145,000 / year");
  const [bonusStructure, setBonusStructure] = useState("10% annual performance incentive");
  const [benefits, setBenefits] = useState("Comprehensive Medical/Dental/Vision, 401(k) 4% match, Unlimited PTO, $2,500 Learning Stipend");
  const [joiningDate, setJoiningDate] = useState(
    new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0]
  );
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
  );
  const [signatoryName, setSignatoryName] = useState("Sarah Jenkins");
  const [signatoryDesignation, setSignatoryDesignation] = useState("VP of People & Operations");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    try {
      const template = templates.find((t) => t.id === templateId);
      const newOffer = db.createOfferLetter({
        candidate_id: candidate.id,
        candidate_name: candidate.full_name,
        candidate_email: candidate.email,
        template_id: templateId,
        template_name: template?.name || "Standard Full-Time Employment Offer",
        job_title: jobTitle,
        department: department,
        reporting_manager: reportingManager,
        employment_type: employmentType,
        work_location: workLocation,
        salary: salary,
        bonus_structure: bonusStructure,
        benefits: benefits,
        joining_date: joiningDate,
        expiry_date: expiryDate,
        signatory_name: signatoryName,
        signatory_designation: signatoryDesignation,
      });

      success("Offer Letter Generated", `Created offer ${newOffer.offer_number} for ${candidate.full_name}.`);
      if (onOfferGenerated) onOfferGenerated(newOffer);
      onClose();
      router.push(`/offer-letters`);
    } catch (err: any) {
      error("Error generating offer", err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewPdf = () => {
    const dummyOffer: OfferLetter = {
      id: "temp_preview",
      organization_id: "org_default",
      candidate_id: candidate.id,
      candidate_name: candidate.full_name,
      candidate_email: candidate.email,
      template_id: templateId,
      offer_number: "HF-OFF-PREVIEW",
      job_title: jobTitle,
      department: department,
      reporting_manager: reportingManager,
      employment_type: employmentType,
      work_location: workLocation,
      salary: salary,
      bonus_structure: bonusStructure,
      benefits: benefits,
      joining_date: joiningDate,
      expiry_date: expiryDate,
      signatory_name: signatoryName,
      signatory_designation: signatoryDesignation,
      status: "Draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    downloadOfferPdf({ offer: dummyOffer, candidate });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Generate Official Offer Letter`} maxWidth="3xl">
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          Draft and issue a formal employment offer package for <strong className="text-slate-900">{candidate.full_name}</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="sm:col-span-2">
            <Select
              label="Offer Letter Template"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              options={templates.map((t) => ({ value: t.id, label: t.name }))}
            />
          </div>

          <Input
            label="Job Title / Designation"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />

          <Select
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={[
              { value: "Engineering", label: "Engineering" },
              { value: "Product", label: "Product" },
              { value: "Design", label: "Design" },
              { value: "Data Science", label: "Data Science" },
              { value: "Sales", label: "Sales" },
              { value: "Marketing", label: "Marketing" },
              { value: "Human Resources", label: "Human Resources" },
              { value: "Finance", label: "Finance" },
            ]}
          />

          <Input
            label="Reporting Manager"
            value={reportingManager}
            onChange={(e) => setReportingManager(e.target.value)}
          />

          <Select
            label="Employment Type"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            options={[
              { value: "Full-time", label: "Full-time Permanent" },
              { value: "Full-time Executive", label: "Full-time Executive" },
              { value: "Part-time", label: "Part-time" },
              { value: "Contract (6-Month)", label: "Contract (6-Month)" },
              { value: "Internship", label: "Internship" },
            ]}
          />

          <Input
            label="Work Location Arrangement"
            value={workLocation}
            onChange={(e) => setWorkLocation(e.target.value)}
            placeholder="e.g. Remote (US/Canada) or San Francisco HQ"
          />

          <Input
            label="Compensation / Salary"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="e.g. $150,000 / year"
          />

          <Input
            label="Bonus / Variable Compensation"
            value={bonusStructure}
            onChange={(e) => setBonusStructure(e.target.value)}
            placeholder="e.g. 10% annual bonus + equity"
          />

          <Input
            label="Projected Joining / Start Date"
            type="date"
            value={joiningDate}
            onChange={(e) => setJoiningDate(e.target.value)}
          />

          <Input
            label="Offer Expiration Date"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />

          <div className="sm:col-span-2">
            <Input
              label="Benefits & Perks Summary"
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
            />
          </div>

          <Input
            label="Authorized Signatory Name"
            value={signatoryName}
            onChange={(e) => setSignatoryName(e.target.value)}
          />

          <Input
            label="Signatory Designation"
            value={signatoryDesignation}
            onChange={(e) => setSignatoryDesignation(e.target.value)}
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handlePreviewPdf}>
            <FileDown className="w-3.5 h-3.5 mr-1.5" />
            Download PDF Sample
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isGenerating}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleGenerate} isLoading={isGenerating}>
              <FileSignature className="w-3.5 h-3.5 mr-1.5" />
              Generate Official Offer
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
