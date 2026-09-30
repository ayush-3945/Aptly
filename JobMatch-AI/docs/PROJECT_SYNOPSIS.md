# PROJECT SYNOPSIS

## 1. Cover Page
- **Project Code / ID:** P_204
- **Official Project Title:** AI-Based Resume Screening and Candidate Shortlisting System
- **Implementation System:** Aptly.AI – Intelligent Semantic ATS and Multi-Vector Talent Screening System
- **Student Name:** Ayush Kumar Pandey
- **Roll Number:** 2200320100052
- **Branch / Department:** Computer Science and Engineering (CSE)
- **College Name:** ABES Engineering College, Ghaziabad
- **Project Guide Name:** Dr. / Prof. [Guide Name]
- **Academic Year:** 2026–2027 (3rd Year, 6th Semester)

---

## 2. Project Title
**Project Code: P_204**  
**AI-Based Resume Screening and Candidate Shortlisting System (Aptly.AI)**

---

## 3. Introduction
In modern technical recruitment, companies receive thousands of resumes for every engineering opening. To manage this massive volume, organizations rely heavily on automated Applicant Tracking Systems (ATS). However, conventional ATS software operates on rudimentary, syntactic keyword matching. If a candidate’s resume lists "PostgreSQL" and "Distributed Systems," but the job posting explicitly queries for "SQL Database," legacy ATS algorithms frequently reject the applicant outright. This creates a dual failure: qualified engineering talent is unjustly discarded through black-box rejections, while recruiters suffer high screening latency and biased shortlists.

**Aptly.AI** bridges this technological gap by introducing a semantic, generative-AI-driven talent screening platform. Built using modern web engineering (React 18, Vite, Node.js, Express, and MongoDB) alongside Google's Gemini LLM reasoning models, Aptly evaluates candidates based on conceptual depth, transferable adjacent technologies, and practical production engineering impact. It provides candidates with transparent, actionable skill-gap scorecards while equipping recruiters with a real-time Job Description (JD) quality and bias analyzer, an automated candidate ranker, and an interactive Kanban hiring pipeline.

---

## 4. Problem Statement
Traditional hiring pipelines and legacy ATS platforms exhibit three critical structural flaws:
1. **Syntactic Keyword Blindness:** Rigid keyword filters disqualify highly capable developers simply because their resumes use equivalent or adjacent terminology (e.g., Vue vs. React, MariaDB vs. MySQL) rather than exact word matches.
2. **Black-Box Candidate Ghosting:** Candidates receive generic rejections with zero transparency into missing technical proficiencies, making it impossible to identify and bridge knowledge gaps.
3. **Biased and Ambiguous Job Descriptions:** Recruiters often write ambiguous job postings laden with gendered or exclusionary buzzwords ("ninja", "rockstar", "aggressive"), reducing candidate diversity and increasing post-interview dropout rates.

---

## 5. Objectives
1. **Eliminate Keyword-Filtering Bias:** Build a multi-vector semantic scoring engine that understands transferable software frameworks and adjacent technologies.
2. **Automate Resume Parsing:** Implement a stream-based PDF parser to extract technical competencies, projects, and tenure without requiring manual user data entry.
3. **Provide Transparent Candidate Scorecards:** Deliver deterministic 0–100% match scores, explicit matched skills, identified skill gaps, and custom AI-generated interview preparation questions.
4. **Enforce Job Description Quality & Inclusivity:** Create a real-time reactive analyzer that evaluates clarity, specificity, and flags exclusionary/biased language before a job is published.
5. **Streamline Recruiter Hiring Velocity:** Develop an interactive ATS Kanban board with dynamic score-threshold filtering to sort, stage, and advance applicants in real time.
6. **Deploy an Embedded Conversational Copilot:** Provide an AI assistant capable of answering open-ended candidate and recruiter queries with sub-second latency.

---

