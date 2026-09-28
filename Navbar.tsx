"use client";

import React, { useState } from "react";
import {
  Menu,
  Bell,
  Search,
  Plus,
  Shield,
  Check,
  ChevronDown,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { UserRole } from "@/types/auth";
import { roleDisplayNames } from "@/lib/permissions";
import { Button } from "../ui/Button";
import { QuickActionsModal } from "../dashboard/QuickActionsModal";

export const Navbar: React.FC<{ onOpenMobileMenu: () => void }> = ({ onOpenMobileMenu }) => {
  const { user, role, switchRole, isDemoMode } = useAuth();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  const availableRoles: { role: UserRole; desc: string }[] = [
    { role: "super_admin", desc: "Full administrative access & settings" },
    { role: "recruiter", desc: "Score, email, and generate offers" },
    { role: "reviewer", desc: "Evaluate candidates & submit notes" },
    { role: "viewer", desc: "Read-only access to dashboard" },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Workspace:</span>
            <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
              HireFlow HQ
            </span>
          </div>
        </div>

        {/* Center: Demo Mode Role Switcher */}
        <div className="flex items-center gap-2">
          {isDemoMode && (
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors shadow-xs"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="hidden sm:inline">Role:</span>
                <span className="text-amber-900 font-bold underline decoration-dotted">{roleDisplayNames(role)}</span>
                <ChevronDown className="w-3.5 h-3.5 text-amber-600" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute top-full mt-2 right-0 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-blue-600" /> Switch Test Persona
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Instantly preview HireFlow under different RBAC permission tiers.
                    </p>
                  </div>
                  <div className="p-1 space-y-0.5">
                    {availableRoles.map((item) => (
                      <button
                        key={item.role}
                        onClick={() => {
                          switchRole(item.role);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`w-full flex items-start gap-2.5 px-3 py-2 text-left rounded-lg text-xs transition-colors ${
                          role === item.role ? "bg-blue-50 text-blue-900 font-semibold" : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{roleDisplayNames(item.role)}</p>
                          <p className="text-[10px] text-slate-500">{item.desc}</p>
                        </div>
                        {role === item.role && <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsQuickActionOpen(true)}
            className="hidden sm:inline-flex bg-slate-900 hover:bg-slate-800 text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Quick Action
          </Button>

          <a
            href="https://docs.google.com/forms"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors hidden md:block"
            title="Open Google Forms"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {user?.full_name?.charAt(0) || "A"}
            </div>
          </div>
        </div>
      </header>

      {/* Quick Action Modal Dialog */}
      <QuickActionsModal isOpen={isQuickActionOpen} onClose={() => setIsQuickActionOpen(false)} />
    </>
  );
};
