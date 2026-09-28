# HireFlow — Google Form to Automated Selection, Email & Offer Letter System

![HireFlow Banner](https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop&crop=faces&q=80)

> **HireFlow** is a modern, production-grade recruitment and applicant-management platform that turns Google Form submissions into automated candidate evaluation, scoring, personalized email updates, PDF offer letter generation, and lifecycle tracking.

---

## 🌟 Key Features

- **Google Form & Sheets Import**: Ingest responses directly from Google Sheets with customizable column mapping and duplicate candidate detection.
- **Configurable Candidate Scoring Engine**: Define weighted evaluation criteria (Education, Experience, Technical Skills, Interview, Availability) with automated recommendations (`Strongly Recommended`, `Recommended`, `Review Required`, `Not Recommended`).
- **Comprehensive Candidate Profiles**: View structured applications, skills breakdown, resume links, application timelines, reviewer notes, and team mentions.
- **Dynamic Email Template Builder**: Create and preview rich email templates using variable interpolation (`{{candidate_name}}`, `{{position}}`, `{{salary}}`, `{{offer_letter_url}}`, etc.).
- **Client & Server-Side PDF Offer Letter Generation**: Generate formatted, customized PDF offer letters complete with company branding, terms, compensation packages, and digital signature placeholders.
- **Public Candidate Offer Portal (`/offer/[id]`)**: Self-service portal where selected candidates review terms, download their official PDF, provide feedback, sign, and accept or reject the offer.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions across 4 distinct roles:
  - **Super Admin**: Full platform configuration, integrations, criteria, templates, and audit logs.
  - **Recruiter**: Candidate scoring, status transitions, email dispatches, and offer generation.
  - **Reviewer**: Assigned candidate reviews, scoring submissions, and internal notes.
  - **Viewer**: Read-only analytics dashboards and candidate registries.
- **Zero-Config Demo Mode**: Pre-loaded with 20 realistic candidates across Engineering, Design, Product, Operations, and Marketing, ready out-of-the-box without requiring third-party credentials.
- **Interactive Analytics & Reporting**: Real-time charts for application flow, departmental distribution, score bell curves, offer acceptance rates, and export to CSV, Excel, and PDF.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 14 (App Router, Server & Client Components) |
| **Language** | TypeScript 5 (Strict Mode) |
| **Styling** | Tailwind CSS, Lucide React Icons |
| **Database & Auth** | Supabase (PostgreSQL, Row Level Security, Auth) |
| **Validation** | Zod, React Hook Form |
| **Data Visualization** | Recharts |
| **Document Generation** | jsPDF, jspdf-autotable, Canvas Confetti |
| **Integrations** | Google Sheets API, Google Drive API, Resend / Gmail API |

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18.x or 20+
- npm or pnpm or yarn

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/your-org/hireflow.git
cd hireflow
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Login Credentials

In Demo Mode (`NEXT_PUBLIC_DEMO_MODE=true`), you can quickly switch roles or log in directly with any of the following accounts (password is `demo123` for all demo accounts):

| Role | Email | Password | Permissions Summary |
|---|---|---|---|
| **Super Admin** | `admin@hireflow.io` | `demo123` | Full access to settings, criteria, templates, team & logs |
| **Recruiter** | `recruiter@hireflow.io` | `demo123` | Candidate evaluation, scoring, email dispatch & offer generation |
| **Reviewer** | `reviewer@hireflow.io` | `demo123` | Reviewing assigned candidates, adding notes & scoring |
| **Viewer** | `viewer@hireflow.io` | `demo123` | Read-only analytics and candidate records |

*Tip: You can also use the role switcher in the top navigation bar to test role permissions on the fly.*

---

## 🗄️ Database Setup & Migrations (Supabase)

HireFlow provides SQL migration and seed scripts located in `supabase/`:

### 1. Supabase Project Setup
1. Create a project at [supabase.com](https://supabase.com).
2. Copy your Project URL and anon key into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   ```

### 2. Run Database Migrations
In the Supabase SQL Editor, execute the contents of:
- `supabase/migrations/20260101000000_initial_schema.sql`

This creates:
- `organizations`, `profiles`, `candidates`, `applications`
- `scoring_criteria`, `candidate_scores`, `candidate_notes`
- `email_templates`, `email_logs`, `offer_letter_templates`, `offer_letters`
- `integrations`, `audit_logs`
- Indexes and Row Level Security (RLS) policies.

### 3. Seed Demo Data (Optional)
Run the script in `supabase/seed.sql` to populate sample candidates, templates, and criteria.

---

## ☁️ Google Cloud & Sheets API Integration

To connect live Google Forms and Google Sheets:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and enable:
   - **Google Sheets API**
   - **Google Drive API**
3. Create OAuth 2.0 Credentials:
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/integrations/google/callback`
4. Set credentials in `.env.local`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/integrations/google/callback
   ```
5. In HireFlow, navigate to `/integrations`, click **Connect Google Account**, paste your Google Sheet URL, map columns, and click **Sync Now**.

---

## 📧 Email Delivery (Resend / Gmail)

HireFlow supports direct email delivery via **Resend** or standard SMTP:

1. Sign up at [resend.com](https://resend.com) and generate an API Key.
2. Add to `.env.local`:
   ```env
   RESEND_API_KEY=re_123456789
   EMAIL_FROM=HireFlow Talent <offers@yourdomain.com>
   ```
3. When `RESEND_API_KEY` is not present, HireFlow operates in **Demo Mode**, logging all outgoing emails to the audit trail and displaying an interactive notification toast.

---

## 🧪 Testing

HireFlow includes an automated test suite verifying RBAC permissions, candidate validations, duplicate prevention, the candidate scoring engine, and the complete 8-step E2E recruitment lifecycle:

```bash
npm test
```

### Verified Test Scenarios:
1. **RBAC Authorization**: Permissions verification across Super Admin, Recruiter, Reviewer, and Viewer.
2. **Candidate Management & Validation**: Form schema validation and duplicate candidate prevention.
3. **Scoring Engine**: Multi-criterion weighted calculation and recommendation tiers.
4. **End-to-End Simulation**:
   - Step 1: Recruiter authentication
   - Step 2: Dashboard metrics calculation
   - Step 3: Google Sheets application import
   - Step 4: Candidate filtering & searching
   - Step 5: Candidate shortlisting
   - Step 6: Offer letter generation with variable interpolation
   - Step 7: Email dispatch & status transition
   - Step 8: Candidate public offer acceptance and digital signature

---

## 📦 Building for Production

```bash
npm run build
npm run start
```

---

## 🔒 Security Best Practices

- **Zero Secrets on Client**: All API keys, service role tokens, and OAuth secrets are restricted to server-side routes.
- **Row Level Security (RLS)**: Enforced in PostgreSQL to guarantee multi-tenant organization data isolation.
- **Input Sanitization & Schema Validation**: Handled via Zod schemas for all mutations and API inputs.
- **Immutable Audit Trail**: All status changes, score updates, offer creations, and email deliveries are logged in `audit_logs`.

---

## 📄 License

This project is licensed under the MIT License.
