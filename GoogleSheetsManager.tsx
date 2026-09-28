"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  RefreshCw,
  Link2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  UploadCloud,
  FileDown,
  Sparkles,
} from "lucide-react";
import { IntegrationConfig, ColumnMapping } from "@/types/database";
import { db } from "@/lib/storage/db";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "../ui/Toast";
import {
  DEFAULT_COLUMN_MAPPINGS,
  SAMPLE_GOOGLE_SHEET_CSV,
  processBatchImport,
} from "@/lib/google/sheets-sync";
import { formatDateTime } from "@/lib/utils";
import { Button } from "../ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Switch } from "../ui/Switch";

export const GoogleSheetsManager: React.FC = () => {
  const { permissions } = useAuth();
  const { success, error, info } = useToast();

  const [integration, setIntegration] = useState<IntegrationConfig>(() => db.getIntegration());
  const [sheetUrl, setSheetUrl] = useState(integration.spreadsheet_url || "");
  const [worksheetName, setWorksheetName] = useState(integration.worksheet_name || "Form Responses 1");
  const [autoSync, setAutoSync] = useState(integration.auto_sync_enabled);
  const [syncFreq, setSyncFreq] = useState(integration.sync_frequency || "15m");
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>(
    integration.column_mappings || DEFAULT_COLUMN_MAPPINGS
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const handleConnectGoogle = () => {
    setIsConnected(true);
    success("Google Account Connected", "Authorized access to Google Sheets & Forms API.");
  };

  const handleSaveSettings = () => {
    const updated = db.updateIntegration({
      spreadsheet_url: sheetUrl,
      worksheet_name: worksheetName,
      auto_sync_enabled: autoSync,
      sync_frequency: syncFreq as any,
      column_mappings: columnMappings,
    });
    setIntegration(updated);
    success("Settings Saved", "Google Sheets synchronization configuration updated.");
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      // Simulate real fetch from Google Sheet or process sample CSV responses
      await new Promise((resolve) => setTimeout(resolve, 800));

      const criteria = db.getScoringCriteria();
      const existingCandidates = db.getCandidates();

      const result = processBatchImport({
        csvContent: SAMPLE_GOOGLE_SHEET_CSV,
        mappings: columnMappings,
        existingCandidates,
        criteria,
        preventDuplicates: true,
      });

      // Save imported candidates to db
      result.importedCandidates.forEach((cand) => {
        db.addCandidate(cand, "Google Sheets Sync");
      });

      const updated = db.updateIntegration({
        last_sync_at: new Date().toISOString(),
        sync_status: "success",
        total_synced_count: integration.total_synced_count + result.importedCandidates.length,
      });
      setIntegration(updated);

      success(
        "Sync Completed",
        `Imported ${result.importedCandidates.length} new application(s). ${result.duplicatesCount} duplicate(s) prevented.`
      );
    } catch (err: any) {
      error("Sync Error", err.message);
      db.updateIntegration({
        sync_status: "error",
        last_error_message: err.message,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadSampleCsv = () => {
    const blob = new Blob([SAMPLE_GOOGLE_SHEET_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Sample_Google_Form_Responses.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    info("CSV Downloaded", "Sample Google Form responses CSV downloaded.");
  };

  const candidateFields = [
    { field: "application_date", label: "Application Date / Timestamp" },
    { field: "full_name", label: "Candidate Full Name" },
    { field: "email", label: "Email Address" },
    { field: "phone", label: "Phone Number" },
    { field: "position", label: "Position Applied For" },
    { field: "department", label: "Department" },
    { field: "education", label: "Highest Education" },
    { field: "experience", label: "Years of Experience" },
    { field: "skills", label: "Technical / Core Skills" },
    { field: "resume_url", label: "Resume Drive URL" },
    { field: "portfolio_url", label: "LinkedIn / Portfolio Link" },
    { field: "salary_expectation", label: "Salary Expectation" },
    { field: "availability", label: "Notice Period / Availability" },
    { field: "ignore", label: "-- Ignore Column --" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Google Sheets & Forms Integration</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Connect live Google Sheets, map custom form fields, and automatically import and score applicants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadSampleCsv} className="text-xs">
            <FileDown className="w-3.5 h-3.5 mr-1.5" />
            Download Sample CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleManualSync}
            isLoading={isSyncing}
            className="text-xs bg-emerald-600 hover:bg-emerald-700"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Sync Now
          </Button>
        </div>
      </div>

      {/* Integration Status Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Google Drive & Sheets Connector</h3>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Connected & Syncing
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Last Synced: <strong className="text-slate-800">{formatDateTime(integration.last_sync_at)}</strong> • Total Synced:{" "}
              <strong className="text-blue-600 font-bold">{integration.total_synced_count} Applications</strong>
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={handleConnectGoogle} className="text-xs">
          <Link2 className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
          Re-authenticate Google
        </Button>
      </div>

      {/* Configuration & Column Mapping */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sync Settings */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sheet Source Settings</CardTitle>
              <CardDescription>Target Google Spreadsheet and sync frequency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Google Sheet URL"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />

              <Input
                label="Worksheet Tab Name"
                value={worksheetName}
                onChange={(e) => setWorksheetName(e.target.value)}
                placeholder="Form Responses 1"
              />

              <Select
                label="Auto-Sync Schedule Interval"
                value={syncFreq}
                onChange={(e) => setSyncFreq(e.target.value)}
                options={[
                  { value: "5m", label: "Every 5 Minutes (Real-time)" },
                  { value: "15m", label: "Every 15 Minutes (Recommended)" },
                  { value: "1h", label: "Every 1 Hour" },
                  { value: "manual", label: "Manual Sync Only" },
                ]}
              />

              <Switch
                checked={autoSync}
                onChange={setAutoSync}
                label="Enable Background Auto-Sync"
                description="Automatically import new Google Form submissions as they arrive"
              />

              <div className="pt-2 border-t border-slate-100">
                <Button variant="primary" size="sm" onClick={handleSaveSettings} className="w-full text-xs">
                  Save Sync Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visual Column Mapping */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Visual Column Mapping</CardTitle>
              <CardDescription>
                Map headers from your Google Form responses to HireFlow candidate database schema
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[11px] font-semibold">
                    <tr>
                      <th className="p-3.5">Google Form / Sheet Column</th>
                      <th className="p-3.5 text-center w-12"></th>
                      <th className="p-3.5">HireFlow Candidate Field</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {columnMappings.map((mapping, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="p-3.5 font-bold text-slate-900">{mapping.sheetColumn}</td>
                        <td className="p-3.5 text-center text-slate-400">
                          <ArrowRight className="w-4 h-4 mx-auto" />
                        </td>
                        <td className="p-3.5">
                          <select
                            value={mapping.candidateField}
                            onChange={(e) => {
                              const updated = [...columnMappings];
                              updated[idx].candidateField = e.target.value as any;
                              setColumnMappings(updated);
                            }}
                            className="text-xs rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-blue-600 w-full max-w-xs"
                          >
                            {candidateFields.map((f) => (
                              <option key={f.field} value={f.field}>
                                {f.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
