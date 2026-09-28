"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Download,
  Plus,
  Mail,
  FileSignature,
  Trash2,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  MoreHorizontal,
  FileSpreadsheet,
  CheckSquare,
  Square,
  Sparkles,
  ExternalLink,
  Eye,
} from "lucide-react";
import { Candidate, CandidateStatus, RecommendationType } from "@/types/candidate";
import { useAuth } from "@/lib/auth/context";
import { db } from "@/lib/storage/db";
import { formatDate, getStatusBadgeClass, getRecommendationBadgeClass } from "@/lib/utils";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Pagination } from "../ui/Pagination";
import { useToast } from "../ui/Toast";
import { AddCandidateModal } from "./AddCandidateModal";
import { BulkActionsModal } from "./BulkActionsModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

export interface CandidateTableProps {
  initialStatusFilter?: CandidateStatus | "All";
  title?: string;
  description?: string;
}

export const CandidateTable: React.FC<CandidateTableProps> = ({
  initialStatusFilter = "All",
  title = "Applicant Tracking & Evaluation",
  description = "Manage, score, filter, and advance candidates through your hiring pipeline.",
}) => {
  const router = useRouter();
  const { role, permissions } = useAuth();
  const { success, error } = useToast();

  const [candidates, setCandidates] = useState<Candidate[]>(() => db.getCandidates());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [deptFilter, setDeptFilter] = useState<string>("All");
  const [scoreFilter, setScoreFilter] = useState<string>("All");
  const [sortField, setSortField] = useState<keyof Candidate>("application_date");
  const [sortAsc, setSortAsc] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [bulkModalMode, setBulkModalMode] = useState<"status" | "email" | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const reloadData = () => {
    setCandidates(db.getCandidates());
  };

  // Filter and sort candidates
  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((cand) => {
        // Search
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          cand.full_name.toLowerCase().includes(q) ||
          cand.email.toLowerCase().includes(q) ||
          cand.position.toLowerCase().includes(q) ||
          cand.skills.some((s) => s.toLowerCase().includes(q));

        // Status
        const matchesStatus = statusFilter === "All" || cand.status === statusFilter;

        // Department
        const matchesDept = deptFilter === "All" || cand.department === deptFilter;

        // Score
        let matchesScore = true;
        if (scoreFilter === "80+") matchesScore = cand.score >= 80;
        else if (scoreFilter === "65-79") matchesScore = cand.score >= 65 && cand.score < 80;
        else if (scoreFilter === "50-64") matchesScore = cand.score >= 50 && cand.score < 65;
        else if (scoreFilter === "<50") matchesScore = cand.score < 50;

        return matchesSearch && matchesStatus && matchesDept && matchesScore;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (valA === undefined) return 1;
        if (valB === undefined) return -1;

        if (typeof valA === "string") {
          return sortAsc ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
        }
        return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [candidates, searchQuery, statusFilter, deptFilter, scoreFilter, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(filteredCandidates.length / pageSize) || 1;
  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCandidates.slice(start, start + pageSize);
  }, [filteredCandidates, currentPage, pageSize]);

  // Select all handler
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedCandidates.length && paginatedCandidates.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedCandidates.map((c) => c.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSort = (field: keyof Candidate) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleInlineStatusChange = (id: string, newStatus: CandidateStatus) => {
    db.updateCandidate(id, { status: newStatus });
    reloadData();
    success("Status Updated", `Candidate status changed to ${newStatus}`);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    db.deleteCandidate(deleteTargetId);
    reloadData();
    setDeleteTargetId(null);
    success("Candidate Removed", "The application record has been permanently deleted.");
  };

  const exportToCsv = () => {
    const headers = [
      "ID",
      "Full Name",
      "Email",
      "Phone",
      "Position",
      "Department",
      "Experience (Years)",
      "Score",
      "Recommendation",
      "Status",
      "Application Date",
      "Source",
    ];

    const rows = filteredCandidates.map((c) => [
      c.id,
      `"${c.full_name}"`,
      c.email,
      c.phone,
      `"${c.position}"`,
      c.department,
      c.experience,
      c.score,
      `"${c.recommendation}"`,
      c.status,
      c.application_date,
      c.source,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HireFlow_Candidates_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("Export Complete", `Exported ${filteredCandidates.length} candidate rows to CSV.`);
  };

  const selectedCandidateObjects = candidates.filter((c) => selectedIds.includes(c.id));

  return (
    <div className="space-y-4">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {permissions.canManageIntegrations && (
            <Link href="/integrations">
              <Button variant="outline" size="sm" className="text-xs">
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                Sync Google Sheets
              </Button>
            </Link>
          )}

          <Button variant="outline" size="sm" onClick={exportToCsv} className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
            Export CSV
          </Button>

          {permissions.canScoreCandidates && (
            <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)} className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Candidate
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, skill, or role..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-blue-600"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview">Interview</option>
            <option value="Selected">Selected</option>
            <option value="Offer Sent">Offer Sent</option>
            <option value="Offer Accepted">Offer Accepted</option>
            <option value="Offer Rejected">Offer Rejected</option>
            <option value="Rejected">Rejected</option>
            <option value="On Hold">On Hold</option>
          </select>

          {/* Department filter */}
          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-blue-600"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Design">Design</option>
            <option value="Data Science">Data Science</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Finance">Finance</option>
          </select>

          {/* Score filter */}
          <select
            value={scoreFilter}
            onChange={(e) => {
              setScoreFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-blue-600"
          >
            <option value="All">All Scores</option>
            <option value="80+">80+ (Strong Match)</option>
            <option value="65-79">65 - 79 (Recommended)</option>
            <option value="50-64">50 - 64 (Review Req.)</option>
            <option value="<50">&lt; 50 (Low Match)</option>
          </select>

          {(searchQuery || statusFilter !== "All" || deptFilter !== "All" || scoreFilter !== "All") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
                setDeptFilter("All");
                setScoreFilter("All");
                setCurrentPage(1);
              }}
              className="text-xs text-slate-500 h-8"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Bulk selection actions bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
              {selectedIds.length}
            </span>
            <span>Candidates selected</span>
          </div>

          <div className="flex items-center gap-2">
            {permissions.canChangeStatus && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkModalMode("status")}
                className="bg-white text-xs h-7 px-2.5"
              >
                Change Status
              </Button>
            )}

            {permissions.canSendEmails && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkModalMode("email")}
                className="bg-white text-xs h-7 px-2.5 text-purple-700"
              >
                <Mail className="w-3 h-3 mr-1" />
                Send Bulk Email
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="text-xs h-7 px-2 text-slate-600 hover:text-slate-900"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-700 uppercase tracking-wider text-[11px] font-semibold select-none">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <button onClick={handleSelectAll} className="p-0.5 text-slate-500 hover:text-slate-900">
                    {selectedIds.length > 0 && selectedIds.length === paginatedCandidates.length ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="p-3.5 cursor-pointer hover:bg-slate-100/70" onClick={() => handleSort("full_name")}>
                  <div className="flex items-center gap-1.5">
                    <span>Candidate</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5 cursor-pointer hover:bg-slate-100/70" onClick={() => handleSort("position")}>
                  <div className="flex items-center gap-1.5">
                    <span>Role & Dept</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5 cursor-pointer hover:bg-slate-100/70" onClick={() => handleSort("experience")}>
                  <div className="flex items-center gap-1.5">
                    <span>Experience</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5 cursor-pointer hover:bg-slate-100/70" onClick={() => handleSort("score")}>
                  <div className="flex items-center gap-1.5">
                    <span>Score & Fit</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5 cursor-pointer hover:bg-slate-100/70" onClick={() => handleSort("status")}>
                  <div className="flex items-center gap-1.5">
                    <span>Pipeline Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5 cursor-pointer hover:bg-slate-100/70 hidden lg:table-cell" onClick={() => handleSort("application_date")}>
                  <div className="flex items-center gap-1.5">
                    <span>Applied</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <p className="text-sm font-semibold text-slate-700">No matching candidates found</p>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or import applications.</p>
                  </td>
                </tr>
              ) : (
                paginatedCandidates.map((cand) => {
                  const isSelected = selectedIds.includes(cand.id);
                  const statusStyle = getStatusBadgeClass(cand.status);
                  const recStyle = getRecommendationBadgeClass(cand.recommendation);

                  return (
                    <tr
                      key={cand.id}
                      className={`hover:bg-slate-50/80 transition-colors ${isSelected ? "bg-blue-50/40" : ""}`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleSelect(cand.id)}
                          className="p-0.5 text-slate-500 hover:text-slate-900"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>

                      {/* Candidate Name & Contact */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {cand.full_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/applications/${cand.id}`}
                              className="font-bold text-slate-900 hover:text-blue-600 truncate block transition-colors"
                            >
                              {cand.full_name}
                            </Link>
                            <p className="text-[11px] text-slate-400 truncate">{cand.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Position & Department */}
                      <td className="p-3.5">
                        <p className="font-medium text-slate-800 truncate max-w-[170px]">{cand.position}</p>
                        <p className="text-[11px] text-slate-400">{cand.department}</p>
                      </td>

                      {/* Experience */}
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800">{cand.experience} yrs</span>
                        <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          {cand.skills.slice(0, 2).join(", ")}
                        </p>
                      </td>

                      {/* Score & Recommendation */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs ${
                              cand.score >= 80
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : cand.score >= 65
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {cand.score}
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${recStyle.bg} ${recStyle.text} ${recStyle.border}`}>
                            {cand.recommendation}
                          </span>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-3.5">
                        {permissions.canChangeStatus ? (
                          <select
                            value={cand.status}
                            onChange={(e) => handleInlineStatusChange(cand.id, e.target.value as CandidateStatus)}
                            className={`text-xs font-semibold rounded-lg px-2.5 py-1 border cursor-pointer ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                          >
                            <option value="New">New</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Interview">Interview</option>
                            <option value="Selected">Selected</option>
                            <option value="Offer Sent">Offer Sent</option>
                            <option value="Offer Accepted">Offer Accepted</option>
                            <option value="Offer Rejected">Offer Rejected</option>
                            <option value="Rejected">Rejected</option>
                            <option value="On Hold">On Hold</option>
                          </select>
                        ) : (
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                            {cand.status}
                          </span>
                        )}
                      </td>

                      {/* Application Date */}
                      <td className="p-3.5 text-slate-500 hidden lg:table-cell">
                        {formatDate(cand.application_date)}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/applications/${cand.id}`}>
                            <button
                              title="View Candidate Dossier"
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>

                          {permissions.canGenerateOffers && (
                            <Link href={`/offer-letters?candidateId=${cand.id}`}>
                              <button
                                title="Draft Official Offer Letter"
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              >
                                <FileSignature className="w-4 h-4" />
                              </button>
                            </Link>
                          )}

                          {permissions.canManageUsers && (
                            <button
                              title="Delete Candidate"
                              onClick={() => setDeleteTargetId(cand.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredCandidates.length}
          pageSize={pageSize}
        />
      </div>

      {/* Modals */}
      <AddCandidateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCandidateAdded={() => reloadData()}
      />

      {bulkModalMode && (
        <BulkActionsModal
          isOpen={!!bulkModalMode}
          onClose={() => setBulkModalMode(null)}
          selectedCandidates={selectedCandidateObjects}
          mode={bulkModalMode}
          onSuccess={() => {
            reloadData();
            setSelectedIds([]);
          }}
        />
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Candidate Application"
        message="Are you sure you want to delete this candidate? All associated interview scores, notes, and activity history will be removed."
      />
    </div>
  );
};
