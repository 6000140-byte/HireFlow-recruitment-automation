import { Candidate, ScoringCriterion } from "@/types/candidate";
import { ColumnMapping } from "@/types/database";
import { autoEvaluateCandidate } from "../scoring/engine";
import { generateId } from "../utils";

export const DEFAULT_COLUMN_MAPPINGS: ColumnMapping[] = [
  { sheetColumn: "Timestamp", candidateField: "application_date" },
  { sheetColumn: "Full Name", candidateField: "full_name" },
  { sheetColumn: "Email Address", candidateField: "email" },
  { sheetColumn: "Phone Number", candidateField: "phone" },
  { sheetColumn: "Position Applied For", candidateField: "position" },
  { sheetColumn: "Department", candidateField: "department" },
  { sheetColumn: "Highest Education", candidateField: "education" },
  { sheetColumn: "Years of Experience", candidateField: "experience" },
  { sheetColumn: "Key Skills", candidateField: "skills" },
  { sheetColumn: "Resume Link", candidateField: "resume_url" },
  { sheetColumn: "LinkedIn / Portfolio", candidateField: "portfolio_url" },
  { sheetColumn: "Expected Salary", candidateField: "salary_expectation" },
  { sheetColumn: "Earliest Joining Date / Notice Period", candidateField: "availability" },
];

export const SAMPLE_GOOGLE_SHEET_CSV = `Timestamp,Full Name,Email Address,Phone Number,Position Applied For,Department,Highest Education,Years of Experience,Key Skills,Resume Link,LinkedIn / Portfolio,Expected Salary,Earliest Joining Date / Notice Period
2026-09-20 10:14:22,Sophia Rivera,sophia.rivera@example.com,+1 (555) 234-8901,Senior Frontend Engineer,Engineering,B.S. Computer Science (UC Berkeley),6,"React, TypeScript, Next.js, GraphQL, TailwindCSS",https://drive.google.com/file/d/sophia_resume.pdf,https://linkedin.com/in/sophiarivera,$145000,Immediate
2026-09-21 14:32:10,Liam Chen,liam.chen@example.com,+1 (555) 345-6789,Backend Architect,Engineering,M.S. Software Engineering (Stanford),8,"Go, Node.js, PostgreSQL, Kubernetes, AWS, Redis",https://drive.google.com/file/d/liam_resume.pdf,https://linkedin.com/in/liamchen,$170000,30 Days
2026-09-22 09:15:45,Amara Okafor,amara.okafor@example.com,+1 (555) 456-7890,Product Designer (UI/UX),Design,B.A. Interaction Design (RISD),4,"Figma, Design Systems, User Research, Prototyping",https://drive.google.com/file/d/amara_resume.pdf,https://amara.design,$115000,15 Days
2026-09-22 16:40:12,Lucas Vance,lucas.vance@example.com,+1 (555) 567-8901,Product Manager,Product,MBA (Wharton) & B.S. CS,5,"Agile, Jira, Roadmap Strategy, Product Analytics, SQL",https://drive.google.com/file/d/lucas_resume.pdf,https://linkedin.com/in/lucasvance,$150000,Immediate
2026-09-23 11:05:30,Maya Patel,maya.patel@example.com,+1 (555) 678-9012,DevOps Engineer,Engineering,B.Tech Information Tech,5,"Terraform, CI/CD, Docker, Prometheus, GCP",https://drive.google.com/file/d/maya_resume.pdf,https://linkedin.com/in/mayapatel,$135000,Immediate
2026-09-24 08:20:00,David Kim,david.kim@example.com,+1 (555) 789-0123,Account Executive,Sales,B.A. Business Administration,4,"Salesforce, Enterprise Sales, Lead Gen, B2B SaaS",https://drive.google.com/file/d/david_resume.pdf,https://linkedin.com/in/davidkim,$105000 + OTE,2 Weeks
`;

export function parseCsv(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length === 0) return { headers: [], rows: [] };

  // Helper to split CSV line honoring quotes
  const splitLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = "";
    let insideQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        result.push(cur.trim().replace(/^["']|["']$/g, ""));
        cur = "";
      } else {
        cur += char;
      }
    }
    result.push(cur.trim().replace(/^["']|["']$/g, ""));
    return result;
  };

  const headers = splitLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = splitLine(line);
    const rowObj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      rowObj[header] = values[idx] || "";
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

export function mapRowToCandidate(
  row: Record<string, string>,
  mappings: ColumnMapping[],
  criteria: ScoringCriterion[],
  organizationId = "org_default"
): Candidate {
  const candidateData: Partial<Candidate> = {
    id: generateId("cand"),
    organization_id: organizationId,
    status: "New",
    source: "Google Form",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    skills: [],
    experience: 0,
    education: "Bachelor's Degree",
    department: "Engineering",
    position: "Applicant",
    full_name: "Unnamed Applicant",
    email: "applicant@example.com",
    phone: "",
    application_date: new Date().toISOString().split("T")[0],
  };

  mappings.forEach((m) => {
    const rawVal = row[m.sheetColumn];
    if (rawVal === undefined || m.candidateField === "ignore") return;

    if (m.candidateField === "skills") {
      candidateData.skills = rawVal
        .split(/[,;|]/)
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (m.candidateField === "experience") {
      const parsedExp = parseFloat(rawVal.replace(/[^0-9.]/g, ""));
      candidateData.experience = isNaN(parsedExp) ? 0 : parsedExp;
    } else {
      (candidateData as any)[m.candidateField] = rawVal;
    }
  });

  // Calculate score & recommendation
  const evalResult = autoEvaluateCandidate(candidateData, criteria);
  candidateData.score = evalResult.totalScore;
  candidateData.recommendation = evalResult.recommendation;

  return candidateData as Candidate;
}

export function processBatchImport({
  csvContent,
  mappings,
  existingCandidates,
  criteria,
  preventDuplicates = true,
}: {
  csvContent: string;
  mappings: ColumnMapping[];
  existingCandidates: Candidate[];
  criteria: ScoringCriterion[];
  preventDuplicates?: boolean;
}): {
  importedCandidates: Candidate[];
  duplicatesCount: number;
  totalParsed: number;
  errors: string[];
} {
  const { rows } = parseCsv(csvContent);
  const importedCandidates: Candidate[] = [];
  let duplicatesCount = 0;
  const errors: string[] = [];
  const existingEmails = new Set(existingCandidates.map((c) => c.email.toLowerCase().trim()));

  rows.forEach((row, idx) => {
    try {
      const candidate = mapRowToCandidate(row, mappings, criteria);
      if (!candidate.email || !candidate.full_name) {
        errors.push(`Row ${idx + 1}: Missing required name or email.`);
        return;
      }

      const emailKey = candidate.email.toLowerCase().trim();
      if (preventDuplicates && existingEmails.has(emailKey)) {
        duplicatesCount++;
        return;
      }

      existingEmails.add(emailKey);
      importedCandidates.push(candidate);
    } catch (err: any) {
      errors.push(`Row ${idx + 1}: ${err.message}`);
    }
  });

  return {
    importedCandidates,
    duplicatesCount,
    totalParsed: rows.length,
    errors,
  };
}
