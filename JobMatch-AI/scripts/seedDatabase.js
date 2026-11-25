#!/usr/bin/env node
/**
 * JobMatch AI - Automated Idempotent Database Seeder
 * Populates MongoDB with verified demo users, 18 production job postings across diverse roles & cities,
 * and multi-stage candidate applications with ATS match scorecards.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const User = require('../src/models/User');
const Job = require('../src/models/Job');
const Application = require('../src/models/Application');
const Interview = require('../src/models/Interview');
const { normalizeSkillsArray } = require('../src/utils/normalizeSkillName');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jobmatch-ai';

async function seedDatabase() {
  console.log('\n======================================================');
  console.log('🌱 Aptly.AI - Database Seeding & Demo Pipeline Engine');
  console.log('======================================================\n');

  try {
    console.log(`📡 Connecting to MongoDB: ${MONGO_URI.replace(/\/\/.*@/, '//<credentials>@')} ...`);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log('✔ MongoDB connection established successfully.\n');
  } catch (connErr) {
    console.warn('⚠️ Could not establish connection to MongoDB: ' + connErr.message);
    console.warn('ℹ Skipping database seeding (database offline or unreachable).');
    console.log('\n======================================================\n');
    process.exit(0);
  }

  try {
    // 1. Prepare Common Hashed Password for Demo Accounts
    const defaultPassword = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    // 2. Demo User Definitions with Normalized Skills
    const demoUserDefinitions = [
      {
        name: 'Sarah Jenkins',
        email: 'recruiter@aptly.ai',
        password: hashedPassword,
        role: 'recruiter',
        bio: 'Head of Technical Talent & Engineering Recruitment at Acme Payments.',
        location: 'Bengaluru, India',
      },
      {
        name: 'Sarah Jenkins (JobMatch Alias)',
        email: 'recruiter@jobmatch.ai',
        password: hashedPassword,
        role: 'recruiter',
        bio: 'Head of Technical Talent & Engineering Recruitment at Acme Payments.',
        location: 'Bengaluru, India',
      },
      {
        name: 'Alex Morgan',
        email: 'candidate@aptly.ai',
        password: hashedPassword,
        role: 'candidate',
        bio: 'Full-Stack MERN & AI Engineer passionate about scalable distributed systems and LLM integrations.',
        targetRole: 'Senior Full-Stack Engineer',
        skills: normalizeSkillsArray(['React', 'Node.js', 'Express', 'MongoDB', 'Docker', 'TypeScript', 'Tailwind CSS']),
        location: 'Remote',
      },
      {
        name: 'Alex Morgan (JobMatch Alias)',
        email: 'candidate@jobmatch.ai',
        password: hashedPassword,
        role: 'candidate',
        bio: 'Full-Stack MERN & AI Engineer passionate about scalable distributed systems and LLM integrations.',
        targetRole: 'Senior Full-Stack Engineer',
        skills: normalizeSkillsArray(['React', 'Node.js', 'Express', 'MongoDB', 'Docker', 'TypeScript', 'Tailwind CSS']),
        location: 'Remote',
      },
      {
        name: 'David Chen',
        email: 'david.chen@example.com',
        password: hashedPassword,
        role: 'candidate',
        bio: 'Principal full-stack engineer with 6+ years designing high-throughput Node microservices.',
        targetRole: 'Staff Software Engineer',
        skills: normalizeSkillsArray(['React', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'Docker', 'Kubernetes']),
        location: 'Seattle, WA',
      },
      {
        name: 'Elena Rostova',
        email: 'elena.rostova@example.com',
        password: hashedPassword,
        role: 'candidate',
        bio: 'Frontend-leaning full-stack developer specializing in React 19, state management, and modern CSS.',
        targetRole: 'Senior Frontend / Full-Stack Engineer',
        skills: normalizeSkillsArray(['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'Tailwind CSS']),
        location: 'Austin, TX',
      },
      {
        name: 'Marcus Vance',
        email: 'marcus.vance@example.com',
        password: hashedPassword,
        role: 'candidate',
        bio: 'Engineering Leader with proven track record scaling AI products from 0 to 1M+ active users.',
        targetRole: 'Lead Full-Stack & AI Architect',
        skills: normalizeSkillsArray(['React', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'Docker', 'AWS']),
        location: 'San Francisco, CA',
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        password: hashedPassword,
        role: 'candidate',
        bio: 'Full-stack software engineer with strong fundamentals in JavaScript, Node.js, and API design.',
        targetRole: 'Full-Stack Developer',
        skills: normalizeSkillsArray(['React', 'Node.js', 'Express', 'JavaScript', 'REST API', 'PostgreSQL']),
        location: 'New York, NY',
      },
      {
        name: 'Liam Walker',
        email: 'liam.walker@example.com',
        password: hashedPassword,
        role: 'candidate',
        bio: 'Backend systems specialist focused on Node.js performance, MongoDB indexing, and Redis caching.',
        targetRole: 'Senior Backend Engineer',
        skills: normalizeSkillsArray(['Node.js', 'Express', 'MongoDB', 'Docker', 'Gemini AI', 'Redis']),
        location: 'Denver, CO',
      },
      {
        name: 'Sophie Martin',
        email: 'sophie.martin@example.com',
        password: hashedPassword,
        role: 'candidate',
        bio: 'MERN stack developer building accessible and responsive consumer web applications.',
        targetRole: 'Full-Stack Software Engineer',
        skills: normalizeSkillsArray(['React', 'Node.js', 'MongoDB', 'Docker', 'Next.js', 'Tailwind CSS']),
        location: 'Chicago, IL',
      },
      {
        name: 'Jordan Taylor',
        email: 'jordan.taylor@example.com',
        password: hashedPassword,
        role: 'candidate',
        bio: 'Junior web developer focused on responsive HTML/CSS design and React component libraries.',
        targetRole: 'Junior Frontend Developer',
        skills: normalizeSkillsArray(['React', 'JavaScript', 'HTML5', 'CSS3', 'Git']),
        location: 'Atlanta, GA',
      },
    ];

    // 3. Safe, Idempotent Cleanup of Previous Demo Records Only (Preserves real registered users)
    console.log('🧹 Purging only demo seed accounts & demo-posted records...');
    const demoEmails = demoUserDefinitions.map((u) => u.email);
    const existingDemoUsers = await User.find({ email: { $in: demoEmails } });
    const existingDemoUserIds = existingDemoUsers.map((u) => u._id);

    if (existingDemoUserIds.length > 0) {
      await Interview.deleteMany({
        $or: [
          { recruiterId: { $in: existingDemoUserIds } },
          { candidateId: { $in: existingDemoUserIds } },
        ],
      });
      await Application.deleteMany({ candidate: { $in: existingDemoUserIds } });
      const existingDemoJobs = await Job.find({ postedBy: { $in: existingDemoUserIds } });
      const existingDemoJobIds = existingDemoJobs.map((j) => j._id);
      if (existingDemoJobIds.length > 0) {
        await Interview.deleteMany({ jobId: { $in: existingDemoJobIds } });
        await Application.deleteMany({ job: { $in: existingDemoJobIds } });
        await Job.deleteMany({ _id: { $in: existingDemoJobIds } });
      }
      await User.deleteMany({ _id: { $in: existingDemoUserIds } });
    }
    console.log('✔ Stale demo data cleared safely. Real user accounts remain untouched.\n');

    // 4. Normalize Skills on any Existing Non-Demo Jobs in the Database
    const existingNonDemoJobs = await Job.find({});
    let normalizedExistingCount = 0;
    for (const job of existingNonDemoJobs) {
      const normalized = normalizeSkillsArray(job.requiredSkills || []);
      if (JSON.stringify(normalized) !== JSON.stringify(job.requiredSkills)) {
        job.requiredSkills = normalized;
        await job.save();
        normalizedExistingCount++;
      }
    }
    if (normalizedExistingCount > 0) {
      console.log(`✔ Normalized skills across ${normalizedExistingCount} existing non-demo jobs.\n`);
    }

    // 5. Seed Users
    console.log('👤 Inserting demo user accounts...');
    const createdUsers = await User.insertMany(demoUserDefinitions);
    const recruiterUser = createdUsers.find((u) => u.role === 'recruiter');
    const userMap = {};
    createdUsers.forEach((u) => {
      userMap[u.email] = u;
    });
    console.log(`✔ Seeded ${createdUsers.length} users (1 Recruiter, ${createdUsers.length - 1} Candidates).\n`);

    // 6. Seed 18 Production Job Openings Across Diverse Roles & Cities
    console.log('💼 Publishing 18 production job openings with normalized skills...');
    const rawJobDefinitions = [
      {
        title: 'Full-Stack MERN Systems Engineer',
        company: 'Acme Payments',
        location: 'Bengaluru, India (Remote)',
        requiredSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker'],
        description: `About the Role:
Acme Payments is engineering next-generation payment and fintech platforms. We are seeking a Senior Full-Stack MERN Systems Engineer to lead the architecture and implementation of our developer dashboards and automated candidate matching services.

Key Responsibilities:
• Design and build scalable Node.js microservices and RESTful APIs connecting to MongoDB clusters.
• Integrate semantic evaluation models for automated resume analysis, skill gap detection, and ATS compatibility scoring.
• Develop reactive, high-performance user interfaces using React 19, modern CSS, and Vite.
• Architect background job processing and secure multipart PDF parsing pipelines using Multer and pdf-parse.
• Partner with product and engineering leaders to uphold 99.99% uptime and optimize database aggregations.

Requirements:
• 4+ years of production experience building and deploying full-stack web applications in the MERN stack.
• Proven hands-on experience designing REST APIs and microservice architectures.
• Deep understanding of MongoDB schema design, indexing, and aggregation pipelines.
• Familiarity with containerization (Docker) and cloud deployments.`,
        postedBy: recruiterUser._id,
      },
      {
        title: 'Frontend Interface Architect',
        company: 'Nova Logistics',
        location: 'Mumbai, India (Hybrid)',
        requiredSkills: ['React', 'TypeScript', 'TailwindCSS', 'PostgreSQL', 'Next.js'],
        description: `Lead our frontend engineering initiatives building high-frequency logistics and consumer interfaces. Strong mastery of React component trees, responsive CSS, and high-performance streaming APIs required.`,
        postedBy: recruiterUser._id,
      },
      {
        title: 'Backend Systems & API Engineer',
        company: 'Helix Core',
        location: 'Bengaluru, India (Remote)',
        requiredSkills: ['Node.js', 'Express', 'MongoDB', 'Docker', 'Redis', 'Microservices'],
        description: `Architect robust backend services, secure authentication, and high-performance MongoDB aggregation pipelines. You will optimize database throughput and scale services handling millions of daily events.`,
        postedBy: recruiterUser._id,
      },
      {
        title: 'Full-Stack Software Engineer',
        company: 'Apex Analytics',
        location: 'Bengaluru, India',
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'Python', 'REST API'],
        description: `Join our product engineering team delivering modern investment and analytics dashboards. Build full-stack features from MERN interfaces to data pipelines and secure customer access controls.`,
        postedBy: recruiterUser._id,
      },
      {
        title: 'Cloud Infrastructure & DevOps Engineer',
        company: 'CloudScale Systems',
        location: 'Mumbai, India (Remote)',
        requiredSkills: ['Docker', 'AWS', 'Kubernetes', 'CI/CD', 'Node.js'],
        description: `Manage cloud infrastructure, automated deployment pipelines, and Docker container clusters for our distributed testing cloud. Experience with continuous delivery and zero-downtime rollouts is essential.`,
        postedBy: recruiterUser._id,
      },
      {
        title: 'Junior Full-Stack Web Developer',
        company: 'QuickServe Technologies',
        location: 'Bengaluru, India (Hybrid)',
        requiredSkills: ['React', 'JavaScript', 'Express', 'MongoDB', 'Git'],
        description: `Great opportunity for a rising full-stack developer to contribute to our consumer engineering platform. You will build user-facing components, write API endpoints, and learn automated production workflows.`,
        postedBy: recruiterUser._id,
      },
      // 12 New Roles across different specializations and cities
      {
        title: 'Senior Frontend Engineer - Design Systems & Web Performance',
        company: 'Prism Labs',
        location: 'Austin, TX (Hybrid)',
        requiredSkills: ['React', 'TypeScript', 'TailwindCSS', 'Next.js', 'GraphQL', 'Web Performance'],
        description: `Prism Labs develops high-performance visualization platforms and design tooling for modern product teams. We are seeking a Senior Frontend Engineer to champion our component libraries, design token systems, and web performance standards.`,
        postedBy: recruiterUser._id,
      },
      {
        title: 'Backend Systems Engineer - Distributed Services',
        company: 'Vortex Data',
        location: 'Seattle, WA (Remote)',
        requiredSkills: ['Go', 'PostgreSQL', 'gRPC', 'Docker', 'Kafka', 'Redis', 'Microservices'],
        description: `Vortex Data powers real-time event streaming and data synchronization for distributed enterprise infrastructure. We are hiring a Backend Systems Engineer to build high-throughput data processing pipelines and resilient microservices.`,
        postedBy: recruiterUser._id,
      },
      {
        title: 'Senior Data Analyst - Growth & Business Intelligence',
        company: 'Aura Metrics',
        location: 'New York, NY (Hybrid)',
        requiredSkills: ['SQL', 'Python', 'Tableau', 'Power BI', 'dbt', 'Snowflake', 'Statistics'],
        description: `Aura Metrics builds analytics software that empowers marketing and growth teams to make data-driven decisions. We are looking for a Senior Data Analyst to lead our product performance analytics and growth experiments.`,
        postedBy: recruiterUser._id,
      },
      {
        title: 'Machine Learning Engineer - NLP & Applied AI',
        company: 'Cortex AI',
        location: 'San Francisco, CA (Hybrid)',
        requiredSkills: ['Python', 'PyTorch', 'TensorFlow', 'LLMs', 'Docker', 'MLOps', 'FastAPI'],
        description: `Cortex AI delivers specialized machine learning models and semantic search solutions for knowledge discovery. We are seeking an Applied Machine Learning Engineer to design, evaluate, and deploy fine-tuned transformer architectures and LLM pipelines.`,
        postedBy: recruiterUser._id,
      },
      {
        title: 'DevOps & Site Reliability Engineer',
        company: 'Kite Infrastructure',
        location: 'Denver, CO (Remote)',
        requiredSkills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'CI/CD', 'Prometheus', 'Linux'],
        description: `Kite Infrastructure provides continuous reliability and automated developer platforms. We are seeking a DevOps & Site Reliability Engineer to manage our multi-region Kubernetes clusters and streamline automated cloud deployments.`,
        postedBy: recruiterUser._id,
      },
      {
        title: 'Senior QA Automation Engineer',
        company: 'QualiPulse Technologies',
        location: 'Chicago, IL (Hybrid)',
        requiredSkills: ['Playwright', 'Cypress', 'JavaScript', 'Jest', 'CI/CD', 'Selenium', 'Postman'],
        description: `QualiPulse Technologies builds quality assurance testing platforms that accelerate software delivery. We are looking for a Senior QA Automation Engineer to lead our end-to-end testing strategy across web and API applications.`,
        postedBy: recruiterUser._id,
      },
      {
        title: 'Senior Mobile Engineer - React Native',
        company: 'PocketWave Apps',
        location: 'San Francisco, CA (Remote)',
        requiredSkills: ['React Native', 'TypeScript', 'Redux', 'iOS', 'Android', 'GraphQL', 'Jest'],
        description: `PocketWave Apps creates fluid, cross-platform mobile experiences for millions of consumers. We are looking for an experienced Senior Mobile Engineer to build performant iOS and Android apps using React Native.`,
        postedBy: recruiterUser._id,
      },
      {
        title: 'Lead UI/UX Product Designer',
        company: 'PixelCraft Studios',
        location: 'Austin, TX (Onsite)',
        requiredSkills: ['Figma', 'UI/UX Design', 'Wireframing', 'Design Systems', 'User Research', 'Prototyping'],
        description: `PixelCraft Studios is a digital product agency designing intuitive web and mobile platforms for tech innovators. We are seeking a Lead UI/UX Product Designer to guide product design from discovery research through high-fidelity prototypes.`,
        postedBy: recruiterUser._id,
      },
      {
        title: 'Product Analyst - User Behavior & Retention',
        company: 'Stratum Analytics',
        location: 'Boston, MA (Hybrid)',
        requiredSkills: ['SQL', 'Mixpanel', 'Amplitude', 'Python', 'A/B Testing', 'Product Analytics', 'Tableau'],
        description: `Stratum Analytics builds enterprise intelligence platforms. We are seeking a Product Analyst to dig into product usage telemetry, analyze user conversion funnels, and define key product engagement metrics.`,
        postedBy: recruiterUser._id,
      },
      {
        title: 'Principal Cloud Solutions Architect',
        company: 'SkyGrid Cloud Solutions',
        location: 'Dallas, TX (Remote)',
        requiredSkills: ['AWS', 'Azure', 'Terraform', 'Kubernetes', 'Cloud Security', 'Architecture', 'Python'],
        description: `SkyGrid Cloud Solutions guides enterprise digital transformation through modern cloud-native architectures. We are hiring a Principal Cloud Solutions Architect to design secure, highly resilient multi-cloud infrastructures.`,
        postedBy: recruiterUser._id,
      },
      {
        title: 'Cybersecurity Analyst & Threat Specialist',
        company: 'Sentinel Gate Security',
        location: 'Washington, DC (Onsite)',
        requiredSkills: ['Network Security', 'SIEM', 'Penetration Testing', 'Incident Response', 'Python', 'Linux', 'SOC'],
        description: `Sentinel Gate Security provides mission-critical threat detection and cyber defense operations. We are seeking a Cybersecurity Analyst to monitor security events, conduct vulnerability assessments, and respond to incidents.`,
        postedBy: recruiterUser._id,
      },
      {
        title: 'Senior Enterprise Java Developer - Spring Boot',
        company: 'Novus Financial Systems',
        location: 'Charlotte, NC (Hybrid)',
        requiredSkills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Docker', 'Kafka', 'REST APIs', 'JUnit'],
        description: `Novus Financial Systems engineers high-volume core banking and ledger transaction platforms. We are seeking a Senior Enterprise Java Developer to build distributed, fault-tolerant microservices using Spring Boot.`,
        postedBy: recruiterUser._id,
      },
    ];

    // Normalize requiredSkills across all job definitions
    const jobDefinitions = rawJobDefinitions.map((job) => ({
      ...job,
      requiredSkills: normalizeSkillsArray(job.requiredSkills),
    }));

    const createdJobs = await Job.insertMany(jobDefinitions);
    const flagshipJob = createdJobs[0]; // Full-Stack MERN & AI Engineer
    console.log(`✔ Seeded ${createdJobs.length} production job requisitions with normalized skills.\n`);

    // 7. Seed 8 Multi-Stage Candidate Applications for the Flagship Job Only
    // (Notice: other 17 jobs stay without match scores, displaying 'Not evaluated yet' until real evaluation occurs)
    console.log('📋 Creating candidate applications for flagship role with ATS match scorecards...');
    const rawApplicationDefinitions = [
      {
        job: flagshipJob._id,
        candidate: userMap['david.chen@example.com']._id,
        status: 'applied',
        resumeUrl: 'uploads/resumes/david-chen-resume.pdf',
        aiMatchScore: 91,
        recommendation: 'Strong Match',
        evaluationSource: 'ai',
        scoreBreakdown: { skillsScore: 95, experienceScore: 92, domainScore: 90, educationScore: 85 },
        matchedSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'Docker', 'PostgreSQL'],
        missingSkills: [],
        experienceFit: '5+ years full-stack engineering with extensive microservices and container orchestration experience.',
        fitSummary: 'Exceptional technical alignment across all required skills. Top candidate for recruiter screening.',
      },
      {
        job: flagshipJob._id,
        candidate: userMap['candidate@jobmatch.ai']._id, // Alex Morgan
        status: 'shortlisted',
        resumeUrl: 'uploads/resumes/alex-morgan-resume.pdf',
        aiMatchScore: 87,
        recommendation: 'Strong Match',
        evaluationSource: 'ai',
        scoreBreakdown: { skillsScore: 90, experienceScore: 88, domainScore: 85, educationScore: 80 },
        matchedSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL'],
        missingSkills: ['Docker'],
        experienceFit: 'Demonstrated 4+ years architecting enterprise MERN applications with clean asynchronous pipelines.',
        fitSummary: 'Outstanding candidate profile. Senior engineering capabilities with deep full-stack alignment.',
      },
      {
        job: flagshipJob._id,
        candidate: userMap['elena.rostova@example.com']._id,
        status: 'interview',
        resumeUrl: 'uploads/resumes/elena-rostova-resume.pdf',
        aiMatchScore: 72,
        recommendation: 'Moderate Match',
        evaluationSource: 'ai',
        scoreBreakdown: { skillsScore: 75, experienceScore: 70, domainScore: 70, educationScore: 75 },
        matchedSkills: ['React', 'Node.js', 'Express', 'MongoDB'],
        missingSkills: ['Docker', 'PostgreSQL'],
        experienceFit: 'Strong frontend-focused MERN background with practical microservices exposure.',
        fitSummary: 'Advanced to technical interview following architecture review. Pairing support recommended on containerization.',
      },
      {
        job: flagshipJob._id,
        candidate: userMap['marcus.vance@example.com']._id,
        status: 'hired',
        resumeUrl: 'uploads/resumes/marcus-vance-resume.pdf',
        aiMatchScore: 89,
        recommendation: 'Strong Match',
        evaluationSource: 'ai',
        scoreBreakdown: { skillsScore: 90, experienceScore: 90, domainScore: 85, educationScore: 85 },
        matchedSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'Docker'],
        missingSkills: ['PostgreSQL'],
        experienceFit: 'Ex-Staff Engineer with verified track record leading scalable full-stack product teams.',
        fitSummary: 'Offer accepted. Successfully completed all hiring rounds with top-tier technical evaluation.',
      },
      {
        job: flagshipJob._id,
        candidate: userMap['priya.sharma@example.com']._id,
        status: 'applied',
        resumeUrl: 'uploads/resumes/priya-sharma-resume.pdf',
        aiMatchScore: 52,
        recommendation: 'Low Match',
        evaluationSource: 'fallback',
        scoreBreakdown: { skillsScore: 52 },
        matchedSkills: ['React', 'Node.js'],
        missingSkills: ['MongoDB', 'Docker', 'Express', 'PostgreSQL'],
        experienceFit: 'Keyword-based result (AI was unavailable): 2 of 6 core skills matched.',
        fitSummary: 'Application under review. Notable gap in required database aggregations and container tooling. [Notice: Keyword-based result]',
      },
      {
        job: flagshipJob._id,
        candidate: userMap['liam.walker@example.com']._id,
        status: 'interview',
        resumeUrl: 'uploads/resumes/liam-walker-resume.pdf',
        aiMatchScore: 82,
        recommendation: 'Strong Match',
        evaluationSource: 'ai',
        scoreBreakdown: { skillsScore: 85, experienceScore: 82, domainScore: 80, educationScore: 80 },
        matchedSkills: ['Node.js', 'Express', 'MongoDB', 'Docker'],
        missingSkills: ['React', 'PostgreSQL'],
        experienceFit: 'Exceptional backend systems engineer; minor gap in advanced React 19 component patterns.',
        fitSummary: 'Scheduled for system design interview. Strong algorithmic and API architecture depth.',
      },
      {
        job: flagshipJob._id,
        candidate: userMap['sophie.martin@example.com']._id,
        status: 'offer',
        resumeUrl: 'uploads/resumes/sophie-martin-resume.pdf',
        aiMatchScore: 68,
        recommendation: 'Moderate Match',
        evaluationSource: 'ai',
        scoreBreakdown: { skillsScore: 70, experienceScore: 68, domainScore: 65, educationScore: 70 },
        matchedSkills: ['React', 'Node.js', 'MongoDB', 'Express'],
        missingSkills: ['Docker', 'PostgreSQL'],
        experienceFit: '3.5 years of production web development across full-stack JavaScript architectures.',
        fitSummary: 'Formal offer extended following successful technical panel and system design rounds.',
      },
      {
        job: flagshipJob._id,
        candidate: userMap['jordan.taylor@example.com']._id,
        status: 'rejected',
        resumeUrl: 'uploads/resumes/jordan-taylor-resume.pdf',
        aiMatchScore: 40,
        recommendation: 'Low Match',
        evaluationSource: 'fallback',
        scoreBreakdown: { skillsScore: 40 },
        matchedSkills: ['React'],
        missingSkills: ['Node.js', 'Express', 'MongoDB', 'Docker', 'PostgreSQL'],
        experienceFit: 'Junior UI developer with HTML/CSS focus; lacks requisite backend microservices experience.',
        fitSummary: 'Application rejected due to significant gap in required server-side and database competencies.',
      },
    ];

    const applicationDefinitions = rawApplicationDefinitions.map((app) => ({
      ...app,
      matchedSkills: normalizeSkillsArray(app.matchedSkills),
      missingSkills: normalizeSkillsArray(app.missingSkills),
    }));

    const createdApplications = await Application.insertMany(applicationDefinitions);
    console.log(`✔ Seeded ${createdApplications.length} applications across all 6 Kanban stages.\n`);

    // 8. Seed Production Interviews for Pipeline Candidates
    console.log('📅 Scheduling upcoming interview sessions for pipeline candidates...');
    const elenaUser = userMap['elena.rostova@example.com'];
    const liamUser = userMap['liam.walker@example.com'];

    const interviewDefinitions = [
      {
        jobId: flagshipJob._id,
        candidateId: elenaUser._id,
        recruiterId: recruiterUser._id,
        scheduledAt: new Date(Date.now() + 26 * 60 * 60 * 1000), // ~Tomorrow afternoon
        duration: 45,
        format: 'Video Call',
        meetingLink: 'https://meet.google.com/aptly-mern-round',
        notes: 'Round 1 technical evaluation: MERN architecture, React state patterns, and Gemini API integration.',
        status: 'Scheduled',
      },
      {
        jobId: flagshipJob._id,
        candidateId: liamUser._id,
        recruiterId: recruiterUser._id,
        scheduledAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // ~3 days out
        duration: 60,
        format: 'Video Call',
        meetingLink: 'https://meet.google.com/aptly-liam-design',
        notes: 'System architecture deep-dive: high-throughput Node.js microservices & MongoDB aggregations.',
        status: 'Scheduled',
      },
    ];

    const createdInterviews = await Interview.insertMany(interviewDefinitions);
    console.log(`✔ Seeded ${createdInterviews.length} upcoming interview appointments in calendar.\n`);

    // 9. Render Formatted Summary Table
    console.log('================================================================================');
    console.log('                    DATABASE SEEDING VERIFICATION SUMMARY                       ');
    console.log('================================================================================');
    console.log(`👥 Demo Accounts     : ${createdUsers.length} (1 Recruiter, ${createdUsers.length - 1} Candidates)`);
    console.log(`💼 Active Jobs       : ${createdJobs.length} Production Requisitions Across 18 Roles & Cities`);
    console.log(`📋 ATS Applications  : ${createdApplications.length} Applications Distributed Across 6 Stages`);
    console.log(`📅 Active Interviews : ${createdInterviews.length} Scheduled Sessions Linked to Flagship Opening`);
    console.log('--------------------------------------------------------------------------------');
    console.log('Roles Included:');
    console.log('  1. Full-Stack MERN Systems Engineer (Bengaluru - Remote)');
    console.log('  2. Frontend Interface Architect (Mumbai - Hybrid)');
    console.log('  3. Backend Systems & API Engineer (Bengaluru - Remote)');
    console.log('  4. Full-Stack Software Engineer (Bengaluru)');
    console.log('  5. Cloud Infrastructure & DevOps Engineer (Mumbai - Remote)');
    console.log('  6. Junior Full-Stack Web Developer (Bengaluru - Hybrid)');
    console.log('  7. Senior Frontend Engineer (Austin, TX - Hybrid)');
    console.log('  8. Backend Systems Engineer - Distributed Services (Seattle, WA - Remote)');
    console.log('  9. Senior Data Analyst (New York, NY - Hybrid)');
    console.log('  10. Machine Learning Engineer (San Francisco, CA - Hybrid)');
    console.log('  11. DevOps & SRE (Denver, CO - Remote)');
    console.log('  12. Senior QA Automation Engineer (Chicago, IL - Hybrid)');
    console.log('  13. Senior Mobile Engineer - React Native (San Francisco, CA - Remote)');
    console.log('  14. Lead UI/UX Product Designer (Austin, TX - Onsite)');
    console.log('  15. Product Analyst - User Behavior & Retention (Boston, MA - Hybrid)');
    console.log('  16. Principal Cloud Solutions Architect (Dallas, TX - Remote)');
    console.log('  17. Cybersecurity Analyst & Threat Specialist (Washington, DC - Onsite)');
    console.log('  18. Senior Enterprise Java Developer - Spring Boot (Charlotte, NC - Hybrid)');
    console.log('================================================================================');
    console.log('✨ Seeder executed successfully! Default logins:');
    console.log('   Recruiter : recruiter@jobmatch.ai / password123');
    console.log('   Candidate : candidate@jobmatch.ai / password123');
    console.log('================================================================================\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedDatabase();
