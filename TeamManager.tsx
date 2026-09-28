"use client";

import React, { useState } from "react";
import { UserPlus, Shield, Trash2, Edit2, Mail, CheckCircle2 } from "lucide-react";
import { UserProfile, UserRole } from "@/types/auth";
import { db } from "@/lib/storage/db";
import { useAuth } from "@/lib/auth/context";
import { roleDisplayNames } from "@/lib/permissions";
import { useToast } from "../ui/Toast";
import { Button } from "../ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

export const TeamManager: React.FC = () => {
  const { user: currentUser, permissions } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState<UserProfile[]>(() => db.getUsers());
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("recruiter");

  const reload = () => {
    setUsers(db.getUsers());
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) {
      error("Missing Information", "Please enter member name and email.");
      return;
    }

    db.addUser({
      full_name: inviteName,
      email: inviteEmail,
      role: inviteRole,
    });

    success("Member Invited", `Invitation sent to ${inviteEmail} with role ${roleDisplayNames(inviteRole)}.`);
    setIsInviteModalOpen(false);
    setInviteName("");
    setInviteEmail("");
    reload();
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    db.updateUserRole(userId, newRole);
    reload();
    success("Role Updated", `Permissions updated for team member.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Team & Role-Based Access Control</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage organization members, reviewers, and permission tiers (Super Admin, Recruiter, Reviewer, Viewer).
          </p>
        </div>

        {permissions.canManageUsers && (
          <Button variant="primary" size="sm" onClick={() => setIsInviteModalOpen(true)} className="text-xs">
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            Invite Team Member
          </Button>
        )}
      </div>

      {/* Role Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between font-bold text-slate-900">
            <span>Super Admin</span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-slate-500 text-[11px]">Full access to system, users, settings, integrations & audit logs.</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between font-bold text-slate-900">
            <span>Recruiter</span>
            <Shield className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-slate-500 text-[11px]">Score candidates, dispatch emails, issue and generate offer letters.</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between font-bold text-slate-900">
            <span>Reviewer</span>
            <Shield className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-slate-500 text-[11px]">Evaluate assigned applicants, submit scores, and add internal notes.</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between font-bold text-slate-900">
            <span>Viewer</span>
            <Shield className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-slate-500 text-[11px]">Read-only access to dashboard charts and candidate profiles.</p>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Members ({users.length})</CardTitle>
          <CardDescription>Active users with access to HireFlow</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="p-3.5">User Profile</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Assigned Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                          {u.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.full_name}</p>
                          {currentUser?.id === u.id && (
                            <span className="text-[10px] text-blue-600 font-bold">(You)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">{u.email}</td>
                    <td className="p-3.5">
                      {permissions.canManageUsers && currentUser?.id !== u.id ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-slate-800 font-semibold focus:outline-none focus:border-blue-600"
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="recruiter">Recruiter</option>
                          <option value="reviewer">Reviewer</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      ) : (
                        <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                          {roleDisplayNames(u.role)}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </td>
                    <td className="p-3.5 text-right text-slate-400">
                      {currentUser?.id === u.id ? "Current Session" : "Managed"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite New Team Member"
        maxWidth="md"
      >
        <form onSubmit={handleInviteUser} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Liam Cooper"
            value={inviteName}
            required
            onChange={(e) => setInviteName(e.target.value)}
          />

          <Input
            label="Work Email Address"
            type="email"
            placeholder="liam@hireflow.io"
            value={inviteEmail}
            required
            onChange={(e) => setInviteEmail(e.target.value)}
          />

          <Select
            label="Select Role & Permission Level"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as UserRole)}
            options={[
              { value: "super_admin", label: "Super Admin (Full Management)" },
              { value: "recruiter", label: "Recruiter (Score, Email & Issue Offers)" },
              { value: "reviewer", label: "Reviewer (Score & Add Notes)" },
              { value: "viewer", label: "Viewer (Read Only Dashboard)" },
            ]}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
