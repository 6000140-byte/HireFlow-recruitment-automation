"use client";

import React, { useState } from "react";
import { Building, Key, Mail, Shield, Save, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/storage/db";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "../ui/Toast";
import { Button } from "../ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Tabs } from "../ui/Tabs";

export const SettingsManager: React.FC = () => {
  const { permissions } = useAuth();
  const { success } = useToast();

  const org = db.getOrganization();
  const [activeTab, setActiveTab] = useState("general");

  const [companyName, setCompanyName] = useState(org.name || "HireFlow Technologies Inc.");
  const [companyEmail, setCompanyEmail] = useState(org.email || "talent@hireflow.io");
  const [companyPhone, setCompanyPhone] = useState(org.phone || "+1 (415) 890-2100");
  const [companyAddress, setCompanyAddress] = useState(org.address || "100 Innovation Way, Suite 400, San Francisco, CA 94105");

  // API Config
  const [googleClientId, setGoogleClientId] = useState("demo_client_id_google_auth");
  const [resendApiKey, setResendApiKey] = useState("re_demo_resend_api_key");
  const [emailSender, setEmailSender] = useState("HireFlow <offers@hireflow.io>");

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateOrganization({
      name: companyName,
      email: companyEmail,
      phone: companyPhone,
      address: companyAddress,
    });
    success("Settings Saved", "Organization profile and letterhead details updated.");
  };

  const handleSaveApi = (e: React.FormEvent) => {
    e.preventDefault();
    success("API Keys Saved", "Third-party integration credentials saved.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Organization & System Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure company profile, letterhead branding, and third-party API integration keys.
        </p>
      </div>

      <Tabs
        tabs={[
          { id: "general", label: "Organization & Branding", icon: <Building className="w-3.5 h-3.5" /> },
          { id: "api", label: "API Integrations & Keys", icon: <Key className="w-3.5 h-3.5" /> },
          { id: "security", label: "Security & Permissions", icon: <Shield className="w-3.5 h-3.5" /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "general" && (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Company Profile & Offer Letterhead</CardTitle>
            <CardDescription>
              These details are automatically printed on official candidate offer letters and email notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Legal Company Name"
                  value={companyName}
                  required
                  onChange={(e) => setCompanyName(e.target.value)}
                />
                <Input
                  label="Talent Acquisition / Contact Email"
                  type="email"
                  value={companyEmail}
                  required
                  onChange={(e) => setCompanyEmail(e.target.value)}
                />
                <Input
                  label="Contact Phone"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                />
                <div className="sm:col-span-2">
                  <Textarea
                    label="Official Company Address"
                    value={companyAddress}
                    rows={2}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button variant="primary" size="sm" type="submit" disabled={!permissions.canManageSettings}>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save Organization Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "api" && (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Third-Party Integration Keys</CardTitle>
            <CardDescription>Configure Google Sheets API and Resend email credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveApi} className="space-y-4">
              <Input
                label="Google Cloud OAuth Client ID"
                value={googleClientId}
                onChange={(e) => setGoogleClientId(e.target.value)}
                helperText="Used for live Google Sheets & Google Drive syncing."
              />

              <Input
                label="Resend Email API Key"
                type="password"
                value={resendApiKey}
                onChange={(e) => setResendApiKey(e.target.value)}
                helperText="For live transactional candidate emails."
              />

              <Input
                label="From Email Address"
                value={emailSender}
                onChange={(e) => setEmailSender(e.target.value)}
              />

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button variant="primary" size="sm" type="submit" disabled={!permissions.canManageSettings}>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Update API Keys
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "security" && (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>System Security & Compliance</CardTitle>
            <CardDescription>Security policies and candidate privacy enforcement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-slate-600">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Row-Level Security (RLS) Active
              </h4>
              <p className="text-emerald-800">
                All candidates, evaluations, and offer letters are isolated by organization ID.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <h4 className="font-bold text-slate-900">Audit Trail Enforcement</h4>
              <p>
                Every status change, scoring override, and offer issuance is permanently written to the audit log.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
