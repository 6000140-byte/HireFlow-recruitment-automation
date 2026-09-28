-- HireFlow Comprehensive Seed Data
-- 1 Demo Organization, 4 Role-based Users, 20 Candidates, Scoring Criteria, Templates, Offers, Logs

-- Organization
INSERT INTO organizations (id, name, logo_url, email, phone, address)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'HireFlow Technologies Inc.',
    'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&h=120&fit=crop&crop=faces',
    'talent@hireflow.io',
    '+1 (415) 890-2100',
    '100 Innovation Way, Suite 400, San Francisco, CA 94105'
) ON CONFLICT (id) DO NOTHING;

-- Demo Profiles (Super Admin, Recruiter, Reviewer, Viewer)
INSERT INTO profiles (id, user_id, organization_id, full_name, email, avatar_url, role)
VALUES
    ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Sarah Jenkins', 'admin@hireflow.io', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'super_admin'),
    ('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Alex Morgan', 'recruiter@hireflow.io', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'recruiter'),
    ('10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Dr. Marcus Vance', 'reviewer@hireflow.io', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'reviewer'),
    ('10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Elena Rostova', 'viewer@hireflow.io', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'viewer')
ON CONFLICT (id) DO NOTHING;

-- Scoring Criteria
INSERT INTO scoring_criteria (id, organization_id, name, description, weight, maximum_score, minimum_requirement, enabled)
VALUES
    ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Education', 'Academic qualifications and relevant degree credentials', 20, 100, 'Bachelor degree in relevant domain', true),
    ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Years of Experience', 'Verified track record in similar industry and seniority levels', 25, 100, '3+ years verified experience', true),
    ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Technical & Domain Skills', 'Core technologies, problem-solving, and domain mastery', 25, 100, 'Matches 4+ core job competencies', true),
    ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Interview & Communication', 'Communication clarity, culture fit, and behavioral evaluation', 20, 100, 'Structured interview score >= 70', true),
    ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Availability & Alignment', 'Joining timeline and compensation range fit', 10, 100, 'Available within 4-6 weeks', true)
ON CONFLICT (id) DO NOTHING;

-- Email Templates
INSERT INTO email_templates (id, organization_id, name, subject, body, template_type, enabled)
VALUES
    ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Application Received', 'We have received your application for {{position}} at {{company_name}}', 'Hi {{candidate_name}},\n\nThank you for applying for the {{position}} position at {{company_name}}.\n\nOur hiring team is currently reviewing your application. We will reach out shortly regarding next steps.\n\nBest regards,\n{{recruiter_name}}\n{{company_name}} Talent Acquisition', 'application_received', true),
    ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Shortlisted Notification', 'Exciting News! You have been shortlisted for {{position}}', 'Dear {{candidate_name}},\n\nWe were very impressed with your background and are pleased to inform you that you have been shortlisted for the {{position}} role at {{company_name}}.\n\nWe look forward to speaking with you.\n\nWarm regards,\n{{recruiter_name}}', 'shortlisted', true),
    ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Official Offer of Employment', 'Offer of Employment: {{position}} at {{company_name}}', 'Dear {{candidate_name}},\n\nOn behalf of {{company_name}}, we are delighted to offer you the position of {{position}} in our {{department}} team!\n\nYour joining date is {{joining_date}} with an annual compensation of {{salary}}.\n\nPlease review and sign your formal offer letter at: {{offer_letter_url}}\n\nSincerely,\n{{recruiter_name}}\n{{company_name}}', 'offer_letter_email', true),
    ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Rejection Notification', 'Update regarding your application for {{position}} at {{company_name}}', 'Dear {{candidate_name}},\n\nThank you for your interest in {{company_name}} and for taking the time to interview for {{position}}.\n\nWhile your qualifications are impressive, we have chosen to move forward with another candidate whose experience more closely matches our immediate needs. We wish you every success in your search.\n\nSincerely,\n{{company_name}} Hiring Team', 'rejection_notification', true)
ON CONFLICT (id) DO NOTHING;