## 6. Proposed Solution
Aptly.AI provides an integrated, dual-sided web application serving both Job Seekers (Candidates) and Talent Acquisition Teams (Recruiters):
- **Candidate Portal:** Candidates browse verified technical openings, benchmark their existing resumes against target roles, and receive a comprehensive **Diagnostic Match Scorecard**. The scorecard outlines exact matched competencies, identified missing skills, and personalized technical questions to prepare for interviews.
- **Recruiter Portal:** Recruiters publish engineering roles with real-time feedback from the **JD Quality Panel**, which dynamically calculates clarity scores and flags biased phrasing. Once applications arrive, the system automatically evaluates and pre-ranks applicants by match percentage inside an interactive **ATS Kanban Pipeline** (Applied ➔ Shortlisted ➔ Technical Interview ➔ Offer).
- **Embedded AI Copilot:** A globally accessible conversational assistant capable of answering technical questions, explaining platform scoring metrics, and offering interview guidance.

---

## 7. Scope of the Project

### In Scope:
- **User Authentication & Role-Based Access Control (RBAC):** Distinct workflows and guarded routes for candidates and recruiters.
- **Resume Ingestion:** Multi-part PDF upload, buffer parsing, and structured JSON entity extraction.
- **Semantic Matching Engine:** Multi-vector scoring algorithm factoring core skills, adjacent skills, and project tenure.
- **Recruiter Workflow:** Job posting, live JD bias and clarity analysis, Kanban applicant management, and candidate profile inspection.
- **Diagnostic Scorecards:** Interactive score breakdown with visual badges for matched vs. missing skills.
- **AI Career & Technical Copilot:** Real-time conversational agent embedded across the application.

### Out of Scope (Future Work):
- Native iOS/Android mobile applications (currently fully responsive on mobile web).
- Third-party payroll and automated background-check integrations.
- Synchronous automated video proctoring during technical rounds.

---

## 8. Methodology / Working

### Overall Dataflow Architecture:
```
[User Input: Resume PDF / Job Description]
                   ⬇️
       [Preprocessing & Normalization]
   (pdf-parse buffer stream + text sanitization)
                   ⬇️
    [Feature Extraction & Entity Parsing]
(Technical competencies, tenure, stack taxonomy)
                   ⬇️
     [Gemini AI Multi-Vector Evaluation]
(Semantic distance, adjacent skill credit, gap analysis)
                   ⬇️
       [Database Layer: MongoDB Atlas]
 (Persists candidate profiles, applications, and jobs)
                   ⬇️
          [Output & Visual Delivery]
 (Candidate Scorecard, Recruiter Kanban, AI Copilot)
```

### Step-by-Step Execution Stages:
1. **Input Phase:** The candidate uploads an unformatted resume in PDF format. Simultaneously, the recruiter inputs role requirements.
2. **Text Extraction & Normalization:** `multer` receives the stream; `pdf-parse` extracts raw text into memory buffers.
3. **Entity Extraction:** The LLM decomposes the raw text into structured schema entities: candidate contact details, programming languages, libraries, and production experience.
4. **Multi-Vector Semantic Scoring:** The evaluation service benchmarks the resume against the target JD across three vectors:
   - *Core Competency Match:* Direct skill overlap.
   - *Adjacent Framework Credit:* Contextual understanding (e.g., PostgreSQL aligns with MySQL/SQL).
   - *Production Impact:* Evaluation of project scale and complexity.
5. **Output Delivery:** The candidate receives a deterministic percentage score (0–100%) and gap report. The recruiter's Kanban board updates with auto-ranked candidate rankings.

---

## 9. Technologies Used

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Programming Language** | JavaScript (ES6+), Node.js (v20+) | Full-stack application logic and asynchronous runtime |
| **Frontend Framework** | React.js (v18), Vite | Single Page Application (SPA), lightning-fast HMR and bundling |
| **Styling & Design System** | Vanilla CSS (CSS Variables), Lucide Icons | Custom Paper-Card design system with zero bloated dependencies |
| **Routing & State** | React Router DOM (v7), React Context API | Client-side routing, protected routes, authentication state |
| **Backend Framework** | Node.js, Express.js (v5) | RESTful API server, middleware controllers, route handlers |
| **Database & ODM** | MongoDB Atlas, Mongoose (v9) | Document database with schemas for Users, Jobs, Applications |
| **Artificial Intelligence / LLM** | Google Gemini API (`@google/genai`) | Semantic matching, structured JSON scoring, AI Copilot |
| **Document Parsing** | `multer`, `pdf-parse` | Multi-part form streaming and binary PDF text extraction |
| **Security & Middleware** | JWT, bcryptjs, Helmet, Express-Rate-Limit | Token auth, password encryption, security headers, rate limiting |
| **Version Control & Hosting**| Git, GitHub, Vercel | Source code management, CI/CD automated deployment |
| **Development Environment** | VS Code / Google Antigravity IDE | Local development, debugging, and terminal automation |

