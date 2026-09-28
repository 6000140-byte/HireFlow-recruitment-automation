"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { candidateSchema } from "@/lib/validations/candidate";
import { Candidate } from "@/types/candidate";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { db } from "@/lib/storage/db";
import { autoEvaluateCandidate } from "@/lib/scoring/engine";

export const AddCandidateModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCandidateAdded: (candidate: Candidate) => void;
}> = ({ isOpen, onClose, onCandidateAdded }) => {
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      position: "Senior Full Stack Engineer",
      department: "Engineering",
      education: "B.S. Computer Science",
      experience: 4,
      skills: "React, TypeScript, Node.js, SQL",
      address: "San Francisco, CA",
      salary_expectation: "$140,000 / year",
      availability: "Immediate",
      status: "New",
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const criteria = db.getScoringCriteria();
      const evalResult = autoEvaluateCandidate(data, criteria);

      const newCandidate = db.addCandidate({
        ...data,
        score: evalResult.totalScore,
        recommendation: evalResult.recommendation,
        source: "Manual Entry",
      });

      success("Candidate Created", `${newCandidate.full_name} was successfully added with score ${newCandidate.score}/100.`);
      onCandidateAdded(newCandidate);
      reset();
      onClose();
    } catch (err: any) {
      error("Error creating candidate", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Candidate Manually" maxWidth="3xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            placeholder="e.g. Jane Doe"
            required
            {...register("full_name")}
            error={errors.full_name?.message as string}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="jane.doe@example.com"
            required
            {...register("email")}
            error={errors.email?.message as string}
          />
          <Input
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            required
            {...register("phone")}
            error={errors.phone?.message as string}
          />
          <Input
            label="Location / Address"
            placeholder="San Francisco, CA"
            {...register("address")}
            error={errors.address?.message as string}
          />
          <Input
            label="Position Applied For"
            placeholder="Senior Full Stack Engineer"
            required
            {...register("position")}
            error={errors.position?.message as string}
          />
          <Select
            label="Department"
            required
            {...register("department")}
            error={errors.department?.message as string}
            options={[
              { value: "Engineering", label: "Engineering" },
              { value: "Product", label: "Product" },
              { value: "Design", label: "Design" },
              { value: "Sales", label: "Sales" },
              { value: "Marketing", label: "Marketing" },
              { value: "Data Science", label: "Data Science" },
              { value: "Human Resources", label: "Human Resources" },
              { value: "Finance", label: "Finance" },
            ]}
          />
          <Input
            label="Highest Education"
            placeholder="e.g. M.S. Computer Science (Stanford)"
            required
            {...register("education")}
            error={errors.education?.message as string}
          />
          <Input
            label="Years of Experience"
            type="number"
            step="0.5"
            required
            {...register("experience")}
            error={errors.experience?.message as string}
          />
          <div className="sm:col-span-2">
            <Input
              label="Technical / Core Skills (comma separated)"
              placeholder="React, TypeScript, GraphQL, AWS, Docker"
              required
              {...register("skills")}
              error={errors.skills?.message as string}
            />
          </div>
          <Input
            label="Resume Document Link / URL"
            placeholder="https://drive.google.com/..."
            {...register("resume_url")}
          />
          <Input
            label="LinkedIn / Portfolio Link"
            placeholder="https://linkedin.com/in/..."
            {...register("portfolio_url")}
          />
          <Input
            label="Salary Expectation"
            placeholder="$135,000 / year"
            {...register("salary_expectation")}
          />
          <Input
            label="Notice Period / Availability"
            placeholder="Immediate / 30 Days"
            {...register("availability")}
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Create & Auto-Score Candidate
          </Button>
        </div>
      </form>
    </Modal>
  );
};
