# Contributing to HireFlow

Thank you for your interest in contributing to HireFlow! We welcome contributions to enhance features, improve documentation, fix bugs, and refine our code quality.

---

## Code of Conduct

We expect all contributors to adhere to a respectful, inclusive, and professional environment. Please be constructive in code reviews and discussions.

---

## Development Workflow

### 1. Fork and Clone
```bash
git clone https://github.com/your-username/hireflow.git
cd hireflow
git checkout -b feature/your-feature-name
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Local Environment
```bash
cp .env.example .env.local
```

### 4. Code Standards
- **TypeScript**: Strict type checking. Avoid `any` wherever possible.
- **Tailwind CSS**: Maintain design system consistency. Use existing color palette (`#0F172A`, `#2563EB`, `#16A34A`, `#D97706`, `#DC2626`).
- **Components**: Follow Next.js App Router conventions with clear separation between Server Components and Client Components (`"use client"`).
- **Validation**: Validate all API inputs and mutation payloads using Zod schemas located in `lib/validations/`.

### 5. Running Tests & Verifying Build
Before submitting your pull request, ensure all tests and the production build pass cleanly:
```bash
npm test
npm run build
```

---

## Commit Guidelines

Follow conventional commit formats:
- `feat: add candidate export to excel`
- `fix: wrap offer-letters page in Suspense boundary`
- `docs: update Supabase migration guide`
- `refactor: optimize scoring engine calculation`

---

## Pull Request Process

1. Ensure all new code has matching unit or integration tests in `tests/run-tests.js`.
2. Update documentation if introducing new configuration options or API routes.
3. Submit a Pull Request targeting `main`. Provide a descriptive PR summary with screenshots or recordings for UI changes.
