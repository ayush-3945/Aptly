# 🎯 Aptly.AI — Comprehensive Technical Interview Preparation Guide

This document is your complete interview playbook for explaining and defending **Aptly.AI**. Every answer is grounded directly in the active codebase with exact file and function references.

---

## ⏱️ Part 1: The 60-Second Elevator Pitch

### 🇺🇸 English Version (For International & Senior Panels)
> *"Traditional Applicant Tracking Systems rely on naive keyword filters that silently discard up to 75% of qualified engineering candidates simply because they used synonymous or adjacent technical phrasing—like writing 'Kubernetes microservices' instead of 'Docker'.*
>
> *I built **Aptly.AI**, a full-stack MERN talent intelligence platform powered by Google Gemini 2.5. Rather than counting regex strings, Aptly performs structured semantic evaluation across 4 dimensions: technical skills, seniority and experience, domain alignment, and credentials. The final match score is computed deterministically in code with schema validation and protected by a local heuristic fallback circuit breaker so the platform never crashes if upstream AI quotas are hit.*
>
> *For recruiters, it provides a 6-stage drag-and-drop Kanban pipeline with optimistic UI updates and real-time JD bias scanning. For candidates, it delivers a transparent match scorecard with actionable skill-gap roadmaps instead of automated black-box rejections."*

### 🇮🇳 Hinglish Version (For Casual, Conversational & Tech Lead Rounds)
> *"Sir, traditional ATS systems me sabse badi problem ye hoti hai ki wo exact keyword matching karte hain. Agar job description me 'Docker' likha hai aur candidate ne 'Containerized microservices via Kubernetes' likha hai, toh legacy ATS us candidate ko reject kar deta hai.*
>
> *Is problem ko solve karne ke liye maine **Aptly.AI** develop kiya. Ye ek MERN + Google Gemini platform hai jo candidate ke resume ko semantically evaluate karta hai 4 dimensions me: core technical skills, experience tenure, domain alignment, aur education. Score ko hum code me calculate karte hain with 40/30/20/10 weighting and strict schema validation.*
>
> *Sabse important, maine isme production resilience build ki hai: agar Gemini API timeout ya quota limit me chali jaye, toh deterministic heuristic fallback instantly take over kar leta hai without zero downtime. Recruiter ke liye drag-and-drop Kanban pipeline hai with optimistic rollback, aur candidate ko transparent feedback milta hai ki unka score kya hai aur konsi skill missing hai."*

---

## 🧩 Part 2: Module Architecture & Code References

