<div align="center">

# ⚡ Aptly.AI — Clinical Talent Intelligence Platform

### Next-Generation Semantic ATS, Real-Time Requisition Scorer, Kanban Pipeline & Talent Analytics

[![CI Full-Stack Verification](https://github.com/ayush-3945/Aptly/actions/workflows/ci.yml/badge.svg)](https://github.com/ayush-3945/Aptly/actions/workflows/ci.yml)
[![Live Production Demo](https://img.shields.io/badge/Vercel-Live%20Production-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://aptly-zeta.vercel.app)
[![Node.js 20+](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Google Gemini 2.5](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![MongoDB Cluster](https://img.shields.io/badge/MongoDB-Atlas%20Cluster-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <a href="https://aptly-zeta.vercel.app"><strong>🌐 Explore Live Production App »</strong></a> •
  <a href="#-quick-test-credentials-1-click-demo">Quick Demo Credentials</a> •
  <a href="#-system-architecture--data-flow">System Architecture</a> •
  <a href="#-why-aptlyai--the-legacy-ats-problem">Why Aptly?</a> •
  <a href="#-core-feature-suite">Feature Suite</a> •
  <a href="#-complete-rest-api-reference">API Reference</a> •
  <a href="#-architectural-qa--interview-defense">Technical Defense Guide</a>
</p>

</div>

---

## 🎯 Quick-Test Credentials (1-Click Demo)

The live production deployment is hosted at **[aptly-zeta.vercel.app](https://aptly-zeta.vercel.app)** with 1-click credential auto-fill:

| Persona | Demo Email | Demo Password | Capabilities & Test Views |
| :--- | :--- | :--- | :--- |
| **🏢 Recruiter** | `recruiter@jobmatch.ai` | `password123` | **Post a Job** with live 60/40 AI Quality Scorer & bias alerts, **ATS Pipeline Kanban** with 6-stage drag-and-drop, **AI Interview Question Generator**, **Talent Pipeline Intelligence Analytics v2** |
| **🎯 Candidate** | `candidate@jobmatch.ai` | `password123` | Explore open roles, **AI Resume Parser** (PDF extraction), **Pre-apply live compatibility match score**, skill gap breakdown, application timeline |

*Tip: You can also register a fresh account or click the "Quick Demo Fill" buttons directly on the Login page.*

---

## 💡 Why Aptly.AI? — The Legacy ATS Problem

### The Broken Legacy ATS Landscape
Traditional Applicant Tracking Systems rely on **naive, brittle keyword regex matching**. If a candidate writes *"Containerized backend microservices with Kubernetes & Podman"* instead of the literal string *"Docker"*, legacy filters silently reject them.
* **Over 75% of qualified engineering candidates** are discarded due to arbitrary lexical discrepancies.
* **Keyword stuffing games**: Candidates optimize for robot filters rather than describing real architectural impact.
* **Recruiter overload**: Hiring managers still end up skimming hundreds of non-vetted resumes or miss top-tier specialists.

### The Aptly.AI Breakthrough
Aptly replaces rigid regex filters with **deep semantic LLM vector comprehension** powered by Google Gemini 2.5 Flash:

| Evaluation Dimension | Aptly.AI | Traditional ATS (Taleo, Workday, Greenhouse) |
|---|---|---|
| **Resume Evaluation** | **Semantic Context & Concept Synergy** (understands polyglot stacks, framework equivalents) | Naive exact-string regex counting |
| **Candidate Transparency** | **Live Pre-Apply Match Score & Skill Gap Report** ("78% match — Missing: Docker") | Black-box automated rejection after 3 weeks |
| **Requisition Quality** | **Real-Time AI Scorer** with bias detection, pool size prediction & code rewrites | Blank text field without feedback |
| **Interview Preparation** | **AI Question Kit Generator** tailored to candidate's exact skill gaps | Generic static behavioral question PDFs |
| **Pipeline Visualization** | **Interactive 6-stage Kanban board** with optimistic UI updates | Flat tabular list requiring dozens of clicks |
| **Talent Telemetry** | **Pipeline Intelligence v2**: Inverted funnel, bottleneck alert, skill heatmap | Raw uninterpreted applicant numbers |

---

## 🏗️ System Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Frontend Client (React 19 + Vite)                    │
│   • Clinical Teal Paper Design System (CSS custom tokens)              │
│   • 6-Stage Drag-and-Drop Candidate Kanban (@dnd-kit/core)             │
│   • Real-Time Debounced JD Quality Scorer Panel (60/40 Split)          │
│   • Personalized Interview Question Modal & PDF Kit Export             │
│   • Talent Pipeline Intelligence v2 Analytics Visualizers              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST / Bearer JWT
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Express.js 5.0 API Gateway & Router                  │
│   • Security Middleware: Helmet, CORS Whitelist, Domain Rate Limiters   │
│   • Public Diagnostic Health Probes (/api/health)                      │
│   • Role-Based Access Control (RBAC): Candidate vs. Recruiter          │
│   • Global Error Handling & Request Sanitization                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           │ Multipart PDF Upload Pipeline                   │ DB Query & Persistence
           ▼                                                 ▼
┌──────────────────────────────────────┐          ┌──────────────────────┐
│  Multer In-Memory / Disk File Buffer │          │  MongoDB Atlas       │
│  pdf-parse Clean Text Normalizer     │          │  (Users, Jobs, Apps, │
└──────────────────┬───────────────────┘          │   Interviews)        │
                   │ Extracted Text Stream        └──────────┬───────────┘
                   ▼                                         │
┌──────────────────────────────────────────────────────┐     │
│       Gemini 2.5 Flash Foundation Model Engine       │     │
│   • Strict JSON Schema Guarantee (responseMimeType)  │     │
│   • Resume Semantic Parsing & Tech Stack Profiling   │     │
│   • Candidate Compatibility & Fit Synthesis          │     │
│   • Job Description Scorer & Bias Language Scanner   │     │
│   • Personalized Interview Question Generator        │     │
│   • Talent Pipeline Attrition & Bottleneck Telemetry │     │
│   • Deterministic Heuristic Fallback Circuit Breaker │     │
└──────────────────┬───────────────────────────────────┘     │
                   │ Validated AI ATS Evaluation Payloads    │
                   ▼                                         │
┌──────────────────────────────────────────────────────┐     │
│          Recruiter Operations & Automation           ◄─────┘
│   • 6-Stage Kanban Pipeline: Applied ➔ Shortlisted ➔ │
│     Interview ➔ Offer ➔ Hired ➔ Rejected             │
│   • Automated Email Notifications via Resend         │
│   • Native Interview Booking & Status Synchronization│
└──────────────────────────────────────────────────────┘
```

---

## ⚡ Core Feature Suite

### 1. Candidate Experience
* **AI Resume Parser**: Upload any PDF resume. Multer streams the binary to `pdf-parse`, extracts raw text, and prompts Gemini to extract structured contact info, technical skills, years of experience, and education.
* **Pre-Apply Compatibility Scorecard**: Before applying, candidates see a real-time preview score (0–100%) against the job requisition, highlighting matched skills in green and missing prerequisites in amber.
* **Transparent Skill Gap Breakdown**: No more mystery rejections. Candidates receive explicit feedback on what competencies they possess and what certifications or tools are missing.
* **Application Tracker**: Real-time status tracker following candidates across all 6 stages of the hiring pipeline.

### 2. Recruiter Studio & Pipeline Management
* **Interactive ATS Kanban Board**:
  * 6 columns: `Applied` ➔ `Shortlisted` ➔ `Interview` ➔ `Offer` ➔ `Hired` ➔ `Rejected`.
  * Built with `@dnd-kit/core` and `@dnd-kit/sortable` supporting desktop mouse and mobile touch sensors.
  * Native browser tooltips on candidate cards (`title={candidate.fullName}` and `title={job.title}`).
  * Non-blocking automated email triggers on stage transitions.
* **AI Job Description Quality Scorer**:
  * Responsive 60/40 split layout on the **Post a Job** page.
  * Real-time 1.5s debounced scoring + manual *"Analyze Current Text"* trigger.
  * Animated SVG circular score ring (0–100) with color-coded performance tiers (Green ≥80, Teal 65–79, Amber 50–64, Red <50).
  * **Exclusionary Bias Language Scanner**: Detects and flags terms like *ninja*, *rockstar*, *guru*, *young*, *energetic*, *work hard play hard*, and *aggressive*, explaining why they hurt diversity and providing inclusive alternatives.
  * Category progress bars for **Clarity**, **Specificity**, **Inclusivity**, **Competitiveness**, and **Structure**.
  * Actionable code rewrite suggestions with before/after comparisons.
  * Non-blocking warning banner: never disables job posting if the recruiter wishes to proceed.
* **AI Interview Question Generator**:
  * Generates 12 personalized interview questions based on each candidate's exact skill gaps and the job requisition.
  * 5 structured question categories: **Warmup**, **Technical Deep-Dive** (with difficulty ratings), **Skill Gap Probes**, **Behavioral & Cultural**, and **Closing Alignment**.
  * Each question includes target skill, interviewer rationale, expected answers, and red-flag warning signs.
  * 1-click **Copy All Questions** and **Print Clean Interview Kit** capabilities.
* **Interview Scheduler**: Book virtual interviews directly from the candidate scorecard with date/time pickers and meeting link generator.
* **Automated Transactional Emails**: Powered by the Resend API, sending instant notifications when applications are submitted, reviewed, invited to interview, or hired.

### 3. Talent Pipeline Intelligence & Analytics v2
* **Pipeline Health Status**: Executive badge (*Excellent*, *Good*, *Fair*, *Poor*) synthesized by Gemini with a 1-click *"Refresh Insights"* telemetry engine.
* **Key Metrics Row**:
  * **Pipeline Conversion Rate** with week-over-week trend arrow (`+8.2% vs last week`).
  * **AI Match Score Health** with inline segmented mini-bar showing Strong/Moderate/Low match distributions.
  * **ATS Screening Velocity** (`< 2.5s Real-Time Engine`).
  * **Average Days to Hire** compared against the 23-day industry benchmark.
* **AI Insights Panel**: 2-column grid of actionable cards color-coded by severity (`success`=green, `warning`=amber, `opportunity`=teal, `risk`=red), each with metric highlights and recommended actions.
* **Pipeline Bottleneck Alert**: Identifies the exact transition stage with the highest drop-off rate, details the root cause, and offers an immediate tactical fix.
* **Inverted Trapezoid Hiring Funnel**: True geometric funnel displaying sequential attrition from Applied to Hired with candidate counts and drop-off percentages.
* **AI Match Quality Tiers**: Breakdown of candidate volume in Strong Match (≥75%), Moderate Match (50–74%), and Low Match (<50%) bands.
* **Skill Demand Heatmap**: Horizontal bar chart of top 8 technical skills with demand score (0–100) and trajectory indicators (*rising*, *stable*, *declining*).
* **Strategic Recommendations**: 3 prioritized interventions (High/Medium/Low priority) with expected impact calculations.
* **8-Week Hiring Velocity Timeline**: Interactive SVG area/line chart showing weekly application inflow trends with hoverable data points.

---

## 🎨 Design System: Clinical Teal Paper

Aptly is built on a custom design system engineered for high density, zero distraction, and editorial authority:

```css
:root {
  --bg-primary: #F4F4F0;        /* Warm off-white paper canvas */
  --bg-secondary: #ECEAE4;      /* Neutral supporting container background */
  --bg-card: #FFFFFF;           /* Crisp card surface */
  --accent-teal: #0F6B5C;        /* Clinical deep teal — primary brand mark */
  --accent-teal-light: #E6F4F1;  /* Subtle teal tint for pill tags */
  --accent-teal-mid: #1D9E75;    /* Interactive hover state */
  --text-primary: #141414;       /* High-contrast near-black typography */
  --text-secondary: #4A4A47;     /* Subdued metadata & body copy */
  --border-default: #E0DDD5;     /* Warm hairline border */
  --semantic-green: #2D7A3A;     /* Strong match, verified states */
  --semantic-amber: #B45309;     /* Moderate match, cautionary warnings */
  --semantic-red: #B91C1C;       /* Low match, drop-off risks */
}
```

* **Headlines**: Elegant serif typography (`'Newsreader', Georgia, serif`) for an authoritative editorial tone.
* **Body Copy**: High-legibility sans-serif (`Inter`) for crisp UI controls and table layouts.
* **Metrics & Badges**: Monospace numerals (`'JetBrains Mono'`) for precision scores and telemetry stats.

---

## 📁 Repository Structure

```
JobMatch-AI/
├── client/                  # React 19 + Vite (Frontend SPA)
│   ├── src/
│   │   ├── components/      # UI Components
│   │   │   ├── KanbanBoard.jsx          # Drag-and-drop 6-stage candidate pipeline
│   │   │   ├── JDQualityPanel.jsx       # Real-time scoring sidebar with bias detection
│   │   │   ├── InterviewKitModal.jsx    # AI interview question kit modal
│   │   │   ├── RecruiterAnalytics.jsx   # Talent Pipeline Intelligence v2 dashboard
│   │   │   ├── Navbar.jsx               # Role-based navigation with mobile drawer
│   │   │   └── ProtectedRoute.jsx       # RBAC client route guard
│   │   ├── pages/           # Application Views
│   │   │   ├── Home.jsx                 # Landing page with interactive feature demos
│   │   │   ├── Dashboard.jsx            # Unified Recruiter/Candidate hub
│   │   │   ├── PostJob.jsx              # 60/40 requisition editor with live AI scorer
│   │   │   ├── JobsList.jsx             # Searchable job catalog with skill filters
│   │   │   ├── JobDetail.jsx            # Job requisition & pre-apply match scorecard
│   │   │   └── CandidateProfile.jsx     # Resume upload & profile manager
│   │   ├── context/         # AuthContext & ToastContext providers
│   │   ├── services/        # Axios API client with bearer token interceptors
│   │   └── index.css        # Clinical Teal Paper design tokens & responsive utilities
│   ├── package.json
│   └── vite.config.js
│
├── src/                     # Node.js + Express (Backend API)
│   ├── config/              # db.js (MongoDB Mongoose) & aiConfig.js (Gemini SDK)
│   ├── controllers/         # Request handling & HTTP status logic
│   │   ├── authController.js            # Registration, login, JWT issuance
│   │   ├── jobController.js             # Job CRUD & POST /score-jd handler
│   │   ├── applicationController.js     # Resume upload, status transitions
│   │   ├── interviewController.js       # AI question kit & scheduling
│   │   └── analyticsController.js       # GET /api/analytics/insights handler
│   ├── middlewares/         # Security, rate limiting, auth & error handlers
│   ├── models/              # User, Job, Application, Interview Mongoose schemas
│   ├── routes/              # Express API endpoint definitions
│   └── services/            # Core business & AI integration layer
│       ├── resumeParserService.js       # PDF text extraction & structuring
│       ├── matchScoreService.js         # Semantic compatibility & skill gap analysis
│       ├── jdScorerService.js           # Requisition quality & bias scanner
│       ├── interviewQuestionService.js  # 12-question personalized interview generator
│       ├── analyticsService.js          # Pipeline aggregation & Gemini telemetry
│       └── emailService.js              # Resend transactional email triggers
│
├── scripts/                 # Standalone verification & diagnostic tests
│   ├── seedDatabase.js                  # Idempotent DB seeder with realistic test data
│   ├── testScoreJd.js                   # Verification test for JD Scorer & bias engine
│   ├── testAnalyticsInsights.js         # Verification test for pipeline analytics
│   └── testPreviewMatch.js              # Verification test for resume matching
│
├── server.js                # Main HTTP server entry point
└── package.json
```

---

## 🛠️ Complete REST API Reference

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new Candidate or Recruiter |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive signed Bearer JWT |
| `GET` | `/api/auth/me` | Bearer Token | Retrieve authenticated user profile |
| `GET` | `/api/jobs` | Public | Retrieve paginated job catalog with search/filter |
| `GET` | `/api/jobs/:id` | Public | Retrieve detailed job requisition |
| `POST` | `/api/jobs` | Recruiter | Publish a new job requisition |
| `POST` | `/api/jobs/score-jd` | Optional Auth | **Real-time AI JD Quality Scoring & bias language scan** |
| `POST` | `/api/applications/apply/:jobId` | Candidate | Upload PDF resume, parse, evaluate match, and create application |
| `GET` | `/api/applications/my-applications`| Candidate | Retrieve candidate's personal submitted applications |
| `GET` | `/api/applications/job/:jobId` | Recruiter | Retrieve all candidate applications for a specific job |
| `PATCH`| `/api/applications/:id/status` | Recruiter | Update candidate status across Kanban pipeline stages |
| `POST` | `/api/interviews/generate-questions` | Recruiter | **Generate 12 personalized interview questions by skill gaps** |
| `POST` | `/api/interviews/schedule` | Recruiter | Schedule interview date/time with candidate email notification |
| `GET` | `/api/analytics/insights` | Optional Auth | **Talent Pipeline Intelligence v2 (Funnel, Metrics, AI Insights)** |
| `GET` | `/api/health` | Public | Diagnostic uptime probe, memory, and database status |

---

## 🚀 Local Setup & Installation

### Prerequisites
* **Node.js**: v20.x or newer
* **npm**: v10.x or newer
* **MongoDB**: Local instance (`mongodb://localhost:27017`) or free MongoDB Atlas cluster URI
* **Google Gemini API Key**: Free key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/ayush-3945/Aptly.git
cd Aptly/JobMatch-AI
```

### 2. Backend Installation & Configuration
```bash
# Install backend dependencies
npm install

# Create environment configuration
# On Linux/macOS:
cp .env.example .env
# On Windows PowerShell:
# Copy-Item .env.example .env
```

Edit `.env` with your credentials:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_minimum_32_chars
GEMINI_API_KEY=your_gemini_api_key
RESEND_API_KEY=your_resend_api_key_optional
CLIENT_URL=http://localhost:5173
```

Seed initial demo jobs, users, and scored candidates:
```bash
npm run seed
```

Start backend development server:
```bash
npm run dev
# Server will run on http://localhost:5000
```

### 3. Frontend Installation & Startup
In a new terminal window:
```bash
cd client
npm install
npm run dev
# Vite client will run on http://localhost:5173
```

Open your browser at **`http://localhost:5173`** and sign in using the Quick Demo buttons!

---

## 🛡️ Resilience & Circuit Breakers

Aptly is engineered for bulletproof production reliability:
1. **Deterministic Heuristic Fallbacks**: Every AI integration (`matchScoreService`, `jdScorerService`, `interviewQuestionService`, and `analyticsService`) includes a local heuristic fallback engine. If the Gemini API experiences network timeouts, quota exhaustion, or temporary outages, the system seamlessly fulfills the request without user-facing crashes.
2. **Strict JSON Schema Enforcement**: LLM queries leverage `responseMimeType: 'application/json'` and programmatic JSON sanitizers to eliminate markdown fences (` ```json `), preventing JSON parse syntax errors.
3. **Graceful Database Offline Handling**: If MongoDB is slow to respond or offline, the client seamlessly renders pre-calculated demo applications, ensuring offline demos, campus presentations, and recruitment showcases remain fully functional.

---

## 🧠 Architectural Q&A — Technical Defense Guide

#### Q1: Why did you choose Google Gemini 2.5 Flash over OpenAI GPT-4o?
> **Answer**: Gemini 2.5 Flash offers the ideal balance of sub-second inference latency, high token throughput, and native JSON mode enforcement (`responseMimeType: 'application/json'`). For real-time applications like our **1.5s debounced JD Scorer** and rapid PDF resume evaluation, Gemini Flash provides near-instant response times at significantly lower compute costs while maintaining deep semantic comprehension of technical developer stacks.

#### Q2: How does Aptly prevent AI hallucinations in ATS scoring?
> **Answer**: We employ three layers of defense:
> 1. **Structured Rubric Prompting**: The LLM is constrained to evaluate solely against explicit skills extracted from the candidate's actual text and the job requisition.
> 2. **Boundary Normalization**: All scores are clamped between 0 and 100, and recommendations are constrained to a fixed enum (`Strong Match`, `Moderate Match`, `Low Match`).
> 3. **Validation & Fallback**: If the returned payload lacks required keys, a deterministic heuristic analyzer recalculates the score using exact and synonym token matching.

#### Q3: How do optimistic updates work in the Kanban Board?
> **Answer**: When a recruiter drags a card from `Applied` to `Shortlisted`, `@dnd-kit` immediately updates the client-side state. Simultaneously, an asynchronous `PATCH /api/applications/:id/status` request is dispatched to MongoDB. If the network request fails, the card automatically rolls back to its original column and triggers a red toast alert, ensuring data integrity without UI lag.

---

## 📄 License & Attribution

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
Copyright (c) 2026 Ayush Kumar Pandey

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

<div align="center">

**Built with precision by [Ayush Kumar Pandey](https://github.com/ayush-3945)**  
*Clinical Talent Intelligence • Next-Generation Semantic Recruitment*

</div>