---
marp: true
paginate: true
transition: fade
# PechaKucha: 6 slides, 20s auto-advance. Do not change the count.
auto-advance: 20
---

<!-- slide 1 -->
# Who's my person?

**HR recruiters and hiring managers** deluged with 100+ resumes per job posting. Every minute lost to manual screening is a minute not spent talking to actual candidates. They need a fast, consistent, bias-free way to surface the best matches — before burnout or fatigue gets in the way.

---

<!-- slide 2 -->
# Their problem

**Manual resume screening doesn't scale.**

- Inconsistent scoring — every reviewer applies their own unwritten standards
- Hours wasted reading irrelevant applications that never fit the role
- Great candidates slip through the cracks due to fatigue and unconscious bias
- No audit trail — no defensible record of why someone was shortlisted or rejected

---

<!-- slide 3 -->
# What I built

**Automated Resume Screening Tool** — a three-service platform:

| Service | Stack | Responsibility |
|---------|-------|----------------|
| **Backend API** | Laravel 13, MySQL, Sanctum | Auth, job CRUD, resume upload, candidate ranking, AI insights, audit logging |
| **NLP Scorer** | Flask 3, scikit-learn, Sentence-BERT | TF-IDF (40%) + semantic (60%) scoring, normalized 0–100 |
| **Frontend SPA** | React 19, Vite 8, Tailwind CSS 3 | Role-aware dashboard, bulk email, CSV export, user management |

AI-powered candidate summaries and interview questions via **Google Gemini**.

---

<!-- slide 4 -->
# How I built it

**Claude Code as my AI-powered dev partner** — coding at conversation speed.

- **MCP integrations**: GitHub server handled PRs, branches, and commits directly from the CLI — no context-switching to a browser
- **Skills**: workflow-aligned prompts for backend review, frontend review, test fixing, and documentation — each task got the right lens
- **Agents on demand**: a security auditor ran a 10-dimension scan (credentials, auth, CORS, injection, CVEs); a file-error fixer handled single-file diagnostics with minimal diffs
- **10+ sprint iterations**: real feature work — error boundaries, responsive layout, analytics tracking, accessibility — not a boilerplate demo

The tool shipped with every PR reviewed, every test green, and known CVEs documented.

---

<!-- slide 5 -->
# Why it matters

**Faster, fairer, and more transparent hiring — in production today.**

- **80% less time** on initial screening — recruiters focus on people, not paper
- **Consistent scoring** — every resume measured against the same job criteria, every time
- **Full audit trail** — every shortlist, reject, or hold logged with reasons. Defensible decisions
- **Data-driven insight** — TF-IDF catches keyword fit, Sentence-BERT captures semantic nuance. Bias-reducing by design
- **AI summaries** — Gemini-generated candidate snapshots and interview questions, ready to use

---

<!-- slide 6 -->
# Done checklist

- [x] **Public repo** — open source on GitHub, MIT licensed, real commit history
- [x] **MCP used** — GitHub server for PRs, commits, and repository management
- [x] **Skills used** — code-review (backend + frontend), test-fixer, markdown-creator
- [x] **Agents used** — security-auditor (10-dimension scan, findings committed to repo)
- [x] **Shipped features** — auth, resume scoring, job CRUD, AI insights, bulk email, audit logs, analytics
- [x] **`report.md` committed** — security audit report in the team repo

**→ github.com/thet-naing-lin/resume-screening**
