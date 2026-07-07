<div align="center">

# 🚀 Tech Stack & AI Workflow

## Resume Screening System

</div>

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│            React 19 + Vite 8 + Tailwind CSS                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND API                              │
│              Laravel 13 (PHP 8.3) + Sanctum                    │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │  MySQL   │   │  Redis   │   │ Python   │
        │ Database │   │  Queue   │   │  Scorer  │
        └──────────┘   └──────────┘   └──────────┘
```

---

## 💻 Tech Stack

<table>
<tr>
<td width="50%">

### 🎨 Frontend

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **Vite 8** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **Zustand** | State management |
| **React Hook Form** | Form handling |
| **Zod** | Schema validation |
| **Lucide React** | Icon library |

</td>
<td width="50%">

### ⚙️ Backend

| Technology | Purpose |
|------------|---------|
| **Laravel 13** | PHP framework |
| **PHP 8.3** | Runtime |
| **Sanctum** | API authentication |
| **Spatie Permission** | Role-based access |
| **Redis** | Queue & caching |
| **MySQL** | Primary database |
| **SendGrid** | Email service |

</td>
</tr>
</table>

<table>
<tr>
<td width="50%">

### 🤖 AI/ML Pipeline

| Technology | Purpose |
|------------|---------|
| **Google Gemini API** | Candidate summaries |
| **Sentence-BERT** | Semantic embeddings |
| **TF-IDF** | Keyword matching |
| **scikit-learn** | ML utilities |

**Scoring Formula:**
```
Final Score = 0.4 × TF-IDF + 0.6 × Semantic
```

</td>
<td width="50%">

### 🛠️ DevOps & Tools

| Technology | Purpose |
|------------|---------|
| **Git** | Version control |
| **Vercel** | Frontend hosting |
| **Docker** | Containerization |
| **PHPUnit** | Backend testing |
| **ESLint** | Frontend linting |

</td>
</tr>
</table>

---

## 🤖 AI Agents

<div align="center">

| Agent | Description | When to Use |
|:-----:|-------------|-------------|
| 🔧 | **file-error-fixer** | Analyzes file system errors and permission issues, then applies fixes automatically |
| 🛡️ | **security-auditor** | Reviews code for security vulnerabilities and recommends hardening measures |

</div>

### Agent Workflow

```
User Request
     │
     ▼
┌─────────────────┐
│   Claude Code   │
│   (Main Agent)  │
└────────┬────────┘
         │
         ├──────────────────┐
         ▼                  ▼
┌─────────────────┐  ┌─────────────────┐
│ file-error-     │  │ security-       │
│ fixer           │  │ auditor         │
└─────────────────┘  └─────────────────┘
```

---

## 🎯 Skills

<div align="center">

| Skill | Purpose | Trigger |
|:-----:|---------|---------|
| 📝 | **backend-code-review** | Reviews services, controllers, routes for quality |
| 🎨 | **frontend-code-review** | Reviews React components and UI code |
| 🧪 | **test-fixer** | Diagnoses and fixes failing tests |

</div>

### Skill Details

<table>
<tr>
<td>

**📝 backend-code-review**
- Services layer analysis
- Controller validation
- Route consistency check
- Config drift detection

</td>
<td>

**🎨 frontend-code-review**
- Component structure
- State management
- Performance patterns
- Accessibility checks

</td>
<td>

**🧪 test-fixer**
- Test failure diagnosis
- Auto-fix common issues
- Coverage improvement
- Flaky test detection

</td>
</tr>
</table>

---

## 🔄 Methodology

<div align="center">

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  PLAN    │───▶│  BUILD   │───▶│  REVIEW  │───▶│  DEPLOY  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │
     ▼               ▼               ▼               ▼
 Requirements    AI-Assisted    Skills &       Vercel
  Gathering      Code Gen       Agents         Hosting
```

</div>

### Development Workflow

1. **📋 Planning** — Define requirements, break down features
2. **🔨 Building** — Claude Code generates code, edits files, runs commands
3. **✅ Review** — Skills auto-activate for code review and quality checks
4. **🚀 Deploy** — Push to GitHub, deploy to Vercel

---

## ⚡ Triggers & Commands

<table>
<tr>
<td width="50%">

### 🎯 Skills Trigger

| Trigger Phrase | Skill |
|----------------|-------|
| "Review the backend" | `backend-code-review` |
| "Audit the API" | `backend-code-review` |
| "Check frontend code" | `frontend-code-review` |
| "Fix failing tests" | `test-fixer` |

</td>
<td width="50%">

### 🤖 Agent Trigger

| Trigger Phrase | Agent |
|----------------|-------|
| "Fix file error" | `file-error-fixer` |
| "Permission issue" | `file-error-fixer` |
| "Security audit" | `security-auditor` |
| "Check vulnerabilities" | `security-auditor` |

</td>
</tr>
</table>

### 💬 Example Commands

```bash
# Launch Claude Code
claude

# Common tasks
"Implement candidate ranking API endpoint"
"Add audit logging middleware"
"Debug resume upload processing"
"Create bulk email feature"
"Review the backend code"
"Fix the failing tests"
"Run security audit"
```

---

## 📊 Project Metrics

<table>
<tr>
<td align="center" width="25%">

**Frontend**
<br>
📁 50+ Components
<br>
🎨 Tailwind CSS

</td>
<td align="center" width="25%">

**Backend**
<br>
🔌 20+ API Routes
<br>
⚙️ 10+ Services

</td>
<td align="center" width="25%">

**AI/ML**
<br>
🤖 2 Scoring Models
<br>
📊 Semantic Analysis

</td>
<td align="center" width="25%">

**Database**
<br>
🗄️ 15+ Tables
<br>
🔄 Redis Queue

</td>
</tr>
</table>

---

<div align="center">

### 🔗 Quick Links

[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/thet-naing-lin/resume-screening)
[![Live](https://img.shields.io/badge/Live-Demo-green?style=for-the-badge&logo=vercel)](https://resume-screening-vibe-code-tour.vercel.app/login)

</div>
