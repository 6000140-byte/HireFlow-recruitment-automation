import {
  MOCK_CANDIDATES,
  MOCK_SCORING_CRITERIA,
  MOCK_EMAIL_TEMPLATES,
  MOCK_OFFER_TEMPLATES,
  MOCK_OFFER_LETTERS,
  MOCK_NOTES,
  MOCK_EMAIL_LOGS,
  MOCK_AUDIT_LOGS,
  MOCK_INTEGRATION,
  MOCK_USERS,
  MOCK_ORGANIZATION,
} from "./mock-data";
import { Candidate, CandidateStatus, ScoringCriterion, CandidateNote, RecommendationType } from "@/types/candidate";
import { EmailTemplate, EmailLog } from "@/types/email";
import { OfferLetterTemplate, OfferLetter, OfferStatus } from "@/types/offer";
import { IntegrationConfig, AuditLog, DashboardSummary } from "@/types/database";
import { UserProfile, Organization } from "@/types/auth";
import { generateId } from "../utils";

const STORAGE_KEYS = {
  CANDIDATES: "hireflow_candidates",
  CRITERIA: "hireflow_criteria",
  EMAIL_TEMPLATES: "hireflow_email_templates",
  OFFER_TEMPLATES: "hireflow_offer_templates",
  OFFER_LETTERS: "hireflow_offer_letters",
  NOTES: "hireflow_notes",
  EMAIL_LOGS: "hireflow_email_logs",
  AUDIT_LOGS: "hireflow_audit_logs",
  INTEGRATION: "hireflow_integration",
  USERS: "hireflow_users",
  ORGANIZATION: "hireflow_org",
};

// In-memory singletons for server-side / SSR environments
let memoryCandidates = [...MOCK_CANDIDATES];
let memoryCriteria = [...MOCK_SCORING_CRITERIA];
let memoryEmailTemplates = [...MOCK_EMAIL_TEMPLATES];
let memoryOfferTemplates = [...MOCK_OFFER_TEMPLATES];
let memoryOfferLetters = [...MOCK_OFFER_LETTERS];
let memoryNotes = [...MOCK_NOTES];
let memoryEmailLogs = [...MOCK_EMAIL_LOGS];
let memoryAuditLogs = [...MOCK_AUDIT_LOGS];
let memoryIntegration = { ...MOCK_INTEGRATION };
let memoryUsers = [...MOCK_USERS];
let memoryOrg = { ...MOCK_ORGANIZATION };

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getFromStorage<T>(key: string, defaultVal: T): T {
  if (!isBrowser()) return defaultVal;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function saveToStorage<T>(key: string, val: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(`Error saving to localStorage [${key}]:`, e);
  }
}

