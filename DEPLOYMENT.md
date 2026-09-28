# HireFlow Production Deployment Guide

This guide covers deployment of **HireFlow** to production on **Vercel** with **Supabase**, **Google Cloud**, and **Resend**.

---

## 1. Deploying on Vercel

### Step 1: Connect Git Repository
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. In [Vercel](https://vercel.com), click **Add New Project** and select your HireFlow repository.
3. Framework Preset: **Next.js** (automatically detected).

### Step 2: Configure Environment Variables
Set the following environment variables in the Vercel Project Settings:

```env
# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://<your-supabase-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>

# Google OAuth & APIs
GOOGLE_CLIENT_ID=<your-google-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/api/integrations/google/callback

# Email Provider (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
EMAIL_FROM=HireFlow Talent <recruiting@yourdomain.com>

# Google Drive Storage
GOOGLE_DRIVE_FOLDER_ID=<your-google-drive-folder-id>

# Demo Mode (Set false in production)
NEXT_PUBLIC_DEMO_MODE=false
```

### Step 3: Deploy
Click **Deploy**. Vercel will run `next build` and deploy serverless functions for all API routes.

---

## 2. Supabase Production Database Setup

1. Create a production Supabase project at [supabase.com](https://supabase.com).
2. In the Supabase Dashboard, open the **SQL Editor**.
3. Run `supabase/migrations/20260101000000_initial_schema.sql` to initialize all tables, indexes, constraints, and Row Level Security policies.
4. (Optional) Run `supabase/seed.sql` if you want default scoring criteria and email templates populated.
5. In **Authentication > URL Configuration**, add your production URL (`https://your-domain.vercel.app`) as the Site URL and Redirect URL.

---

## 3. Google Cloud OAuth Production Configuration

1. In the [Google Cloud Console](https://console.cloud.google.com/), navigate to **APIs & Services > Credentials**.
2. Under your OAuth 2.0 Client ID:
   - **Authorized JavaScript origins**: Add `https://your-domain.vercel.app`
   - **Authorized redirect URIs**: Add `https://your-domain.vercel.app/api/integrations/google/callback`
3. If publishing publicly, submit your OAuth consent screen for Google Verification or keep it internal to your Google Workspace organization.

---

## 4. Email Domain Verification (Resend)

1. In [Resend](https://resend.com), navigate to **Domains** and click **Add Domain**.
2. Add the required DNS records (DKIM, SPF, and DMARC) in your domain registrar (Cloudflare, GoDaddy, Route53, etc.).
3. Once verified, configure `EMAIL_FROM` with your verified domain address.

---

## 5. Post-Deployment Verification Checklist

- [ ] Visit `https://your-domain.vercel.app` — verify landing page renders cleanly.
- [ ] Log in via `/login` using administrator credentials.
- [ ] Check `/dashboard` metrics and charts load without errors.
- [ ] Test `/integrations` — connect Google Sheet and trigger synchronization.
- [ ] Generate a test offer letter and verify the PDF download.
- [ ] Open the candidate public link `/offer/[id]` and test digital signature submission.
