<div align="center">

# ⚡ Aptly.AI - Intelligent Semantic Applicant Tracking System

### Next-Generation AI Candidate Matching, ATS Telemetry & Recruiter Kanban Pipeline

[![CI Full-Stack Verification](https://github.com/ayush-3945/Aptly/actions/workflows/ci.yml/badge.svg)](https://github.com/ayush-3945/Aptly/actions/workflows/ci.yml)
[![Vercel Live Demo](https://img.shields.io/badge/Vercel-Live%20Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://aptly-zeta.vercel.app)
[![Node.js 20+](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Google Gemini 2.5](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Cluster-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <a href="https://aptly-zeta.vercel.app"><strong>Explore Live Demo »</strong></a> •
  <a href="#-system-architecture--data-flow">System Architecture</a> •
  <a href="#-core-engineering-highlights">Engineering Highlights</a> •
  <a href="#-complete-rest-api-reference">API Reference</a> •
  <a href="#-interview-defense-guide-architectural-qa">Interview Defense Guide</a>
</p>

</div>

---

## 🎯 Quick-Test Credentials (1-Click Live Demo)

The live production deployment is hosted at **[aptly-zeta.vercel.app](https://aptly-zeta.vercel.app)** with instant role switching enabled:

| Persona | Demo Email | Demo Password | Capabilities & Test Views |
| :--- | :--- | :--- | :--- |
| **🎯 Candidate** | `candidate@jobmatch.ai` | `password123` | Explore open roles, bookmark jobs, upload PDF resumes, real-time Gemini AI ATS scoring, live application tracking |
| **🏢 Recruiter** | `recruiter@jobmatch.ai` | `password123` | Publish job requisitions, 5-stage interactive ATS Kanban board, 1-click status transitions, candidate match breakdown |

*Note: You can also register a new account or use the built-in "Fill Demo Candidate / Recruiter" pills on the login screen.*

---

## 💡 The Core Problem vs. Aptly's Solution

### The Broken Legacy ATS Landscape
Traditional Applicant Tracking Systems rely on **naive, brittle keyword regex matching**. If a candidate writes *"Containerized backend microservices with Kubernetes & Podman"* instead of the literal string *"Docker"*, legacy filters silently reject them.
* **Over 75% of qualified engineering candidates** are discarded due to arbitrary lexical discrepancies.
* **Keyword stuffing games**: Candidates optimize for robot filters rather than describing real architectural impact.
* **Lack of transparency**: Candidates never receive clinical diagnostic gap reports to understand why they were rejected.
* **Recruiter overload**: Hiring managers still end up skimming hundreds of non-vetted resumes or miss top-tier specialists.

### The Aptly.AI Breakthrough
Aptly replaces rigid regex filters with **deep semantic LLM vector comprehension** powered by Google Gemini 2.5 Flash:
1. **Contextual Skill & Experience Alignment**: Understands tech stack synergy, seniority signals, and domain equivalents (e.g., mapping GraphQL + Express to modern backend API competencies).
2. **Structured ATS Scorecards**: Emits a deterministic match score (0–100%), recommendation rating (`Strong Match`, `Moderate Match`, `Low Match`), matched skills array, missing skill gap synthesis, and executive fit rationales.
3. **Resilient Heuristic Fallback Engine**: High-availability circuit breaker ensures candidate applications and recruiter reviews never stall even during upstream LLM rate limits or offline network states.

---

## 🏗️ System Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Frontend Client (React 19 + Vite)                    │
│   • Glassmorphic Design System & Responsive Mobile Navigation Drawer   │
│   • Candidate Applications Tracker & Recruiter Kanban Pipeline Board    │
│   • Global Glass Toast Telemetry & Real-Time Bookmark Synchronization  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST / Bearer JWT
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Express.js 5.0 API Gateway & Router                  │
│   • Public Diagnostic Health Telemetry (/api/health)                   │
│   • Role-Based Access Control (RBAC) Guard: Candidate vs. Recruiter    │
│   • Global Error Handling & Request Rate Protection                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           │ Multipart PDF Upload Pipeline                   │ DB Query & Persistence
           ▼                                                 ▼
┌──────────────────────────────────────┐          ┌──────────────────────┐
│  Multer In-Memory / Disk File Buffer │          │  MongoDB Cluster     │
│  pdf-parse Clean Text Normalizer     │          │  (Users, Jobs, Apps) │
└──────────────────┬───────────────────┘          └──────────┬───────────┘
                   │ Extracted Text Stream                   │
                   ▼                                         │
┌──────────────────────────────────────────────────────┐     │
│       Gemini 2.5 Flash Structured ATS Engine         │     │
│   • Strict JSON Schema Validation Guarantee          │     │
│   • Semantic Skill Extraction & Experience Fit       │     │
│   • Resilient Heuristic Fallback Circuit Breaker     │     │
└──────────────────┬───────────────────────────────────┘     │
                   │ Validated AI ATS Evaluation Payload     │
                   ▼                                         │
┌──────────────────────────────────────────────────────┐     │
│          Recruiter Kanban ATS Pipeline Engine        ◄─────┘
│   • Stage Transitions: Applied ➔ Shortlisted ➔       │
│     Interview ➔ Offer Extended / Archived            │
└──────────────────────────────────────────────────────┘
```

---

## ⚡ Core Engineering Highlights

### 1. Semantic ATS Matching Engine with Strict JSON Schema
- Implemented via `@google/genai` utilizing the `gemini-2.5-flash` model.
- Strictly validates structured output into standard telemetry attributes:
  ```json
  {
    "aiMatchScore": 88,
    "recommendation": "Strong Match",
    "matchedSkills": ["React", "Node.js", "MongoDB", "Express", "Docker"],
    "missingSkills": ["Kubernetes"],
    "experienceFit": "Candidate has 4+ years architecting scalable full-stack MERN systems.",
    "fitSummary": "Strong alignment with senior backend engineering responsibilities."
  }
  ```

### 2. High-Availability Deterministic Heuristic Fallback
- Production systems cannot fail when external LLMs experience rate limits (HTTP 429) or transient network timeouts.
- Aptly features a dual-tier matching engine: If Gemini API credentials are absent or unavailable, the system transparently engages a **deterministic heuristic fallback** analyzer that stems keywords, validates required job qualifications, and computes calibrated scores without downtime.

### 3. Enterprise Recruiter Kanban Pipeline Board
- Interactive columnar pipeline (`Applied` ➔ `Shortlisted` ➔ `Interview` ➔ `Hired` ➔ `Rejected`).
- Smooth 1-click status transitions with optimistic UI updates and instant toast feedback.
- Real-time telemetry filter sliders (e.g. filter by 75%+ Strong Matches) and instant keyword candidate search.

### 4. Production System Health & Monitoring Telemetry (`GET /api/health`)
- Unauthenticated public endpoint reporting live operational telemetry for DevOps and automated uptime monitors (Pingdom, Datadog, Better Uptime):
  ```json
  {
    "status": "healthy",
    "service": "JobMatch AI (Aptly) Backend",
    "uptime": 1420,
    "database": {
      "status": "connected",
      "readyState": 1
    },
    "aiEngine": {
      "status": "active",
      "provider": "Google Gemini",
      "mode": "live_gemini_2.5_flash"
    },
    "timestamp": "2026-09-05T14:40:00.000Z"
  }
  ```

### 5. Automated GitHub Actions CI/CD Pipeline
- Fully automated workflow on every push and PR to `main`:
  - Installs backend & frontend dependencies cleanly (`npm ci`).
  - Executes the automated health check suite (`npm run test:health`).
  - Executes the 4-candidate multi-archetype AI benchmark suite (`npm run test:ai`).
  - Compiles the React 19 Vite production build with zero warnings or errors.

---

## 📡 Complete REST API Reference

All backend endpoints are prefixed with `/api`. Authenticated routes require an `Authorization: Bearer <jwt_token>` header.

| Method | Endpoint | Access | Description | Request Body / Query | Success Response (HTTP 200/201) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/health` | **Public** | System diagnostic & telemetry health check | None | `{ "status": "healthy", "uptime": 120, "database": {...}, "aiEngine": {...} }` |
| **POST** | `/auth/register` | **Public** | Create a new candidate or recruiter account | `{ name, email, password, role }` | `{ "user": { "_id", "name", "email", "role" }, "token": "<jwt>" }` |
| **POST** | `/auth/login` | **Public** | Authenticate user & issue JWT | `{ email, password }` | `{ "user": { "_id", "name", "email", "role" }, "token": "<jwt>" }` |
| **GET** | `/users/profile` | **Private** | Retrieve current user profile and role | None | `{ "_id", "name", "email", "role", "createdAt" }` |
| **GET** | `/jobs` | **Public** | List open jobs with keyword, location & skill query filters | `?keyword=react&location=remote&skill=node` | `[ { "_id", "title", "company", "location", "requiredSkills", ... } ]` |
| **GET** | `/jobs/:id` | **Public** | Retrieve full details for an individual job opening | None | `{ "_id", "title", "company", "description", "requiredSkills", ... }` |
| **POST** | `/jobs` | **Recruiter** | Publish a new job requisition | `{ title, company, location, requiredSkills, description }` | `{ "_id", "title", "company", "recruiter": "<user_id>", "createdAt" }` |
| **DELETE** | `/jobs/:id` | **Recruiter** | Remove a job requisition created by the recruiter | None | `{ "message": "Job removed successfully" }` |
| **POST** | `/resumes/upload` | **Candidate** | Upload PDF resume to secure server storage | `multipart/form-data; file: <resume.pdf>` | `{ "filePath": "uploads/resumes/resume-...", "fileName": "..." }` |
| **POST** | `/applications` | **Candidate** | Submit application & trigger Gemini AI ATS scoring | `{ jobId, resumeUrl, resumeText }` | `{ "_id", "aiMatchScore": 88, "recommendation": "Strong Match", ... }` |
| **GET** | `/applications/my-applications` | **Candidate** | Retrieve all applications submitted by candidate | None | `[ { "_id", "job": {...}, "status": "applied", "aiMatchScore": 88, ... } ]` |
| **GET** | `/applications/job/:jobId` | **Recruiter** | Fetch all candidate applicants for a specific job | None | `[ { "_id", "candidate": {...}, "status": "shortlisted", "aiMatchScore": 92 } ]` |
| **PATCH** | `/applications/:id/status` | **Recruiter** | Transition applicant status in Kanban pipeline | `{ status: "shortlisted" \| "interview" \| "hired" \| "rejected" }` | `{ "_id", "status": "shortlisted", "updatedAt": "..." }` |
| **DELETE** | `/applications/:id` | **Candidate** | Withdraw a previously submitted application | None | `{ "message": "Application withdrawn successfully" }` |

---

## 🚀 Quickstart & Local Setup Guide

### Prerequisites
- **Node.js**: v20.x or v24.x installed
- **MongoDB**: Local MongoDB community instance or free MongoDB Atlas URI
- **Git**

### 1. Clone & Configure Environment
```bash
git clone https://github.com/ayush-3945/Aptly.git
cd Aptly/JobMatch-AI
```

Create `.env` in `JobMatch-AI/`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/jobmatch-ai
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
GEMINI_API_KEY=your_gemini_api_key_optional_fallback_active_if_omitted
GEMINI_MODEL=gemini-2.5-flash
CLIENT_URL=http://localhost:3000
```

### 2. Install Dependencies
```bash
# Install root backend dependencies
npm install

# Install frontend client dependencies
npm --prefix client install
```

### 3. Seed Database & Run Test Suites
```bash
# Populate demo users, production jobs & Kanban applications
npm run seed

# Run system health check verifier (ephemeral test server)
npm run test:health

# Run Phase 2 multi-candidate AI ATS benchmark suite
npm run test:ai

# Verify client production build
npm run build
```

### 4. Launch Development Environment
In separate terminal tabs:
```bash
# Tab 1: Start Express Backend API (Port 5000)
npm run dev

# Tab 2: Start Vite Frontend Client (Port 3000)
npm run client
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.



## 📁 Repository Structure

```
Aptly/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI Workflow (Tests + Build)
├── JobMatch-AI/
│   ├── client/                  # React 19 + Vite Frontend Client
│   │   ├── public/              # Static assets & icons
│   │   ├── src/
│   │   │   ├── components/      # Navbar, Hero, ApplyModal, RecruiterAnalytics, etc.
│   │   │   ├── context/         # AuthContext, ToastContext
│   │   │   ├── pages/           # JobsList, JobDetail, CandidateDashboard, PostJob, JobApplicants
│   │   │   ├── services/        # Axios API Client with dynamic baseURL
│   │   │   └── utils/           # savedJobs helper & demoApplicants generator
│   │   └── package.json
│   ├── scripts/
│   │   ├── testHealth.js        # Automated Production Health Check Suite
│   │   └── verifyAIPipeline.js  # Phase 2 ATS Evaluation & Benchmarking Suite
│   ├── src/
│   │   ├── config/              # aiConfig.js (Gemini SDK), db.js (Mongoose)
│   │   ├── controllers/         # healthController, jobController, applicationController, etc.
│   │   ├── middlewares/         # authMiddleware, errorHandler, uploadMiddleware
│   │   ├── models/              # User, Job, Application Mongoose schemas
│   │   ├── routes/              # healthRoutes, jobRoutes, applicationRoutes, etc.
│   │   ├── services/            # aiMatcherService.js (Gemini 2.5 + Fallback)
│   │   └── app.js               # Express application configuration
│   ├── server.js                # Server entry point
│   └── package.json             # Root unified full-stack scripts
└── README.md                    # Root Showcase Documentation
```

---

## ⚖️ License

Distributed under the **MIT License**. See `LICENSE` for more information. Built with ❤️ for engineering teams seeking modern, unbiased talent alignment.