export const db = {
  // --- ORGANIZATION & USERS ---
  getOrganization: (): Organization => {
    if (isBrowser()) return getFromStorage(STORAGE_KEYS.ORGANIZATION, memoryOrg);
    return memoryOrg;
  },
  updateOrganization: (updates: Partial<Organization>): Organization => {
    memoryOrg = { ...memoryOrg, ...updates, updated_at: new Date().toISOString() };
    if (isBrowser()) saveToStorage(STORAGE_KEYS.ORGANIZATION, memoryOrg);
    return memoryOrg;
  },
  getUsers: (): UserProfile[] => {
    if (isBrowser()) return getFromStorage(STORAGE_KEYS.USERS, memoryUsers);
    return memoryUsers;
  },
  getUserById: (id: string): UserProfile | undefined => {
    const users = db.getUsers();
    return users.find((u) => u.id === id || u.user_id === id);
  },
  addUser: (user: Partial<UserProfile>): UserProfile => {
    const users = db.getUsers();
    const newUser: UserProfile = {
      id: generateId("usr"),
      user_id: generateId("usr"),
      organization_id: "org_default",
      full_name: user.full_name || "New Team Member",
      email: user.email || "user@hireflow.io",
      role: user.role || "viewer",
      avatar_url: user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.full_name || "User")}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newUser, ...users];
    memoryUsers = updated;
    if (isBrowser()) saveToStorage(STORAGE_KEYS.USERS, updated);
    db.logAudit({
      action: "USER_INVITED",
      entity_type: "user",
      entity_id: newUser.id,
      metadata: { email: newUser.email, role: newUser.role },
    });
    return newUser;
  },
  updateUserRole: (userId: string, role: UserProfile["role"]): UserProfile | undefined => {
    const users = db.getUsers();
    const idx = users.findIndex((u) => u.id === userId || u.user_id === userId);
    if (idx === -1) return undefined;
    users[idx] = { ...users[idx], role, updated_at: new Date().toISOString() };
    memoryUsers = users;
    if (isBrowser()) saveToStorage(STORAGE_KEYS.USERS, users);
    db.logAudit({
      action: "USER_ROLE_UPDATED",
      entity_type: "user",
      entity_id: userId,
      metadata: { newRole: role },
    });
    return users[idx];
  },

  // --- CANDIDATES ---
  getCandidates: (): Candidate[] => {
    if (isBrowser()) return getFromStorage(STORAGE_KEYS.CANDIDATES, memoryCandidates);
    return memoryCandidates;
  },
  getCandidateById: (id: string): Candidate | undefined => {
    const list = db.getCandidates();
    return list.find((c) => c.id === id);
  },
  addCandidate: (candidate: Partial<Candidate>, actor = "Admin"): Candidate => {
    const list = db.getCandidates();
    const newCand: Candidate = {
      id: generateId("cand"),
      organization_id: "org_default",
      full_name: candidate.full_name || "Unnamed Candidate",
      email: candidate.email || "candidate@example.com",
      phone: candidate.phone || "",
      address: candidate.address || "",
      date_of_birth: candidate.date_of_birth,
      position: candidate.position || "Software Engineer",
      department: candidate.department || "Engineering",
      education: candidate.education || "Bachelor's Degree",
      experience: candidate.experience || 0,
      skills: candidate.skills || [],
      certifications: candidate.certifications || [],
      resume_url: candidate.resume_url || "",
      portfolio_url: candidate.portfolio_url || "",
      linkedin_url: candidate.linkedin_url || "",
      application_date: candidate.application_date || new Date().toISOString().split("T")[0],
      score: candidate.score || 70,
      recommendation: candidate.recommendation || "Recommended",
      status: candidate.status || "New",
      source: candidate.source || "Manual",
      assigned_reviewer_id: candidate.assigned_reviewer_id,
      assigned_reviewer_name: candidate.assigned_reviewer_name,
      salary_expectation: candidate.salary_expectation,
      availability: candidate.availability,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newCand, ...list];
    memoryCandidates = updated;
    if (isBrowser()) saveToStorage(STORAGE_KEYS.CANDIDATES, updated);

    db.logAudit({
      action: "CANDIDATE_CREATED",
      entity_type: "candidate",
      entity_id: newCand.id,
      metadata: { name: newCand.full_name, position: newCand.position },
    });
    return newCand;
  },
  updateCandidate: (id: string, updates: Partial<Candidate>, actor = "Admin"): Candidate | undefined => {
    const list = db.getCandidates();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    const prev = list[idx];
    const updatedCand: Candidate = {
      ...prev,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updatedCand;
    memoryCandidates = list;
    if (isBrowser()) saveToStorage(STORAGE_KEYS.CANDIDATES, list);

    if (updates.status && updates.status !== prev.status) {
      db.logAudit({
        action: "STATUS_CHANGED",
        entity_type: "candidate",
        entity_id: id,
        metadata: { candidate: prev.full_name, previousStatus: prev.status, newStatus: updates.status },
      });
    }
    return updatedCand;
  },
  deleteCandidate: (id: string, actor = "Admin"): boolean => {
    const list = db.getCandidates();
    const target = list.find((c) => c.id === id);
    if (!target) return false;
    const filtered = list.filter((c) => c.id !== id);
    memoryCandidates = filtered;
    if (isBrowser()) saveToStorage(STORAGE_KEYS.CANDIDATES, filtered);

    db.logAudit({
      action: "CANDIDATE_DELETED",
      entity_type: "candidate",
      entity_id: id,
      metadata: { candidate: target.full_name, position: target.position },
    });
    return true;
  },
  bulkUpdateStatus: (ids: string[], status: CandidateStatus, actor = "Admin"): number => {
    const list = db.getCandidates();
    let updatedCount = 0;
    const updatedList = list.map((c) => {
      if (ids.includes(c.id)) {
        updatedCount++;
        return { ...c, status, updated_at: new Date().toISOString() };
      }
      return c;
    });
    memoryCandidates = updatedList;
    if (isBrowser()) saveToStorage(STORAGE_KEYS.CANDIDATES, updatedList);

    db.logAudit({
      action: "BULK_STATUS_UPDATED",
      entity_type: "candidate",
      entity_id: ids.join(","),
      metadata: { count: updatedCount, newStatus: status },
    });
    return updatedCount;
  },
  overrideCandidateScore: (
    id: string,
    score: number,
    recommendation: RecommendationType,
    reason: string,
    actor = "Recruiter"
  ): Candidate | undefined => {
    const list = db.getCandidates();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    const prev = list[idx];
    const updatedCand: Candidate = {
      ...prev,
      score,
      recommendation,
      recommendation_override_reason: reason,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updatedCand;
    memoryCandidates = list;
    if (isBrowser()) saveToStorage(STORAGE_KEYS.CANDIDATES, list);

    db.logAudit({
      action: "SCORE_OVERRIDDEN",
      entity_type: "candidate",
      entity_id: id,
      metadata: {
        candidate: prev.full_name,
        prevScore: prev.score,
        newScore: score,
        prevRecommendation: prev.recommendation,
        newRecommendation: recommendation,
        reason,
      },
    });
    return updatedCand;
  },

  // --- SCORING CRITERIA ---
  getScoringCriteria: (): ScoringCriterion[] => {
    if (isBrowser()) return getFromStorage(STORAGE_KEYS.CRITERIA, memoryCriteria);
    return memoryCriteria;
  },
  addScoringCriterion: (crit: Partial<ScoringCriterion>): ScoringCriterion => {
    const list = db.getScoringCriteria();
    const newCrit: ScoringCriterion = {
      id: generateId("crit"),
      organization_id: "org_default",
      name: crit.name || "New Criterion",
      description: crit.description || "",
      weight: crit.weight || 20,
      maximum_score: crit.maximum_score || 100,
      minimum_requirement: crit.minimum_requirement,
      enabled: crit.enabled !== undefined ? crit.enabled : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [...list, newCrit];
    memoryCriteria = updated;
    if (isBrowser()) saveToStorage(STORAGE_KEYS.CRITERIA, updated);
    db.logAudit({ action: "CRITERIA_CREATED", entity_type: "criteria", entity_id: newCrit.id, metadata: { name: newCrit.name } });
    return newCrit;
  },
  updateScoringCriterion: (id: string, updates: Partial<ScoringCriterion>): ScoringCriterion | undefined => {
    const list = db.getScoringCriteria();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    memoryCriteria = list;
    if (isBrowser()) saveToStorage(STORAGE_KEYS.CRITERIA, list);
    db.logAudit({ action: "CRITERIA_UPDATED", entity_type: "criteria", entity_id: id, metadata: updates });
    return list[idx];
  },
  deleteScoringCriterion: (id: string): boolean => {
    const list = db.getScoringCriteria();
    const filtered = list.filter((c) => c.id !== id);
    memoryCriteria = filtered;
    if (isBrowser()) saveToStorage(STORAGE_KEYS.CRITERIA, filtered);
    db.logAudit({ action: "CRITERIA_DELETED", entity_type: "criteria", entity_id: id });
    return true;
  },

  // --- EMAIL TEMPLATES & LOGS ---
  getEmailTemplates: (): EmailTemplate[] => {
    if (isBrowser()) return getFromStorage(STORAGE_KEYS.EMAIL_TEMPLATES, memoryEmailTemplates);
    return memoryEmailTemplates;
  },
  addEmailTemplate: (tpl: Partial<EmailTemplate>): EmailTemplate => {
    const list = db.getEmailTemplates();
    const newTpl: EmailTemplate = {
      id: generateId("tpl"),
      organization_id: "org_default",
      name: tpl.name || "Custom Template",
      template_type: tpl.template_type || "application_received",
      subject: tpl.subject || "Application Update",
      body: tpl.body || "",
      enabled: tpl.enabled !== undefined ? tpl.enabled : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [...list, newTpl];
    memoryEmailTemplates = updated;
    if (isBrowser()) saveToStorage(STORAGE_KEYS.EMAIL_TEMPLATES, updated);
    db.logAudit({ action: "EMAIL_TEMPLATE_CREATED", entity_type: "email", entity_id: newTpl.id, metadata: { name: newTpl.name } });
    return newTpl;
  },
  updateEmailTemplate: (id: string, updates: Partial<EmailTemplate>): EmailTemplate | undefined => {
    const list = db.getEmailTemplates();
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    memoryEmailTemplates = list;
    if (isBrowser()) saveToStorage(STORAGE_KEYS.EMAIL_TEMPLATES, list);
    return list[idx];
  },
  deleteEmailTemplate: (id: string): boolean => {
    const list = db.getEmailTemplates();
    const filtered = list.filter((t) => t.id !== id);
    memoryEmailTemplates = filtered;
    if (isBrowser()) saveToStorage(STORAGE_KEYS.EMAIL_TEMPLATES, filtered);
    return true;
  },
  getEmailLogs: (): EmailLog[] => {
    if (isBrowser()) return getFromStorage(STORAGE_KEYS.EMAIL_LOGS, memoryEmailLogs);
    return memoryEmailLogs;
  },
  logEmail: (log: EmailLog): void => {
    const list = db.getEmailLogs();
    const updated = [log, ...list];
    memoryEmailLogs = updated;
    if (isBrowser()) saveToStorage(STORAGE_KEYS.EMAIL_LOGS, updated);
  },

  // --- OFFER LETTER TEMPLATES & OFFERS ---
  getOfferLetterTemplates: (): OfferLetterTemplate[] => {
    if (isBrowser()) return getFromStorage(STORAGE_KEYS.OFFER_TEMPLATES, memoryOfferTemplates);
    return memoryOfferTemplates;
  },
  addOfferLetterTemplate: (tpl: Partial<OfferLetterTemplate>): OfferLetterTemplate => {
    const list = db.getOfferLetterTemplates();
    const newTpl: OfferLetterTemplate = {
      id: generateId("off_tpl"),
      organization_id: "org_default",
      name: tpl.name || "New Offer Template",
      content: tpl.content || "",
      enabled: tpl.enabled !== undefined ? tpl.enabled : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [...list, newTpl];
    memoryOfferTemplates = updated;
    if (isBrowser()) saveToStorage(STORAGE_KEYS.OFFER_TEMPLATES, updated);
    return newTpl;
  },
  updateOfferLetterTemplate: (id: string, updates: Partial<OfferLetterTemplate>): OfferLetterTemplate | undefined => {
    const list = db.getOfferLetterTemplates();
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    memoryOfferTemplates = list;
    if (isBrowser()) saveToStorage(STORAGE_KEYS.OFFER_TEMPLATES, list);
    return list[idx];
  },
  deleteOfferLetterTemplate: (id: string): boolean => {
    const list = db.getOfferLetterTemplates();
    const filtered = list.filter((t) => t.id !== id);
    memoryOfferTemplates = filtered;
    if (isBrowser()) saveToStorage(STORAGE_KEYS.OFFER_TEMPLATES, filtered);
    return true;
  },

  getOfferLetters: (): OfferLetter[] => {
    if (isBrowser()) return getFromStorage(STORAGE_KEYS.OFFER_LETTERS, memoryOfferLetters);
    return memoryOfferLetters;
  },
  getOfferLetterById: (id: string): OfferLetter | undefined => {
    const list = db.getOfferLetters();
    return list.find((o) => o.id === id || o.offer_number === id);
  },
  createOfferLetter: (offer: Partial<OfferLetter>): OfferLetter => {
    const list = db.getOfferLetters();
    const year = new Date().getFullYear();
    const count = list.length + 1;
    const offerNum = `HF-OFF-${year}-${String(count).padStart(3, "0")}`;

    const newOffer: OfferLetter = {
      id: generateId("off_letter"),
      organization_id: "org_default",
      candidate_id: offer.candidate_id || "cand_01",
      candidate_name: offer.candidate_name || "Applicant",
      candidate_email: offer.candidate_email || "applicant@example.com",
      template_id: offer.template_id || "off_tpl_01",
      template_name: offer.template_name || "Standard Full-Time Offer",
      offer_number: offerNum,
      job_title: offer.job_title || "Software Engineer",
      department: offer.department || "Engineering",
      reporting_manager: offer.reporting_manager || "Engineering Manager",
      employment_type: offer.employment_type || "Full-time",
      work_location: offer.work_location || "Remote",
      salary: offer.salary || "$130,000 / year",
      bonus_structure: offer.bonus_structure,
      benefits: offer.benefits || "Health, Dental, Vision, 401(k), Unlimited PTO",
      probation_period: offer.probation_period || "3 months",
      working_hours: offer.working_hours || "40 hours / week",
      joining_date: offer.joining_date || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      expiry_date: offer.expiry_date || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      signatory_name: offer.signatory_name || "Sarah Jenkins",
      signatory_designation: offer.signatory_designation || "VP of People & Operations",
      status: "Generated",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newOffer, ...list];
    memoryOfferLetters = updated;
    if (isBrowser()) saveToStorage(STORAGE_KEYS.OFFER_LETTERS, updated);

    // Update candidate status to Selected / Offer Generated if applicable
    if (offer.candidate_id) {
      db.updateCandidate(offer.candidate_id, { status: "Selected" });
    }

    db.logAudit({
      action: "OFFER_GENERATED",
      entity_type: "offer_letter",
      entity_id: newOffer.id,
      metadata: { offerNumber: newOffer.offer_number, candidate: newOffer.candidate_name, salary: newOffer.salary },
    });
    return newOffer;
  },
  updateOfferLetter: (id: string, updates: Partial<OfferLetter>): OfferLetter | undefined => {
    const list = db.getOfferLetters();
    const idx = list.findIndex((o) => o.id === id || o.offer_number === id);
    if (idx === -1) return undefined;
    const prev = list[idx];
    const updatedOffer = { ...prev, ...updates, updated_at: new Date().toISOString() };
    list[idx] = updatedOffer;
    memoryOfferLetters = list;
    if (isBrowser()) saveToStorage(STORAGE_KEYS.OFFER_LETTERS, list);
    return updatedOffer;
  },
  sendOfferLetter: (id: string): OfferLetter | undefined => {
    const offer = db.getOfferLetterById(id);
    if (!offer) return undefined;
    const updated = db.updateOfferLetter(offer.id, {
      status: "Sent",
      sent_at: new Date().toISOString(),
    });
    if (offer.candidate_id) {
      db.updateCandidate(offer.candidate_id, { status: "Offer Sent" });
    }
    db.logAudit({
      action: "OFFER_SENT",
      entity_type: "offer_letter",
      entity_id: offer.id,
      metadata: { candidate: offer.candidate_name, offerNumber: offer.offer_number },
    });
    return updated;
  },
  acceptOfferLetter: (id: string, signatureName: string, comment?: string): OfferLetter | undefined => {
    const offer = db.getOfferLetterById(id);
    if (!offer) return undefined;
    const updated = db.updateOfferLetter(offer.id, {
      status: "Accepted",
      responded_at: new Date().toISOString(),
      candidate_signature_name: signatureName,
      response_comment: comment,
    });
    if (offer.candidate_id) {
      db.updateCandidate(offer.candidate_id, { status: "Offer Accepted" });
    }
    db.logAudit({
      action: "OFFER_ACCEPTED",
      entity_type: "offer_letter",
      entity_id: offer.id,
      metadata: { candidate: offer.candidate_name, signature: signatureName },
    });
    return updated;
  },
  rejectOfferLetter: (id: string, comment?: string): OfferLetter | undefined => {
    const offer = db.getOfferLetterById(id);
    if (!offer) return undefined;
    const updated = db.updateOfferLetter(offer.id, {
      status: "Rejected",
      responded_at: new Date().toISOString(),
      response_comment: comment,
    });
    if (offer.candidate_id) {
      db.updateCandidate(offer.candidate_id, { status: "Offer Rejected" });
    }
    db.logAudit({
      action: "OFFER_REJECTED",
      entity_type: "offer_letter",
      entity_id: offer.id,
      metadata: { candidate: offer.candidate_name, reason: comment },
    });
    return updated;
  },

  // --- CANDIDATE NOTES ---
  getNotesByCandidate: (candidateId: string): CandidateNote[] => {
    const all = isBrowser() ? getFromStorage(STORAGE_KEYS.NOTES, memoryNotes) : memoryNotes;
    return all.filter((n) => n.candidate_id === candidateId);
  },
  addNote: (candidateId: string, noteText: string, user: UserProfile, tags: string[] = []): CandidateNote => {
    const all = isBrowser() ? getFromStorage(STORAGE_KEYS.NOTES, memoryNotes) : memoryNotes;
    const newNote: CandidateNote = {
      id: generateId("note"),
      candidate_id: candidateId,
      user_id: user.id,
      user_name: user.full_name,
      user_role: user.role,
      note: noteText,
      tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newNote, ...all];
    memoryNotes = updated;
    if (isBrowser()) saveToStorage(STORAGE_KEYS.NOTES, updated);
    db.logAudit({
      action: "NOTE_ADDED",
      entity_type: "candidate",
      entity_id: candidateId,
      metadata: { author: user.full_name, noteSnippet: noteText.slice(0, 50) },
    });
    return newNote;
  },
  deleteNote: (noteId: string): boolean => {
    const all = isBrowser() ? getFromStorage(STORAGE_KEYS.NOTES, memoryNotes) : memoryNotes;
    const filtered = all.filter((n) => n.id !== noteId);
    memoryNotes = filtered;
    if (isBrowser()) saveToStorage(STORAGE_KEYS.NOTES, filtered);
    return true;
  },

  // --- AUDIT LOGS ---
  getAuditLogs: (): AuditLog[] => {
    if (isBrowser()) return getFromStorage(STORAGE_KEYS.AUDIT_LOGS, memoryAuditLogs);
    return memoryAuditLogs;
  },
  logAudit: (data: {
    action: string;
    entity_type: AuditLog["entity_type"];
    entity_id: string;
    metadata?: Record<string, any>;
    user?: UserProfile;
  }): void => {
    const list = db.getAuditLogs();
    const entry: AuditLog = {
      id: generateId("aud"),
      organization_id: "org_default",
      user_id: data.user?.id || "usr_admin_01",
      user_name: data.user?.full_name || "Sarah Jenkins",
      user_role: data.user?.role || "Super Admin",
      action: data.action,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      metadata: data.metadata,
      created_at: new Date().toISOString(),
    };
    const updated = [entry, ...list];
    memoryAuditLogs = updated;
    if (isBrowser()) saveToStorage(STORAGE_KEYS.AUDIT_LOGS, updated);
  },

  // --- INTEGRATION ---
  getIntegration: (): IntegrationConfig => {
    if (isBrowser()) return getFromStorage(STORAGE_KEYS.INTEGRATION, memoryIntegration);
    return memoryIntegration;
  },
  updateIntegration: (updates: Partial<IntegrationConfig>): IntegrationConfig => {
    memoryIntegration = { ...memoryIntegration, ...updates, updated_at: new Date().toISOString() };
    if (isBrowser()) saveToStorage(STORAGE_KEYS.INTEGRATION, memoryIntegration);
    db.logAudit({
      action: "INTEGRATION_CONFIGURED",
      entity_type: "integration",
      entity_id: memoryIntegration.id,
      metadata: updates,
    });
    return memoryIntegration;
  },

  // --- DASHBOARD SUMMARY CALCULATOR ---
  getDashboardSummary: (): DashboardSummary => {
    const candidates = db.getCandidates();
    const offers = db.getOfferLetters();

    const totalApplications = candidates.length;
    const newApplications = candidates.filter((c) => c.status === "New").length;
    const shortlistedCandidates = candidates.filter((c) => ["Shortlisted", "Interview"].includes(c.status)).length;
    const selectedCandidates = candidates.filter((c) => ["Selected", "Offer Sent", "Offer Accepted"].includes(c.status)).length;
    const rejectedCandidates = candidates.filter((c) => ["Rejected", "Offer Rejected"].includes(c.status)).length;
    const pendingOffers = offers.filter((o) => ["Sent", "Generated", "Viewed"].includes(o.status)).length;
    const acceptedOffers = offers.filter((o) => o.status === "Accepted").length;
    const rejectedOffers = offers.filter((o) => o.status === "Rejected").length;

    const avgScore =
      candidates.length > 0
        ? Math.round(candidates.reduce((acc, c) => acc + (c.score || 0), 0) / candidates.length)
        : 0;

    // Applications over time (last 7 days grouped)
    const trendMap: Record<string, number> = {
      "Sep 18": 1,
      "Sep 19": 2,
      "Sep 20": 3,
      "Sep 21": 3,
      "Sep 22": 4,
      "Sep 23": 4,
      "Sep 24": 7,
    };
    const applicationsTrend = Object.entries(trendMap).map(([date, count]) => ({ date, count }));

    // Status distribution
    const statusCounts: Record<string, { count: number; color: string }> = {
      New: { count: 0, color: "#3B82F6" },
      "Under Review": { count: 0, color: "#8B5CF6" },
      Shortlisted: { count: 0, color: "#06B6D4" },
      Interview: { count: 0, color: "#6366F1" },
      Selected: { count: 0, color: "#10B981" },
      "Offer Sent": { count: 0, color: "#F59E0B" },
      "Offer Accepted": { count: 0, color: "#22C55E" },
      Rejected: { count: 0, color: "#EF4444" },
      "On Hold": { count: 0, color: "#EAB308" },
    };
    candidates.forEach((c) => {
      if (statusCounts[c.status]) {
        statusCounts[c.status].count++;
      }
    });
    const statusDistribution = Object.entries(statusCounts)
      .filter(([_, data]) => data.count > 0)
      .map(([status, data]) => ({ status, count: data.count, color: data.color }));

    // Score distribution
    const scoreRanges = [
      { range: "90-100 (Exceptional)", min: 90, max: 100, count: 0 },
      { range: "80-89 (Strong)", min: 80, max: 89, count: 0 },
      { range: "70-79 (Competent)", min: 70, max: 79, count: 0 },
      { range: "60-69 (Average)", min: 60, max: 69, count: 0 },
      { range: "< 60 (Below Bar)", min: 0, max: 59, count: 0 },
    ];
    candidates.forEach((c) => {
      const match = scoreRanges.find((r) => c.score >= r.min && c.score <= r.max);
      if (match) match.count++;
    });
    const scoreDistribution = scoreRanges.map((r) => ({ range: r.range, count: r.count }));

    // Applications by Department
    const deptMap: Record<string, number> = {};
    candidates.forEach((c) => {
      deptMap[c.department] = (deptMap[c.department] || 0) + 1;
    });
    const applicationsByDepartment = Object.entries(deptMap).map(([department, count]) => ({
      department,
      count,
    }));

    // Applications by Source
    const sourceMap: Record<string, number> = {};
    candidates.forEach((c) => {
      sourceMap[c.source || "Google Form"] = (sourceMap[c.source || "Google Form"] || 0) + 1;
    });
    const applicationsBySource = Object.entries(sourceMap).map(([source, count]) => ({ source, count }));

    // Offer Acceptance Rate
    const totalFinishedOffers = acceptedOffers + rejectedOffers;
    const rate = totalFinishedOffers > 0 ? Math.round((acceptedOffers / totalFinishedOffers) * 100) : 100;

    return {
      totalApplications,
      newApplications,
      shortlistedCandidates,
      selectedCandidates,
      rejectedCandidates,
      pendingOffers,
      acceptedOffers,
      averageScore: avgScore,
      applicationsTrend,
      statusDistribution,
      scoreDistribution,
      applicationsByDepartment,
      applicationsBySource,
      offerAcceptanceRate: {
        accepted: acceptedOffers,
        rejected: rejectedOffers,
        pending: pendingOffers,
        rate,
      },
    };
  },
};
