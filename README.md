# Aptly.AI — Clinical Talent Intelligence Platform

> AI-powered ATS replacing blind keyword filters with semantic skill evaluation, 
> transparent gap reports, and precision candidate ranking.

**Live Demo:** [aptly-zeta.vercel.app](https://aptly-zeta.vercel.app)  
**Built by:** [Ayush Kumar Pandey](https://github.com/ayush-3945)

---

## Tech Stack

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white&style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white&style=flat-square)
![Gemini](https://img.shields.io/badge/Google-Gemini_2.5_Flash-4285F4?logo=google&logoColor=white&style=flat-square)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?logo=vercel&logoColor=white&style=flat-square)

---

## Quick-Test Demo Accounts

| Role | Email | Password | What You Can Test |
| :--- | :--- | :--- | :--- |
| **Recruiter** | `recruiter@jobmatch.ai` | `password123` | Post Jobs with AI Quality Scorer, Drag-and-drop Kanban ATS, Interview Question Generator, Talent Pipeline Intelligence |
| **Candidate** | `candidate@jobmatch.ai` | `password123` | AI Resume Parser, Real-time match score preview, skill gap analysis, application tracking |

---

## Features

### Candidate Side
- **AI Resume Parser** — Upload PDF resume, Gemini extracts skills/experience/education and auto-fills profile
- **Real-time Match Score** — See your compatibility percentage before applying ("78% match — Missing: Docker, Kubernetes")
- **Skill Gap Report** — Transparent breakdown of matched vs missing skills for every job
- **Application Timeline** — Track status from Applied → Shortlisted → Interview → Offer → Hired

### Recruiter Side
- **Semantic ATS Matching** — Gemini 2.5 Flash evaluates candidates on actual skill competence, not keyword frequency
- **Kanban Pipeline** — Drag-and-drop candidate cards across 6 stages with email auto-triggers on stage change
- **Interview Question Generator** — AI generates 12 personalized questions (Warmup, Technical, Skill Gap Probe, Behavioral, Closing) based on each candidate's specific gaps
- **JD Quality Scorer** — Real-time job description analysis with overall score, bias detection, inclusivity check, and improvement suggestions
- **Interview Scheduler** — Book interviews directly in app with candidate email notifications
- **Email Notifications** — Automated emails via Resend for every pipeline event (application received, shortlisted, interview scheduled)

### Analytics
- **Talent Pipeline Intelligence** — AI-generated hiring insights, funnel drop-off analysis, bottleneck detection
- **Skill Demand Heatmap** — Top demanded skills across all jobs with Rising/Stable/Declining trends
- **Application Velocity Chart** — 8-week inflow trend with peak volume tracking
- **AI Match Quality Tiers** — Candidate distribution across Strong/Moderate/Low match bands

---

## Why Aptly.AI?

| Feature | Aptly.AI | Traditional ATS |
|---|---|---|
| Resume evaluation | Semantic AI matching | Keyword counting |
| Candidate feedback | Transparent skill gap report | Black box rejection |
| JD optimization | Real-time quality scorer + bias detection | None |
| Interview prep | AI-generated personalized questions | Generic templates |
| Pipeline view | Drag-drop Kanban with AI filters | Static list |
| Analytics | AI insights + bottleneck detection | Raw numbers only |

---

## Architecture

```
JobMatch-AI/
├── client/                  # React 19 + Vite (Frontend)
│   └── src/
│       ├── pages/           # Home, JobsList, PostJob, Dashboard, JobApplicants
│       ├── components/      # KanbanBoard, InterviewKitModal, JDQualityPanel, RecruiterAnalytics
│       └── index.css        # Clinical Teal Paper design system
│
└── src/                     # Node.js + Express (Backend)
    ├── models/              # User, Job, Application, Interview
    ├── routes/              # Auth, Jobs, Applications, Interviews, Analytics
    ├── controllers/         # Business logic
    └── services/            # Gemini AI integrations
        ├── resumeParserService.js
        ├── matchScoreService.js
        ├── interviewQuestionService.js
        ├── jdScorerService.js
        └── analyticsService.js
```

---

## Local Setup

```bash
# 1. Clone repository
git clone https://github.com/ayush-3945/Aptly.git
cd Aptly/JobMatch-AI

# 2. Backend Setup
npm install
# Configure your .env file
npm run dev

# 3. Frontend Setup (in a separate terminal)
cd client
npm install
npm run dev
```

---

## Environment Variables

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_google_gemini_api_key
RESEND_API_KEY=your_resend_api_key
CLIENT_URL=http://localhost:5173
PORT=5000
```

---

*© 2026 Aptly.AI — Engineered by Ayush Kumar Pandey*