| Module | Core Functionality | Primary Files & Symbols |
| :--- | :--- | :--- |
| **Resume Upload & Parsing** | Validates PDF (MIME + ext check, 5MB limit), parses text stream via `pdf-parse`, and resolves file paths server-side with basename stripping to eliminate path traversal. | [`src/middlewares/uploadMiddleware.js`](file:///d:/Projects/Aptly/JobMatch-AI/src/middlewares/uploadMiddleware.js)<br>[`src/routes/resumeRoutes.js`](file:///d:/Projects/Aptly/JobMatch-AI/src/routes/resumeRoutes.js) |
| **AI Semantic Matching Engine** | Sends structured prompt to Gemini 2.5 Flash with `responseMimeType: 'application/json'`. Computes weighted match score in code and derives recommendation tier deterministically. | [`src/services/aiMatcherService.js`](file:///d:/Projects/Aptly/JobMatch-AI/src/services/aiMatcherService.js#L140-L280) (`evaluateResumeMatch`) |
| **Graceful Heuristic Fallback** | Deterministic token overlap analyzer comparing required job skills against resume text. Executes if Gemini API times out (15s) or encounters quota limits. | [`src/services/aiMatcherService.js`](file:///d:/Projects/Aptly/JobMatch-AI/src/services/aiMatcherService.js#L290-L400) (`generateFallbackEvaluation`) |
| **Recruiter Kanban Pipeline** | 6-stage drag-and-drop board powered by `@dnd-kit`. Updates state optimistically and rolls back with an error toast if the backend mutation fails. | [`client/src/pages/JobApplicants.jsx`](file:///d:/Projects/Aptly/JobMatch-AI/client/src/pages/JobApplicants.jsx)<br>[`src/controllers/applicationController.js`](file:///d:/Projects/Aptly/JobMatch-AI/src/controllers/applicationController.js) |
| **JD Quality Scorer & Bias Scanner** | 1.5s debounced reactive analyzer scoring job descriptions across clarity, specificity, and inclusive phrasing (flagging exclusionary terms like *"ninja"* or *"rockstar"*). | [`src/services/jdScorerService.js`](file:///d:/Projects/Aptly/JobMatch-AI/src/services/jdScorerService.js)<br>[`client/src/components/JDQualityPanel.jsx`](file:///d:/Projects/Aptly/JobMatch-AI/client/src/components/JDQualityPanel.jsx) |
| **Auth & Session Security** | JWT issuing with 7-day expiry and startup crash protection (`process.exit(1)` if `JWT_SECRET` is unset). Enforces candidate/recruiter role-based access control. | [`src/app.js`](file:///d:/Projects/Aptly/JobMatch-AI/src/app.js)<br>[`src/controllers/authController.js`](file:///d:/Projects/Aptly/JobMatch-AI/src/controllers/authController.js)<br>[`src/middlewares/authMiddleware.js`](file:///d:/Projects/Aptly/JobMatch-AI/src/middlewares/authMiddleware.js) |
| **Health Telemetry Probes** | Public diagnostic endpoint reporting server uptime, MongoDB connection readiness, and active AI engine mode. | [`src/controllers/healthController.js`](file:///d:/Projects/Aptly/JobMatch-AI/src/controllers/healthController.js)<br>[`scripts/testHealth.js`](file:///d:/Projects/Aptly/JobMatch-AI/scripts/testHealth.js) |

---

## 💡 Part 3: 15 Technical Interview Questions & Code-Based Answers

### Q1: How does candidate-to-job matching actually work? Is it vector embeddings or an LLM prompt?
> **Answer**: It is currently an **LLM-prompted semantic evaluation with code-side scoring calibration**, rather than cosine similarity over vector embeddings.
> In [`src/services/aiMatcherService.js`](file:///d:/Projects/Aptly/JobMatch-AI/src/services/aiMatcherService.js), we pass the job requirements and extracted resume text to Google Gemini 2.5 Flash using structured output mode (`responseMimeType: 'application/json'`). Gemini returns 4 individual dimension scores: technical skills, experience tenure, domain alignment, and credentials.
> To prevent LLM math hallucinations, the final overall `matchScore` is computed directly in our Node.js code:
> `Math.round(rawSkills * 0.4 + rawExp * 0.3 + rawDomain * 0.2 + rawEdu * 0.1)`.
> The recommendation tier (`Strong Match`, `Moderate Match`, `Low Match`) is also derived deterministically in code based on calibrated score brackets (>=75, >=40, <40).

### Q2: Why did you choose Google Gemini 2.5 Flash over OpenAI GPT-4o or Claude 3.5?
> **Answer**: Three key architectural reasons:
> 1. **Native Structured Output Support**: Gemini's `responseSchema` and `responseMimeType: 'application/json'` guarantee clean, parseable JSON without hallucinated markdown wrappers or conversational chit-chat.
> 2. **Low Latency & High Token Throughput**: Processing 15,000-character resume documents requires rapid inference turnaround (typically 1.5–3 seconds), which Flash delivers efficiently.
> 3. **Cost Efficiency**: At fractional cost compared to frontier reasoning models, Flash allows candidate screening at high throughput without blowing API operational budgets.

### Q3: What happens when the Gemini API goes down, experiences a 503 spike, or times out?
> **Answer**: We implemented a **graceful heuristic fallback circuit breaker**.
> 1. In [`src/services/aiMatcherService.js`](file:///d:/Projects/Aptly/JobMatch-AI/src/services/aiMatcherService.js), the API call is raced against a 15-second `timeoutPromise`.
> 2. If the API rejects with a timeout, 503, or rate limit, the `catch` block invokes `generateFallbackEvaluation()`.
> 3. This fallback runs local tokenization, regex matching, and synonym equivalencies across the required skills list, generating a valid ATS evaluation payload with matched skills, missing skills, and an informative diagnostic message: *"Graceful fallback when AI is unavailable"*. The application never returns an unhandled 500 error to the client.

### Q4: How did you fix the path traversal vulnerability during resume parsing?
> **Answer**: Originally, the parse endpoint accepted a client-provided `filePath`. An attacker could pass `../../etc/passwd` or traverse outside the upload directory.
> We resolved this in [`src/routes/resumeRoutes.js`](file:///d:/Projects/Aptly/JobMatch-AI/src/routes/resumeRoutes.js):
> 1. The client is **only allowed to pass an uploaded `fileId`**.
> 2. The server sanitizes the input using `path.basename(fileId)` to strip any directory traversal sequences (`../` or `..\`).
> 3. It enforces a strict `.pdf` file extension check.
> 4. It resolves the absolute path strictly inside `path.join(__dirname, '../../uploads/resumes')` and verifies that `resolvedPath.startsWith(uploadDir)`.
> 5. We wrote an automated security test in [`scripts/testSecurityPathTraversal.js`](file:///d:/Projects/Aptly/JobMatch-AI/scripts/testSecurityPathTraversal.js) that attempts directory traversal attacks and verifies the endpoint rejects them with HTTP 400.

### Q5: Why is the JWT stored in localStorage instead of HttpOnly cookies, and what is the tradeoff?
> **Answer**: In this Single Page Application (SPA) architecture, storing the JWT in `localStorage` simplified cross-origin API requests between the client and backend during rapid decoupled deployment.
> **The Security Tradeoff**:
> - *Risk*: `localStorage` is vulnerable to Cross-Site Scripting (XSS). If an attacker injects malicious JavaScript, they can access the token.
> - *Mitigations implemented*: We reduced the token lifespan to 7 days (mitigating blast radius), strictly sanitized inputs, and enforced strong Content Security Policy / Helmet headers.
> - *Production roadmap*: For high-compliance enterprise environments, the architecture should migrate to short-lived in-memory access tokens (15 minutes) paired with `HttpOnly`, `SameSite: Strict` refresh cookies.

### Q6: How is Role-Based Access Control (RBAC) enforced on the backend?
> **Answer**: In [`src/middlewares/authMiddleware.js`](file:///d:/Projects/Aptly/JobMatch-AI/src/middlewares/authMiddleware.js), we have two complementary middlewares:
> 1. `protect`: Extracts and verifies the Bearer JWT token from `req.headers.authorization`. If invalid or expired, it immediately returns HTTP 401. It loads the authenticated user into `req.user`.
> 2. `recruiterOnly`: Checks `req.user.role === 'recruiter'`. If a candidate attempts to publish a job, schedule an interview, or inspect applicants, it immediately returns HTTP 403 Forbidden.

### Q7: How does optimistic UI updating and rollback work in the Kanban and List views?
> **Answer**: In [`client/src/pages/JobApplicants.jsx`](file:///d:/Projects/Aptly/JobMatch-AI/client/src/pages/JobApplicants.jsx):
> 1. When a recruiter changes a candidate's stage (via drag-and-drop or select menu), the component stores the candidate's `previousStatus`.
> 2. It immediately mutates local React state (`setApplicants`) to reflect the new column without waiting for network I/O.
> 3. It fires an asynchronous `axios.patch('/api/applications/:id/status', { status: newStatus })`.
> 4. If the promise rejects (network offline, server 500), the `catch` block rolls the applicant state back to `previousStatus` and displays a red error toast: *"Failed to update status. Reverted."*. This gives the user zero lag while guaranteeing state consistency.

### Q8: How does resume PDF parsing work, and what happens if a candidate uploads a scanned PDF?
> **Answer**: 
> 1. Uploaded files pass through `multer` with our custom `fileFilter` in [`src/middlewares/uploadMiddleware.js`](file:///d:/Projects/Aptly/JobMatch-AI/src/middlewares/uploadMiddleware.js), checking both `mimetype === 'application/pdf'` and `ext === '.pdf'` with a 5MB limit.
> 2. We extract raw text using `pdf-parse`.
> 3. **Scanned PDF Edge Case**: If the resume is a flat scanned image, `pdf-parse` extracts fewer than 50 characters of machine text.
> 4. In [`src/services/aiMatcherService.js`](file:///d:/Projects/Aptly/JobMatch-AI/src/services/aiMatcherService.js#L110-L130), we detect this immediately, bypass the LLM call, and return:
>    `matchScore: null`, `recommendation: 'Pending Evaluation'`, and flag the profile for manual recruiter review with a clear note to the candidate to provide a machine-readable text PDF.

### Q9: How do you prevent Gemini from returning malformed JSON or markdown fences?
> **Answer**: We implement a 3-stage sanitization pipeline:
> 1. **Schema Guarantee**: We configure Gemini with `responseMimeType: 'application/json'` and a explicit `responseSchema` defining types and required properties.
> 2. **Regex Fence Stripping**: In code, we run `rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()` to strip markdown fences if any are returned.
> 3. **JSON.parse & Key Validation**: We wrap parsing in a `try/catch` and validate that required numerical fields and arrays exist before using them.

### Q10: How does rate limiting protect your server and AI budget?
> **Answer**: In [`src/routes/resumeRoutes.js`](file:///d:/Projects/Aptly/JobMatch-AI/src/routes/resumeRoutes.js), we configured an `aiUploadLimiter` using `express-rate-limit`:
> - 15-minute window with a maximum of 20 parse requests per IP address.
> - This protects our Google Gemini API quota from automated exhaustion and prevents denial-of-wallet or CPU starvation attacks from rapid repeat uploads.

### Q11: How do you ensure the app remains functional if MongoDB Atlas is offline during an interview or live demo?
> **Answer**: We engineered offline data resilience in [`src/controllers/authController.js`](file:///d:/Projects/Aptly/JobMatch-AI/src/controllers/authController.js) and [`src/controllers/jobController.js`](file:///d:/Projects/Aptly/JobMatch-AI/src/controllers/jobController.js):
> 1. If `mongoose.connection.readyState !== 1`, authenticated endpoints gracefully return seeded mock profiles for our 1-click test accounts (`recruiter@aptly.ai` / `candidate@aptly.ai`).
> 2. The job catalog falls back to static seed data (`src/data/fallbackData.js`), allowing interviewers to explore open roles, view scorecards, and test features without crashing.

### Q12: How are CORS origins configured for security between development and production?
> **Answer**: In [`src/app.js`](file:///d:/Projects/Aptly/JobMatch-AI/src/app.js), we configure CORS with a dynamic origin validator:
> - Production origin is read directly from `process.env.CLIENT_URL`.
> - Local development origins (`http://localhost:5173`, `http://localhost:3000`, `http://127.0.0.1:5173`) are permitted.
> - Arbitrary external domains are blocked, preventing unauthorized third-party sites from executing authenticated cross-origin requests.

### Q13: How does transactional email notification work, and how did you test it?
> **Answer**: 
> 1. When a recruiter schedules an interview via `/api/interviews/schedule`, the backend calls `sendInterviewNotificationEmail()` in [`src/emails/emailService.js`](file:///d:/Projects/Aptly/JobMatch-AI/src/emails/emailService.js).
> 2. If `RESEND_API_KEY` is present, it dispatches an HTML email with company details, meeting URL, and scheduled timestamp via Resend.
> 3. If the key is unset, it logs a clean mock simulation without crashing.
> 4. We created an automated test in [`scripts/testEmails.js`](file:///d:/Projects/Aptly/JobMatch-AI/scripts/testEmails.js) verifying HTML template rendering, variable interpolation, and mock delivery.

### Q14: What is the computational complexity of your fallback heuristic algorithm?
> **Answer**: The fallback algorithm in `generateFallbackEvaluation()` executes in **O(N * M)** time, where **N** is the number of required skills (typically 5–15) and **M** is the length of the resume text (bounded to 15,000 characters). Because string regex execution over bounded strings takes single-digit milliseconds, the fallback executes virtually instantaneously (< 5ms) on any modern CPU.

### Q15: Why did you build with custom CSS tokens and components instead of Tailwind CSS or Material UI?
> **Answer**: We adopted a **bespoke clinical paper design system** with CSS custom properties (`--bg-primary`, `--accent-teal`, `--border-default`).
> This provides:
> 1. Zero bundle bloat from unused utility classes.
> 2. Precise control over editorial serif typography (`Newsreader`, `Charter`) and subtle micro-interactions.
> 3. High maintainability: changing a single CSS variable instantly updates the visual theme across the entire application without refactoring hundreds of JSX class attributes.

---

## 🚀 Part 4: 5 Honest Engineering Improvements (Future Roadmap)

1. **BullMQ + Redis Background Queuing**:
   * *Current state*: PDF parsing and Gemini LLM scoring execute synchronously within the Express HTTP request-response cycle.
   * *Production improvement*: Offload file ingestion to a Redis-backed **BullMQ** job queue. The client receives a job ticket (`202 Accepted`) and polls or listens over WebSockets for completion, isolating slow external LLM latency from HTTP worker threads.

2. **Automated PII Scrubbing**:
   * *Current state*: The entire extracted resume text is forwarded to Google Gemini.
   * *Production improvement*: Implement a regex and NER (Named Entity Recognition) scrubber before LLM ingestion to redact candidate names, phone numbers, email addresses, and residential locations, enforcing completely blind and unbiased evaluation.

3. **Hybrid Dense Vector Retrieval**:
   * *Current state*: Evaluation is performed on-demand via direct Gemini prompt.
   * *Production improvement*: Compute 768-dimensional embeddings of resumes and job descriptions using `text-embedding-004` stored in **MongoDB Atlas Vector Search** or **pgvector**. This enables instantaneous candidate pre-filtering across millions of resumes before invoking the detailed evaluation model.

4. **HttpOnly Cookie Refresh Rotation**:
   * *Current state*: JWT bearer token stored in browser `localStorage`.
   * *Production improvement*: Store short-lived access tokens (15-min expiry) in memory and issue HttpOnly, SameSite strict refresh cookies, eliminating token theft risks from Cross-Site Scripting (XSS).

5. **OCR Pipeline for Scanned Resumes**:
   * *Current state*: Scanned PDFs without an embedded text layer are flagged as *"Pending Evaluation"*.
   * *Production improvement*: Integrate an asynchronous OCR worker (`Tesseract.js` or Google Cloud Vision API) to extract text from image-based PDFs, ensuring no candidate is left un-evaluated.
