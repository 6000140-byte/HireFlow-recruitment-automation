"use client";

import React, { useState } from "react";
import { MessageSquare, Plus, Tag, Trash2, AtSign } from "lucide-react";
import { CandidateNote } from "@/types/candidate";
import { useAuth } from "@/lib/auth/context";
import { db } from "@/lib/storage/db";
import { formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Textarea";
import { useToast } from "../ui/Toast";

export const NotesSection: React.FC<{ candidateId: string }> = ({ candidateId }) => {
  const { user, permissions } = useAuth();
  const { success } = useToast();

  const [notes, setNotes] = useState<CandidateNote[]>(() => db.getNotesByCandidate(candidateId));
  const [newNoteText, setNewNoteText] = useState("");
  const [selectedTag, setSelectedTag] = useState("Technical Assessment");
  const [isAdding, setIsAdding] = useState(false);

  const availableTags = ["Technical Assessment", "Culture & Leadership", "Compensation Negotiation", "Reference Check", "General"];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !user) return;

    const created = db.addNote(candidateId, newNoteText.trim(), user, [selectedTag]);
    setNotes(db.getNotesByCandidate(candidateId));
    setNewNoteText("");
    setIsAdding(false);
    success("Note Added", "Your evaluation feedback has been saved.");
  };

  const handleDeleteNote = (noteId: string) => {
    db.deleteNote(noteId);
    setNotes(db.getNotesByCandidate(candidateId));
    success("Note Removed", "Evaluation note removed.");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            Internal Reviewer Notes & Feedback
          </CardTitle>
          <CardDescription>Collaborative notes visible only to hiring committee</CardDescription>
        </div>

        {permissions.canAddNotes && !isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)} className="text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Note
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {isAdding && (
          <form onSubmit={handleAddNote} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <Textarea
              placeholder="Enter your evaluation notes, interview feedback, or discussion points..."
              rows={3}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              required
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-slate-700"
                >
                  {availableTags.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Note
                </Button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {notes.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 italic">
              No reviewer notes yet. Be the first to leave candidate feedback.
            </p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{note.user_name}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                      {note.user_role}
                    </span>
                    <span className="text-[11px] text-slate-400">• {formatDateTime(note.created_at)}</span>
                  </div>

                  {permissions.canManageUsers && (
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{note.note}</p>

                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {note.tags.map((tag, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-[10px] font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