-- Offer Letter Template
INSERT INTO offer_letter_templates (id, organization_id, name, content, enabled)
VALUES
    ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Standard Full-Time Offer Template', 
    '# OFFER OF EMPLOYMENT\n\n**Date:** {{date}}\n\n**Dear {{candidate_name}},**\n\nWe are thrilled to offer you the position of **{{position}}** in the **{{department}}** department at **{{company_name}}**.\n\n### 1. Terms of Employment\n- **Position:** {{position}}\n- **Department:** {{department}}\n- **Reporting Manager:** VP of Engineering\n- **Start Date:** {{joining_date}}\n- **Location:** San Francisco, CA (Hybrid)\n- **Annual Compensation:** {{salary}} paid semi-monthly\n- **Offer Validity:** This offer remains valid until {{offer_expiry_date}}\n\n### 2. Benefits and Perks\n- Comprehensive Medical, Dental, and Vision coverage (100% company-paid premiums)\n- 401(k) with 5% employer dollar-for-dollar match\n- Unlimited Paid Time Off (PTO)\n- $2,500 annual professional learning & development stipend\n\nPlease sign below to accept this offer.\n\nSincerely,\n**Sarah Jenkins**  \nChief People Officer, {{company_name}}', true)
ON CONFLICT (id) DO NOTHING;

