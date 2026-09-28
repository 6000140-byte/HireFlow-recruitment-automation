# HireFlow REST API Documentation

All API endpoints are implemented under the `/api` prefix using Next.js Route Handlers. Each route includes authentication checks, role authorization, input validation with Zod, and error handling.

---

## Authentication & Session

### `POST /api/auth/login`
Authenticates a user by email and password.
- **Request Body**:
  ```json
  {
    "email": "recruiter@hireflow.io",
    "password": "demo123"
  }
  ```
- **Response**:
  ```json
  {
    "user": {
      "id": "usr_recruiter_01",
      "email": "recruiter@hireflow.io",
      "role": "recruiter",
      "full_name": "Alex Morgan"
    }
  }
  ```

### `POST /api/auth/register`
Registers a new organization account and administrator.

### `POST /api/auth/logout`
Terminates the current session.

---

## Candidates Management

### `GET /api/candidates`
Returns a paginated list of candidates with optional filters.
- **Query Parameters**:
  - `status`: Filter by status (`new`, `shortlisted`, `selected`, `rejected`, etc.)
  - `department`: Filter by department
  - `search`: Search query across name, email, or skills
  - `page`: Page index (default: 1)
  - `limit`: Number of records per page (default: 10)

### `POST /api/candidates`
Creates a candidate application record manually.
- **Request Body**:
  ```json
  {
    "full_name": "Marcus Aurelius",
    "email": "marcus@rome.org",
    "phone": "+1 555 123 4567",
    "position": "Director of Strategy",
    "department": "Executive",
    "skills": ["Leadership", "Philosophy", "Strategy"],
    "experience": "10+ years"
  }
  ```

### `GET /api/candidates/[id]`
Returns complete candidate details, evaluation breakdown, and application timeline.

### `PATCH /api/candidates/[id]`
Updates candidate details or status.

### `DELETE /api/candidates/[id]`
Deletes a candidate record (Requires Super Admin or Recruiter role).

### `POST /api/candidates/import`
Imports candidate records in bulk from Google Sheets or uploaded CSV.
- **Request Body**:
  ```json
  {
    "records": [ ... ],
    "source": "Google Sheets"
  }
  ```

### `POST /api/candidates/bulk-status`
Updates statuses for multiple candidates simultaneously.
- **Request Body**:
  ```json
  {
    "candidateIds": ["cand_01", "cand_02"],
    "status": "shortlisted"
  }
  ```

### `POST /api/candidates/[id]/score`
Submits scoring for candidate across defined criteria.
- **Request Body**:
  ```json
  {
    "scores": {
      "crit_01": 90,
      "crit_02": 85
    },
    "notes": "Strong system design capabilities"
  }
  ```

### `POST /api/candidates/[id]/send-email`
Dispatches a templated email to the candidate.
- **Request Body**:
  ```json
  {
    "templateId": "tmpl_01",
    "subject": "Interview Invitation",
    "body": "..."
  }
  ```

### `POST /api/candidates/[id]/generate-offer`
Generates a formal offer letter for the candidate.
- **Request Body**:
  ```json
  {
    "templateId": "tmpl_offer_01",
    "jobTitle": "Lead Engineer",
    "salary": "$175,000 / year",
    "joiningDate": "2026-11-01",
    "expiryDate": "2026-10-15"
  }
  ```

---

## Scoring Criteria

- `GET /api/scoring-criteria`: Fetch configured evaluation criteria and weights.
- `POST /api/scoring-criteria`: Add a new scoring criterion.
- `PATCH /api/scoring-criteria/[id]`: Update criterion weight or description.
- `DELETE /api/scoring-criteria/[id]`: Delete criterion.

---

## Email Templates

- `GET /api/email-templates`: Retrieve all email templates.
- `POST /api/email-templates`: Create an email template with variable placeholders.
- `PATCH /api/email-templates/[id]`: Edit template content.
- `DELETE /api/email-templates/[id]`: Delete template.

---

## Offer Letter Templates

- `GET /api/offer-letter-templates`: Retrieve offer letter layouts.
- `POST /api/offer-letter-templates`: Create new offer letter layout.
- `PATCH /api/offer-letter-templates/[id]`: Update offer letter layout.
- `DELETE /api/offer-letter-templates/[id]`: Delete layout.

---

## Offer Letters Lifecycle

- `GET /api/offer-letters`: List all generated offer letters.
- `GET /api/offer-letters/[id]`: Get details of specific offer letter.
- `POST /api/offer-letters/[id]/send`: Send offer letter to candidate via email.
- `POST /api/offer-letters/[id]/resend`: Resend offer email.
- `POST /api/offer-letters/[id]/accept`: Public endpoint for candidate to accept offer with digital signature.
- `POST /api/offer-letters/[id]/reject`: Public endpoint for candidate to reject offer with comments.

---

## Google Integration

- `POST /api/integrations/google/connect`: Connect Google OAuth account.
- `POST /api/integrations/google/sync`: Trigger spreadsheet sync.
- `GET /api/integrations/google/status`: Check synchronization state.

---

## Reports & Audit Logs

- `GET /api/reports`: Aggregated recruitment metrics, department distribution, offer acceptance rates.
- `GET /api/audit-logs`: Paginated audit log history for compliance and tracking.