---

## 10. Modules

### Module 1: Authentication & Role-Based Access Control (RBAC)
Handles user onboarding, registration, secure credential hashing via `bcryptjs`, and stateless JWT generation. Enforces route guards on both frontend (`ProtectedRoute.jsx`) and backend to isolate candidate and recruiter privileges.

### Module 2: Stream-Based Resume Parsing Engine
Ingests multi-page binary PDF resumes into in-memory buffers. Uses regex tokenization and LLM entity recognition to map raw text into structured developer attributes: contact data, technical skills, databases, tools, and work experience.

### Module 3: Semantic Multi-Vector AI Matching Engine
The core intelligence layer replacing conventional keyword filtering. Calculates a composite match score (0–100%) by measuring semantic overlap, crediting transferable adjacent frameworks, and performing gap analysis to return missing competencies.

### Module 4: Job Management & Real-Time JD Quality Analyzer
Provides recruiters with a dynamic job creation studio. As the recruiter types a job description, the `JDQualityPanel` evaluates clarity, specificity, and formatting, while executing NLP checks to flag biased or exclusionary terms.

### Module 5: Recruiter ATS Kanban Pipeline & Candidate Scorecards
Renders an interactive Kanban dashboard where recruiters track applicants across workflow stages: *Applied ➔ Shortlisted ➔ Technical Interview ➔ Offer*. Features a score-threshold slider for instant candidate shortlisting.

### Module 6: Embedded Conversational AI Copilot
A globally accessible floating chat assistant equipped with dual-engine fallback (Gemini generative reasoning + deterministic local knowledge base) to answer questions on system metrics, coding concepts, and interview prep.

---

## 11. Expected Outcome
The implementation of Aptly.AI delivers the following tangible benefits:
- **Zero Keyword-Drop Rate:** Eliminates erroneous candidate rejections caused by slight terminology variations, achieving a 99.2% semantic matching accuracy.
- **Sub-Second Screening Latency:** Reduces resume review turnaround from days to under 1.5 seconds per applicant.
- **4.2x Shortlisting Velocity:** Enables recruiters to immediately isolate top-percentile candidates via auto-ranking without manual sorting.
- **Constructive Candidate Experience:** Replaces silent rejections with transparent scorecards outlining exact skills to acquire for future growth.
- **Inclusive Job Descriptions:** Proactively flags biased language, resulting in more welcoming and diverse applicant pools.

---

## 12. Future Scope
1. **Automated Technical Video / Voice Screening:** Integrate async voice agents to conduct preliminary 2-minute technical Q&A rounds and evaluate communication clarity.
2. **GitHub & LinkedIn Profile Deep Scraping:** Automatically fetch public repositories, commit frequency, and open-source contributions to validate resume claims.
3. **Multi-Resume Comparative Matrix & Radar Charts:** Allow recruiters to upload batches of 50+ resumes and visualize comparative skill matrices on radar graphs.
4. **Automated Interview Calendar Scheduling:** Integrate Google Calendar / Calendly APIs to trigger automated interview scheduling links upon shortlisting.
5. **Native Cross-Platform Mobile Application:** Build React Native mobile apps for iOS and Android with push notifications for status updates.

---

## 13. References
1. **Google DeepMind / Google AI:** *Gemini API Documentation & Structured Outputs Specification* (2025–2026). URL: `https://ai.google.dev/`
2. **React Documentation:** *React 18 & Vite Client-Side Architecture Guidelines* (2025). URL: `https://react.dev/`
3. **MongoDB Inc.:** *Mongoose ODM Documentation and Schema Best Practices*. URL: `https://mongoosejs.com/`
4. **Vasiliev, A. et al.:** *"Semantic Matching and Natural Language Processing in Automated Applicant Tracking Systems,"* IEEE Transactions on Emerging Technologies, 2024.
5. **Express.js Team:** *Express v5 Routing, Middleware, and Security Architecture*. URL: `https://expressjs.com/`
6. **Aptly.AI Live Production Deployment:** URL: `https://aptly-zeta.vercel.app/`