-- 20 Realistic Candidates
INSERT INTO candidates (id, organization_id, full_name, email, phone, address, position, department, education, experience, skills, certifications, score, recommendation, status, source)
VALUES
    ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Devon Campbell', 'devon.campbell@example.com', '+1 (555) 234-8901', 'Seattle, WA', 'Senior Full Stack Engineer', 'Engineering', 'M.S. Computer Science, University of Washington', '7 years in React, Node.js, distributed cloud systems', ARRAY['TypeScript', 'Next.js', 'PostgreSQL', 'AWS', 'Docker', 'GraphQL'], ARRAY['AWS Certified Solutions Architect'], 92.5, 'strongly_recommended', 'selected', 'Google Form'),
    ('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Priya Sharma', 'priya.sharma@example.com', '+1 (555) 345-9012', 'San Francisco, CA', 'Lead Product Designer', 'Design', 'B.A. Interaction Design, RISD', '6 years product UX/UI at high-growth SaaS startups', ARRAY['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Design Tokens'], ARRAY['Nielsen Norman UX Master'], 88.0, 'strongly_recommended', 'offer_sent', 'Google Form'),
    ('50000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Lucas Bennett', 'lucas.bennett@example.com', '+1 (555) 456-0123', 'Austin, TX', 'DevOps & Platform Engineer', 'Engineering', 'B.S. Software Engineering, UT Austin', '5 years Kubernetes, Terraform, CI/CD automation', ARRAY['Kubernetes', 'Terraform', 'GCP', 'GitHub Actions', 'Prometheus'], ARRAY['CKA Kubernetes Administrator'], 84.5, 'strongly_recommended', 'offer_accepted', 'Google Form'),
    ('50000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Amara Okafor', 'amara.okafor@example.com', '+1 (555) 567-1234', 'New York, NY', 'Product Marketing Manager', 'Marketing', 'MBA, Columbia Business School', '5 years B2B SaaS positioning, launches, and analytics', ARRAY['GTM Strategy', 'Content Strategy', 'HubSpot', 'Google Analytics', 'SEO'], ARRAY['HubSpot Inbound Certified'], 79.0, 'recommended', 'shortlisted', 'Google Form'),
    ('50000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Liam Henderson', 'liam.henderson@example.com', '+1 (555) 678-2345', 'Chicago, IL', 'Senior Backend Engineer', 'Engineering', 'B.S. Computer Engineering, UIUC', '6 years Go, Microservices, Kafka, Redis', ARRAY['Go', 'Kafka', 'PostgreSQL', 'gRPC', 'Redis'], ARRAY['Confluent Certified Kafka Developer'], 86.0, 'strongly_recommended', 'interview', 'Google Form'),
    ('50000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Sofia Rodriguez', 'sofia.rodriguez@example.com', '+1 (555) 789-3456', 'San Diego, CA', 'Customer Success Director', 'Operations', 'B.A. Business Administration, SDSU', '8 years enterprise retention, ARR growth, onboarding', ARRAY['Gainsight', 'Salesforce', 'Churn Reduction', 'Executive QBRs'], ARRAY['Certified Customer Success Manager (CCSM)'], 81.0, 'recommended', 'under_review', 'Google Form'),
    ('50000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Ethan Clarke', 'ethan.clarke@example.com', '+1 (555) 890-4567', 'Denver, CO', 'Data Science & ML Engineer', 'Data', 'Ph.D. Statistics, UC Berkeley', '4 years PyTorch, LLMs, NLP, predictive analytics', ARRAY['Python', 'PyTorch', 'LLMs', 'SQL', 'FastAPI', 'Pandas'], ARRAY['Databricks Certified ML Professional'], 91.0, 'strongly_recommended', 'selected', 'Google Form'),
    ('50000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Chloe Dubois', 'chloe.dubois@example.com', '+1 (555) 901-5678', 'Boston, MA', 'Frontend Engineer', 'Engineering', 'B.S. Interactive Media, Northeastern', '3 years React, Vue, CSS animations, Web Accessibility', ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'a11y'], ARRAY['W3C Web Accessibility Specialist'], 73.0, 'recommended', 'new', 'Google Form'),
    ('50000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'Zane Al-Mansoor', 'zane.almansoor@example.com', '+1 (555) 012-6789', 'Los Angeles, CA', 'Account Executive (Enterprise)', 'Sales', 'B.S. Economics, UCLA', '5 years enterprise quota overachievement in SaaS', ARRAY['Salesforce', 'MEDDICC', 'Contract Negotiation', 'Prospecting'], ARRAY['Sandler Sales Certified'], 76.5, 'recommended', 'interview', 'Google Form'),
    ('50000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Hannah Schmidt', 'hannah.schmidt@example.com', '+1 (555) 123-7890', 'Philadelphia, PA', 'HR Business Partner', 'Human Resources', 'M.S. Human Resource Management, Penn State', '6 years talent development, payroll, HR compliance', ARRAY['Workday', 'BambooHR', 'Employee Relations', 'Total Rewards'], ARRAY['SHRM-CP'], 71.0, 'recommended', 'on_hold', 'Google Form'),
    ('50000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Tariq Johnson', 'tariq.johnson@example.com', '+1 (555) 234-8902', 'Atlanta, GA', 'QA Automation Engineer', 'Engineering', 'B.S. Information Systems, Georgia Tech', '4 years Cypress, Playwright, Selenium, CI automation', ARRAY['Playwright', 'Cypress', 'JavaScript', 'Jest', 'Postman'], ARRAY['ISTQB Certified Tester'], 68.0, 'recommended', 'under_review', 'Google Form'),
    ('50000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Mei-Ling Zhou', 'meiling.zhou@example.com', '+1 (555) 345-9013', 'San Jose, CA', 'Technical Product Manager', 'Product', 'B.S. CS & MBA, Stanford', '5 years developer APIs, product roadmaps, agile', ARRAY['API Design', 'Roadmapping', 'Jira', 'Mixpanel', 'SQL'], ARRAY['Certified Scrum Product Owner (CSPO)'], 89.5, 'strongly_recommended', 'selected', 'Google Form'),
    ('50000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Carlos Mendoza', 'carlos.mendoza@example.com', '+1 (555) 456-0124', 'Miami, FL', 'Growth Marketing Specialist', 'Marketing', 'B.A. Advertising, University of Florida', '3 years paid acquisition, Meta Ads, LinkedIn Ads', ARRAY['Paid Ads', 'A/B Testing', 'Copywriting', 'Google Ads'], ARRAY['Meta Certified Media Buying Professional'], 64.0, 'review_required', 'rejected', 'Google Form'),
    ('50000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'Kavita Patel', 'kavita.patel@example.com', '+1 (555) 567-1235', 'Raleigh, NC', 'Security Operations Engineer', 'Engineering', 'B.S. Cybersecurity, NC State', '4 years SOC, incident response, vulnerability scanning', ARRAY['SIEM', 'CrowdStrike', 'AWS Security', 'Penetration Testing'], ARRAY['CompTIA Security+', 'CISSP Associate'], 83.0, 'strongly_recommended', 'shortlisted', 'Google Form'),
    ('50000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', 'Benjamin Wright', 'ben.wright@example.com', '+1 (555) 678-2346', 'Portland, OR', 'Content Strategist', 'Marketing', 'B.A. Journalism, University of Oregon', '2 years tech blogging and case studies', ARRAY['Technical Writing', 'CMS', 'Editorial Calendar'], ARRAY['Content Marketing Certified'], 45.0, 'not_recommended', 'rejected', 'Google Form'),
    ('50000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000001', 'Ananya Roy', 'ananya.roy@example.com', '+1 (555) 789-3457', 'Dallas, TX', 'Financial Analyst', 'Finance', 'B.S. Finance, SMU', '3 years financial modeling, SaaS metrics (LTV/CAC)', ARRAY['Excel Financial Modeling', 'NetSuite', 'Tableau', 'Forecasting'], ARRAY['CFA Level 1 Passed'], 74.0, 'recommended', 'new', 'Google Form'),
    ('50000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000001', 'Derrick Evans', 'derrick.evans@example.com', '+1 (555) 890-4568', 'Nashville, TN', 'Sales Operations Manager', 'Sales', 'B.B.A., Vanderbilt', '4 years pipeline forecasting, commission structures', ARRAY['Salesforce Admin', 'Revenue Operations', 'HubSpot'], ARRAY['Salesforce Certified Administrator'], 77.0, 'recommended', 'interview', 'Google Form'),
    ('50000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000001', 'Grace Lin', 'grace.lin@example.com', '+1 (555) 901-5679', 'San Francisco, CA', 'iOS Mobile Engineer', 'Engineering', 'B.S. CS, UC San Diego', '5 years Swift, SwiftUI, iOS App Store releases', ARRAY['Swift', 'SwiftUI', 'Combine', 'CoreData', 'CI/CD Fastlane'], ARRAY['Apple Certified iOS Developer'], 85.0, 'strongly_recommended', 'shortlisted', 'Google Form'),
    ('50000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000001', 'Owen Cooper', 'owen.cooper@example.com', '+1 (555) 012-6780', 'Salt Lake City, UT', 'Junior Web Developer', 'Engineering', 'Coding Bootcamp Graduate', '1 year freelance HTML/CSS/JS', ARRAY['JavaScript', 'CSS', 'HTML'], ARRAY['None'], 42.0, 'not_recommended', 'rejected', 'Google Form'),
    ('50000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'Fatima Zahra', 'fatima.zahra@example.com', '+1 (555) 123-7891', 'Minneapolis, MN', 'Talent Acquisition Partner', 'Human Resources', 'B.A. Psychology, University of Minnesota', '4 years technical recruiting, sourcing on LinkedIn', ARRAY['Sourcing', 'LinkedIn Recruiter', 'Interview Coordination', 'ATS'], ARRAY['LinkedIn Certified Professional Recruiter'], 80.0, 'recommended', 'new', 'Google Form')
ON CONFLICT (id) DO NOTHING;

-- Offer Letters
INSERT INTO offer_letters (id, candidate_id, template_id, offer_number, job_title, salary, joining_date, expiry_date, status, sent_at)
VALUES
    ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 'OFFER-2026-001', 'Lead Product Designer', '$155,000 / year', '2026-10-15', '2026-10-01', 'sent', '2026-09-20T10:00:00Z'),
    ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', 'OFFER-2026-002', 'DevOps & Platform Engineer', '$160,000 / year', '2026-10-20', '2026-09-28', 'accepted', '2026-09-18T14:30:00Z')
ON CONFLICT (id) DO NOTHING;

-- Audit Logs
INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, metadata)
VALUES
    ('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'IMPORTED_FORM_RESPONSES', 'applications', 'BATCH-001', '{"count": 20, "source": "Google Sheets"}'::jsonb),
    ('70000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'GENERATED_OFFER_LETTER', 'offer_letters', 'OFFER-2026-001', '{"candidate": "Priya Sharma", "salary": "$155,000"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
