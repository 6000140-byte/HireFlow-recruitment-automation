"use client";

import React, { useState } from "react";
import { Sliders, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";
import { ScoringCriterion } from "@/types/candidate";
import { db } from "@/lib/storage/db";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "../ui/Toast";
import { Button } from "../ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Switch } from "../ui/Switch";

export const CriteriaManager: React.FC = () => {
  const { permissions } = useAuth();
  const { success, error } = useToast();

  const [criteria, setCriteria] = useState<ScoringCriterion[]>(() => db.getScoringCriteria());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ScoringCriterion>>({
    name: "",
    description: "",
    weight: 20,
    maximum_score: 100,
    minimum_requirement: "",
    enabled: true,
  });

  const reload = () => {
    setCriteria(db.getScoringCriteria());
  };

  const totalWeight = criteria.reduce((sum, c) => (c.enabled ? sum + c.weight : sum), 0);

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      description: "",
      weight: 15,
      maximum_score: 100,
      minimum_requirement: "",
      enabled: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (crit: ScoringCriterion) => {
    setFormData(crit);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      error("Missing required fields", "Please fill in criteria name and description.");
      return;
    }

    if (formData.id) {
      db.updateScoringCriterion(formData.id, formData);
      success("Criterion Updated", `Updated ${formData.name}`);
    } else {
      db.addScoringCriterion(formData);
      success("Criterion Added", `Added new scoring criterion.`);
    }

    setIsModalOpen(false);
    reload();
  };

  const handleDelete = (id: string) => {
    db.deleteScoringCriterion(id);
    reload();
    success("Criterion Deleted", "Criterion removed.");
  };

  const handleToggleEnabled = (crit: ScoringCriterion) => {
    db.updateScoringCriterion(crit.id, { enabled: !crit.enabled });
    reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Selection & Scoring Criteria</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure automated candidate evaluation weights and baseline qualifying rules.
          </p>
        </div>

        {permissions.canManageCriteria && (
          <Button variant="primary" size="sm" onClick={handleOpenAdd} className="text-xs">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Criterion
          </Button>
        )}
      </div>

      {/* Weight Warning Banner if != 100% */}
      {totalWeight !== 100 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Enabled criteria weights total <strong>{totalWeight}%</strong> (Recommended: Exactly 100%).
            </span>
          </div>
        </div>
      )}

      {/* Criteria Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {criteria.map((crit) => (
          <Card key={crit.id} className={!crit.enabled ? "opacity-60 bg-slate-50" : ""}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div>
                <CardTitle className="text-sm">{crit.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                    Weight: {crit.weight}%
                  </span>
                  <span className="text-[11px] text-slate-400">Max: {crit.maximum_score} pts</span>
                </div>
              </div>

              {permissions.canManageCriteria && (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(crit)} className="h-7 w-7 text-slate-500">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(crit.id)} className="h-7 w-7 text-red-500 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">{crit.description}</p>
              {crit.minimum_requirement && (
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                  <span className="font-semibold text-slate-900 block mb-0.5">Minimum Benchmark:</span>
                  {crit.minimum_requirement}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <Switch
                  checked={crit.enabled}
                  onChange={() => handleToggleEnabled(crit)}
                  label={crit.enabled ? "Active in Scoring Engine" : "Disabled"}
                  disabled={!permissions.canManageCriteria}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={formData.id ? "Edit Scoring Criterion" : "Add New Scoring Criterion"}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Criterion Name"
            placeholder="e.g. System Architecture & Problem Solving"
            value={formData.name}
            required
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Textarea
            label="Description & Evaluation Rubric"
            placeholder="Detailed guidelines on how recruiters or auto-engine should score this..."
            value={formData.description}
            required
            rows={3}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Weight Percentage (%)"
              type="number"
              min="1"
              max="100"
              value={formData.weight}
              required
              onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Max Possible Score"
              type="number"
              min="1"
              value={formData.maximum_score}
              required
              onChange={(e) => setFormData({ ...formData, maximum_score: parseInt(e.target.value) || 100 })}
            />
          </div>

          <Input
            label="Minimum Qualifying Threshold (Optional)"
            placeholder="e.g. Minimum 4+ years production React experience"
            value={formData.minimum_requirement}
            onChange={(e) => setFormData({ ...formData, minimum_requirement: e.target.value })}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Criterion
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
