-- HireFlow Complete Database Schema Migration
-- Compatible with PostgreSQL 14+ / Supabase

-- 1. Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Profiles table (linked to auth.users in Supabase)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'recruiter', 'reviewer', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    position VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    education VARCHAR(255),
    experience VARCHAR(100),
    skills TEXT[] DEFAULT '{}',
    certifications TEXT[] DEFAULT '{}',
    resume_url TEXT,
    portfolio_url TEXT,
    linkedin_url TEXT,
    application_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    score NUMERIC(5, 2) DEFAULT 0,
    recommendation VARCHAR(50) CHECK (recommendation IN ('strongly_recommended', 'recommended', 'review_required', 'not_recommended')),
    status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (status IN (
        'new', 'under_review', 'shortlisted', 'interview', 'selected',
        'offer_sent', 'offer_accepted', 'offer_rejected', 'rejected', 'on_hold', 'withdrawn'
    )),
    source VARCHAR(100) DEFAULT 'Google Form',
    assigned_reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_org_candidate_email UNIQUE (organization_id, email)
);

-- 5. Applications (raw Google Form submissions)
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    form_response_id VARCHAR(255),
    raw_response JSONB NOT NULL DEFAULT '{}'::jsonb,
    imported_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Scoring Criteria
CREATE TABLE IF NOT EXISTS scoring_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    weight NUMERIC(5, 2) NOT NULL CHECK (weight >= 0 AND weight <= 100),
    maximum_score NUMERIC(5, 2) NOT NULL DEFAULT 100,
    minimum_requirement VARCHAR(255),
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Candidate Scores
CREATE TABLE IF NOT EXISTS candidate_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    criterion_id UUID NOT NULL REFERENCES scoring_criteria(id) ON DELETE CASCADE,
    score NUMERIC(5, 2) NOT NULL,
    explanation TEXT,
    scored_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_candidate_criterion UNIQUE (candidate_id, criterion_id)
);

-- 8. Candidate Notes
CREATE TABLE IF NOT EXISTS candidate_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    template_type VARCHAR(100) NOT NULL CHECK (template_type IN (
        'application_received', 'application_under_review', 'shortlisted',
        'interview_invitation', 'selection_notification', 'rejection_notification',
        'offer_letter_email', 'offer_reminder', 'offer_accepted_confirmation', 'offer_rejected_confirmation'
    )),
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. Email Logs
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'sent' CHECK (status IN (
        'sent', 'delivered', 'opened', 'clicked', 'failed', 'bounced'
    )),
    provider_message_id VARCHAR(255),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    error_message TEXT
);

-- 11. Offer Letter Templates
CREATE TABLE IF NOT EXISTS offer_letter_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. Offer Letters
CREATE TABLE IF NOT EXISTS offer_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    template_id UUID REFERENCES offer_letter_templates(id) ON DELETE SET NULL,
    offer_number VARCHAR(100) NOT NULL UNIQUE,
    job_title VARCHAR(255) NOT NULL,
    salary VARCHAR(100) NOT NULL,
    joining_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    file_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'generated', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'cancelled'
    )),
    sent_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    response_comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. Integrations
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    provider VARCHAR(100) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_sync_at TIMESTAMPTZ,
    sync_status VARCHAR(50) DEFAULT 'idle' CHECK (sync_status IN ('idle', 'in_progress', 'success', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_org_provider UNIQUE (organization_id, provider)
);

-- 14. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidates_org ON candidates(organization_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_department ON candidates(department);
CREATE INDEX IF NOT EXISTS idx_candidates_score ON candidates(score DESC);
CREATE INDEX IF NOT EXISTS idx_offer_letters_candidate ON offer_letters(candidate_id);
CREATE INDEX IF NOT EXISTS idx_offer_letters_status ON offer_letters(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created ON audit_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_candidate ON email_logs(candidate_id);

-- Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_letter_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to fetch current user's organization
CREATE OR REPLACE FUNCTION get_user_organization_id() 
RETURNS UUID AS $$
  SELECT organization_id FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Organization-level isolation policies
CREATE POLICY "Users can view data within their organization" ON candidates
  FOR ALL USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can view offer letters within their organization" ON offer_letters
  FOR ALL USING (candidate_id IN (SELECT id FROM candidates WHERE organization_id = get_user_organization_id()));

CREATE POLICY "Public offer view by offer number" ON offer_letters
  FOR SELECT USING (true);
