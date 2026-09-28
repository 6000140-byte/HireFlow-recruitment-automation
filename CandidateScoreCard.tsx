"use client";

import React, { useState } from "react";
import { Sliders, Award, Edit3, ShieldAlert, Check } from "lucide-react";
import { Candidate, RecommendationType, ScoringCriterion } from "@/types/candidate";
import { useAuth } from "@/lib/auth/context";
import { db } from "@/lib/storage/db";
import { getRecommendationForScore, calculateCandidateScore } from "@/lib/scoring/engine";
import { getRecommendationBadgeClass } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Select } from "../ui/Select";
import { useToast } from "../ui/Toast";

export const CandidateScoreCard: React.FC<{
  candidate: Candidate;
  onScoreUpdated: () => void;
}> = ({ candidate, onScoreUpdated }) => {
  const { user, permissions } = useAuth();
  const { success, error } = useToast();
  const criteria = db.getScoringCriteria();

  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideScore, setOverrideScore] = useState(candidate.score);
  const [overrideRecommendation, setOverrideRecommendation] = useState<RecommendationType>(candidate.recommendation);
  const [overrideReason, setOverrideReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Dynamic reviewer criteria scores
  const [criterionScores, setCriterionScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    criteria.forEach((crit) => {
      initial[crit.id] = Math.min(Math.max(candidate.score + Math.floor((Math.random() - 0.5) * 15), 50), 100);
    });
    return initial;
  });

  const handleCriterionScoreChange = (criterionId: string, val: number) => {
    const updated = { ...criterionScores, [criterionId]: val };
    setCriterionScores(updated);

    const formatted = Object.entries(updated).map(([critId, score]) => ({
      id: `score_${critId}`,
      candidate_id: candidate.id,
      criterion_id: critId,
      score: score,
      explanation: "Reviewer submitted evaluation.",
      scored_by: user?.full_name || "Reviewer",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const result = calculateCandidateScore(criteria, formatted);
    db.updateCandidate(candidate.id, {
      score: result.totalScore,
      recommendation: result.recommendation,
    });
    onScoreUpdated();
  };

  const handleApplyOverride = () => {
    if (!overrideReason || overrideReason.length < 10) {
      error("Override Justification Required", "Please provide a clear justification of at least 10 characters for the audit log.");
      return;
    }

    setIsSaving(true);
    try {
      db.overrideCandidateScore(
        candidate.id,
        overrideScore,
        overrideRecommendation,
        overrideReason,
        user?.full_name || "Recruiter"
      );
      success("Score Overridden", `Score updated to ${overrideScore}/100 with logged audit reason.`);
      setIsOverrideModalOpen(false);
      onScoreUpdated();
    } catch (err: any) {
      error("Error overriding score", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const recStyle = getRecommendationBadgeClass(candidate.recommendation);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Automated & Evaluator Scoring Engine
            </CardTitle>
            <CardDescription>
              Weighted criteria calculations based on configurable rubric
            </CardDescription>
          </div>

          {permissions.canScoreCandidates && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOverrideScore(candidate.score);
                setOverrideRecommendation(candidate.recommendation);
                setIsOverrideModalOpen(true);
              }}
              className="text-xs"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1" />
              Override Recommendation
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Score Hero Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center font-bold text-2xl shadow-xs ${
                  candidate.score >= 80
                    ? "bg-emerald-600 text-white"
                    : candidate.score >= 65
                    ? "bg-blue-600 text-white"
                    : candidate.score >= 50
                    ? "bg-amber-500 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                <span>{candidate.score}</span>
                <span className="text-[10px] font-normal opacity-80">/ 100</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">Overall Assessment Score</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${recStyle.bg} ${recStyle.text} ${recStyle.border}`}>
                    {candidate.recommendation}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {candidate.recommendation === "Strongly Recommended" && "Candidate significantly exceeds all minimum requirements and qualifications."}
                  {candidate.recommendation === "Recommended" && "Candidate matches job description criteria and has solid experience."}
                  {candidate.recommendation === "Review Required" && "Candidate partially meets requirements. Further review recommended."}
                  {candidate.recommendation === "Not Recommended" && "Candidate credentials fall below defined job benchmarks."}
                </p>
              </div>
            </div>

            {candidate.recommendation_override_reason && (
              <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Manual Override Active
                </span>
                <p className="text-[11px] text-slate-500 italic mt-1 max-w-[200px] truncate">
                  "{candidate.recommendation_override_reason}"
                </p>
              </div>
            )}
          </div>

          {/* Criteria Breakdown Grid */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Criteria Breakdown & Reviewer Weights
            </h4>

            <div className="space-y-3">
              {criteria.map((crit) => {
                const currentVal = criterionScores[crit.id] ?? 75;
                return (
                  <div key={crit.id} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{crit.name}</span>
                        <span className="text-slate-400 ml-2 font-semibold">Weight: {crit.weight}%</span>
                        {crit.minimum_requirement && (
                          <span className="text-[11px] text-slate-500 block">{crit.minimum_requirement}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{currentVal} / 100</span>
                      </div>
                    </div>

                    {/* Progress Slider */}
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={currentVal}
                        disabled={!permissions.canScoreCandidates}
                        onChange={(e) => handleCriterionScoreChange(crit.id, parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Override Modal */}
      <Modal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        title="Manual Recommendation Override"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Overriding the system's automated recommendation requires a mandatory justification and will be permanently recorded in the system audit trail.
            </p>
          </div>

          <Input
            label="Adjusted Score (0 - 100)"
            type="number"
            min="0"
            max="100"
            value={overrideScore}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              setOverrideScore(val);
              setOverrideRecommendation(getRecommendationForScore(val));
            }}
          />

          <Select
            label="Adjusted Recommendation"
            value={overrideRecommendation}
            onChange={(e) => setOverrideRecommendation(e.target.value as RecommendationType)}
            options={[
              { value: "Strongly Recommended", label: "Strongly Recommended (80-100)" },
              { value: "Recommended", label: "Recommended (65-79)" },
              { value: "Review Required", label: "Review Required (50-64)" },
              { value: "Not Recommended", label: "Not Recommended (0-49)" },
            ]}
          />

          <Textarea
            label="Override Justification Reason (Required for Audit Log)"
            placeholder="e.g. Candidate demonstrated exceptional architectural leadership in past startup despite lower formal years of experience..."
            rows={3}
            required
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsOverrideModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleApplyOverride} isLoading={isSaving}>
              Apply & Log Override
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
