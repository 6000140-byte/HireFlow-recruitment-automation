"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Mail,
  FileSignature,
  Sliders,
  Link2,
  BarChart3,
  ShieldAlert,
  Settings,
  Sparkles,
  UserPlus,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { roleDisplayNames } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export const Sidebar: React.FC<{ isMobileOpen?: boolean; onCloseMobile?: () => void }> = ({
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const { user, role, permissions, logout } = useAuth();

  const navSections = [
    {
      title: "Recruitment Pipeline",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, visible: true },
        { href: "/applications", label: "All Applications", icon: Users, visible: permissions.canViewApplications },
        { href: "/shortlisted", label: "Shortlisted", icon: UserCheck, visible: permissions.canViewApplications },
        { href: "/selected", label: "Selected", icon: CheckCircle2, visible: permissions.canViewApplications },
        { href: "/rejected", label: "Rejected", icon: XCircle, visible: permissions.canViewApplications },
        { href: "/offer-letters", label: "Offer Letters", icon: FileSignature, visible: permissions.canGenerateOffers || role === "super_admin" || role === "recruiter" || role === "viewer" },
      ],
    },
    {
      title: "Automation & Templates",
      items: [
        { href: "/email-templates", label: "Email Templates", icon: Mail, visible: permissions.canManageTemplates || role === "recruiter" || role === "super_admin" },
        { href: "/offer-letter-templates", label: "Offer Templates", icon: FileText, visible: permissions.canManageTemplates || role === "super_admin" },
        { href: "/selection-criteria", label: "Selection Criteria", icon: Sliders, visible: permissions.canManageCriteria || role === "super_admin" },
        { href: "/integrations", label: "Integrations & Sync", icon: Link2, visible: permissions.canManageIntegrations || role === "super_admin" || role === "recruiter" },
      ],
    },
    {
      title: "Analytics & Organization",
      items: [
        { href: "/reports", label: "Reports & Analytics", icon: BarChart3, visible: permissions.canViewReports },
        { href: "/team", label: "Team & Roles", icon: UserPlus, visible: permissions.canManageUsers || role === "super_admin" },
        { href: "/audit-logs", label: "Audit Logs", icon: ShieldAlert, visible: permissions.canViewAuditLogs || role === "super_admin" },
        { href: "/settings", label: "Settings", icon: Settings, visible: permissions.canManageSettings || role === "super_admin" },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-white text-lg tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>HireFlow</span>
          </Link>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
            PRO
          </span>
        </div>

        {/* Navigation items list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, idx) => {
            const visibleItems = section.items.filter((item) => item.visible);
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  {section.title}
                </div>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                        isActive
                          ? "bg-blue-600 text-white font-semibold shadow-sm"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/70"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 transition-colors shrink-0",
                          isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* User profile & Role status bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900 border border-slate-800/80">
            <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 font-semibold flex items-center justify-center text-xs shrink-0">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name || "Admin User"}</p>
              <p className="text-[11px] text-blue-400 font-medium truncate">{roleDisplayNames(role)}</p>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
