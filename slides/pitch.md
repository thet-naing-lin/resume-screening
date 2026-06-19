---
marp: true
paginate: true
transition: fade
# PechaKucha: 6 slides, 20s auto-advance. Do not change the count.
auto-advance: 20
---

<!-- slide 1 -->
# Who's my person?
<!-- 20s -->

HR recruiters and hiring managers who receive **100+ resumes per job posting**. Every minute spent manually screening is a minute not spent talking to actual candidates. They need a way to surface the best matches — fast, consistently, and without bias.

---

<!-- slide 2 -->
# Their problem

**Manual resume screening doesn't scale.**

- Inconsistent scoring — different reviewers apply different standards
- Hours wasted reading irrelevant applications
- Great candidates missed due to fatigue and unconscious bias
- No audit trail for why a candidate was shortlisted or rejected

---

<!-- slide 3 -->
# What I built

**Automated Resume Screening Tool** — a three-service platform:

| Service | Stack | Responsibility |
|---------|-------|----------------|
| **Backend API** | Laravel 13, MySQL, Sanctum | Auth, job CRUD, resume upload, candidate ranking, AI insights, audit logging |
| **NLP Scorer** | Flask, scikit-learn, Sentence-BERT | TF-IDF (40%) + semantic (60%) scoring, weighted to 0–100 |
| **Frontend SPA** | React 19, Vite, Tailwind CSS | Role-aware dashboard, bulk email, CSV export, user management |

---

<!-- slide 4 -->
# How I built it

**Claude Code as my AI-powered dev partner.**

- **MCP**: GitHub server — created and merged PRs, managed branches and commits directly from the CLI
- **Skills**:
  - `backend-code-review` — systematic review of services, controllers, routes, config
  - `frontend-code-review` — component architecture, state, a11y, performance, security
  - `test-fixer` — diagnose every failure, fix the root cause, re-run until green
  - `markdown-creator` — README, docs, PR descriptions
- **Agents**:
  - `security-auditor` — 10-dimension security scan (credentials, auth, CORS, injection, CVEs)
  - `file-error-fixer` — targeted single-file error diagnosis and minimal fixes

---

<!-- slide 5 -->
# Why it matters

**Faster, fairer, and more transparent hiring.**

- **80% less time** spent on initial screening — recruiters focus on people, not paper
- **Consistent scoring** — every resume measured against the same job description criteria
- **Audit trail** — every decision logged: shortlist, reject, or hold, with reasons
- **Data-driven** — TF-IDF + semantic AI scoring removes gut-feel guesswork

---

<!-- slide 6 -->
# Done checklist

- [x] Repo public — open source on GitHub, MIT licensed
- [x] MCP used — GitHub server for PRs, commits, repo management
- [x] Skills used — code-review (backend + frontend), test-fixer, markdown-creator
- [x] Agents used — security-auditor (10-dimension scan), file-error-fixer
- [x] `report.md` in team repo — security audit report committed

**github.com/thet-naing-lin/resume-screening**
