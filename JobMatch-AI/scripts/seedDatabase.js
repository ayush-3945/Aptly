#!/usr/bin/env node
/**
 * JobMatch AI - Automated Idempotent Database Seeder
 * Populates MongoDB with verified demo users, production job postings,
 * and multi-stage candidate applications with Gemini AI ATS match scorecards.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../src/models/User');
const Job = require('../src/models/Job');
const Application = require('../src/models/Application');

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

    // 2. Demo User Definitions
    const demoUserDefinitions = [
      {
        name: 'Sarah Jenkins',
        email: 'recruiter@jobmatch.ai',
        password: hashedPassword,
        role: 'recruiter',
        bio: 'Head of Technical Talent & Engineering Recruitment at TechPulse Solutions.',
        location: 'San Francisco, CA',
      },
      {
        name: 'Alex Morgan',
        email: 'candidate@jobmatch.ai',
        password: hashedPassword,
        role: 'candidate',
        bio: 'Full-Stack MERN & AI Engineer passionate about scalable distributed systems and LLM integrations.',
        targetRole: 'Senior Full-Stack Engineer',
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'Docker', 'TypeScript'],
        location: 'Remote',
      },
      {
        name: 'David Chen',
        email: 'david.chen@example.com',
        password: hashedPassword,
        role: 'candidate',
        bio: 'Principal full-stack engineer with 6+ years designing high-throughput Node microservices.',
        targetRole: 'Staff Software Engineer',
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'Docker', 'Kubernetes'],
        location: 'Seattle, WA',
      },
      {
        name: 'Elena Rostova',
        email: 'elena.rostova@example.com',
        password: hashedPassword,
        role: 'candidate',
        bio: 'Frontend-leaning full-stack developer specializing in React 19, state management, and modern CSS.',
        targetRole: 'Senior Frontend / Full-Stack Engineer',
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'TailwindCSS'],
        location: 'Austin, TX',
      },
      {
        name: 'Marcus Vance',
        email: 'marcus.vance@example.com',
        password: hashedPassword,
        role: 'candidate',
        bio: 'Engineering Leader with proven track record scaling AI products from 0 to 1M+ active users.',
        targetRole: 'Lead Full-Stack & AI Architect',
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'Docker', 'AWS'],
        location: 'San Francisco, CA',
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        password: hashedPassword,
        role: 'candidate',
        bio: 'Full-stack software engineer with strong fundamentals in JavaScript, Node.js, and API design.',
        targetRole: 'Full-Stack Developer',
        skills: ['React', 'Node.js', 'Express', 'JavaScript', 'REST API', 'PostgreSQL'],
        location: 'New York, NY',
      },
      {
        name: 'Liam Walker',
        email: 'liam.walker@example.com',
        password: hashedPassword,
        role: 'candidate',
        bio: 'Backend systems specialist focused on Node.js performance, MongoDB indexing, and Redis caching.',
        targetRole: 'Senior Backend Engineer',
        skills: ['Node.js', 'Express', 'MongoDB', 'Docker', 'Gemini AI', 'Redis'],
        location: 'Denver, CO',
      },
      {
        name: 'Sophie Martin',
        email: 'sophie.martin@example.com',
        password: hashedPassword,
        role: 'candidate',
        bio: 'MERN stack developer building accessible and responsive consumer web applications.',
        targetRole: 'Full-Stack Software Engineer',
        skills: ['React', 'Node.js', 'MongoDB', 'Docker', 'Next.js', 'TailwindCSS'],
        location: 'Chicago, IL',
      },
      {
        name: 'Jordan Taylor',
        email: 'jordan.taylor@example.com',
        password: hashedPassword,
        role: 'candidate',
        bio: 'Junior web developer focused on responsive HTML/CSS design and React component libraries.',
        targetRole: 'Junior Frontend Developer',
        skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git'],
        location: 'Atlanta, GA',
      },
    ];

    // 3. Idempotent Cleanup of Previous Demo Records
    console.log('🧹 Purging any existing demo seed records...');
    const demoEmails = demoUserDefinitions.map((u) => u.email);
    const existingUsers = await User.find({ email: { $in: demoEmails } });
    const existingUserIds = existingUsers.map((u) => u._id);

    if (existingUserIds.length > 0) {
      await Application.deleteMany({ candidate: { $in: existingUserIds } });
      const existingJobs = await Job.find({ postedBy: { $in: existingUserIds } });
      const existingJobIds = existingJobs.map((j) => j._id);
      if (existingJobIds.length > 0) {
        await Application.deleteMany({ job: { $in: existingJobIds } });
        await Job.deleteMany({ _id: { $in: existingJobIds } });
      }
      await User.deleteMany({ _id: { $in: existingUserIds } });
    }
    console.log('✔ Stale demo data cleared.\n');

    // 4. Seed Users
    console.log('👤 Inserting demo user accounts...');
    // We use insertMany with already hashed passwords to bypass re-hashing
    const createdUsers = await User.insertMany(demoUserDefinitions);
    const recruiterUser = createdUsers.find((u) => u.role === 'recruiter');
    const userMap = {};
    createdUsers.forEach((u) => {
      userMap[u.email] = u;
    });
    console.log(`✔ Seeded ${createdUsers.length} users (1 Recruiter, ${createdUsers.length - 1} Candidates).\n`);

    // 5. Seed 6 Production Job Openings
    console.log('💼 Publishing production job openings...');
    const jobDefinitions = [
      {
        title: 'Full-Stack MERN & AI Engineer',
        company: 'TechPulse Solutions',
        location: 'Remote (US/Global)',
        requiredSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'Docker'],
        description: `About the Role:
TechPulse Solutions is engineering next-generation intelligent HR and hiring platforms. We are seeking a Senior Full-Stack MERN & Gemini AI Engineer to lead the architecture and implementation of our candidate evaluation pipeline and AI matching services.

Key Responsibilities:
• Design and build scalable Node.js microservices and RESTful APIs connecting to MongoDB clusters.
• Integrate Google Gemini foundation models (Gemini 2.5 Flash) for automated resume analysis, skill gap detection, and ATS compatibility scoring.
• Develop reactive, high-performance user interfaces using React 19, modern CSS Glassmorphism, and Vite.
• Architect background job processing and secure multipart PDF parsing pipelines using Multer and pdf-parse.
• Partner with product and engineering leaders to uphold 99.9% uptime and optimize database aggregations.

Requirements:
• 4+ years of production experience building and deploying full-stack web applications in the MERN stack.
• Proven hands-on experience integrating LLM APIs (Gemini, Claude, or OpenAI) with structured JSON outputs.
• Deep understanding of MongoDB schema design, indexing, and aggregation pipelines.
• Familiarity with containerization (Docker) and cloud deployments.`,
        postedBy: recruiterUser._id,
      },
      {
        title: 'Senior Backend Architect - Node.js & Microservices',
        company: 'CloudScale Systems',
        location: 'San Francisco, CA (Hybrid)',
        requiredSkills: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Docker', 'Microservices', 'Kubernetes'],
        description: `Lead our backend infrastructure initiatives designing resilient, high-throughput microservices handling millions of daily events. You will optimize database throughput, implement distributed Redis caching, and maintain robust API gateways.`,
        postedBy: recruiterUser._id,
      },
      {
        title: 'Frontend React 19 Engineer',
        company: 'Nexus Labs',
        location: 'New York, NY',
        requiredSkills: ['React', 'TypeScript', 'TailwindCSS', 'Next.js', 'CSS Modules', 'Web Vitals'],
        description: `Join Nexus Labs to craft high-fidelity, component-driven user interfaces. You will build responsive web applications with React 19, CSS Glassmorphism, and optimized Core Web Vitals.`,
        postedBy: recruiterUser._id,
      },
      {
        title: 'AI/ML Integration Specialist',
        company: 'DeepMind Labs',
        location: 'Remote',
        requiredSkills: ['Python', 'Gemini AI', 'Node.js', 'REST API', 'Prompt Engineering', 'LangChain'],
        description: `Drive foundation model adoption across production workflows. Build semantic search indices, agentic tool workflows, and structured JSON output pipelines using Google Gemini and LangChain.`,
        postedBy: recruiterUser._id,
      },
      {
        title: 'DevOps & Cloud Infrastructure Lead',
        company: 'Orbit Technologies',
        location: 'Austin, TX (Hybrid)',
        requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'GitHub Actions', 'Linux'],
        description: `Architect automated CI/CD pipelines, containerize backend microservices with Docker/Kubernetes, and manage multi-region AWS cloud infrastructure with Terraform.`,
        postedBy: recruiterUser._id,
      },
      {
        title: 'Junior JavaScript Developer',
        company: 'LaunchPad Digital',
        location: 'Remote',
        requiredSkills: ['JavaScript', 'HTML5', 'CSS3', 'React', 'Git', 'REST API'],
        description: `Entry-level engineering position for ambitious web developers. Build reusable UI components, write unit tests, and collaborate with senior mentors on modern full-stack products.`,
        postedBy: recruiterUser._id,
      },
    ];

    const createdJobs = await Job.insertMany(jobDefinitions);
    const flagshipJob = createdJobs[0]; // Full-Stack MERN & AI Engineer
    console.log(`✔ Seeded ${createdJobs.length} production job requisitions.\n`);

    // 6. Seed 8 Multi-Stage Candidate Applications
    console.log('📋 Creating candidate applications with Gemini AI ATS match scorecards...');
    const applicationDefinitions = [
      {
        job: flagshipJob._id,
        candidate: userMap['david.chen@example.com']._id,
        status: 'applied',
        resumeUrl: 'uploads/resumes/david-chen-resume.pdf',
        aiMatchScore: 95,
        recommendation: 'Strong Match',
        matchedSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'Docker'],
        missingSkills: [],
        experienceFit: '5+ years full-stack engineering with extensive microservices and container orchestration experience.',
        fitSummary: 'Perfect 100% skill match across all required competencies. Top priority for recruiter screening.',
      },
      {
        job: flagshipJob._id,
        candidate: userMap['candidate@jobmatch.ai']._id, // Alex Morgan
        status: 'shortlisted',
        resumeUrl: 'uploads/resumes/alex-morgan-resume.pdf',
        aiMatchScore: 92,
        recommendation: 'Strong Match',
        matchedSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'Gemini AI'],
        missingSkills: ['Docker'],
        experienceFit: 'Demonstrated 4+ years architecting enterprise MERN applications with direct Gemini AI SDK integration.',
        fitSummary: 'Outstanding candidate profile. Senior engineering capabilities with deep full-stack alignment.',
      },
      {
        job: flagshipJob._id,
        candidate: userMap['elena.rostova@example.com']._id,
        status: 'interview',
        resumeUrl: 'uploads/resumes/elena-rostova-resume.pdf',
        aiMatchScore: 88,
        recommendation: 'Strong Match',
        matchedSkills: ['React', 'Node.js', 'Express', 'MongoDB'],
        missingSkills: ['Gemini AI', 'Docker'],
        experienceFit: 'Strong production MERN background; demonstrated ability to rapidly adopt foundation model APIs.',
        fitSummary: 'Advanced to technical panel interview following impressive architecture portfolio review.',
      },
      {
        job: flagshipJob._id,
        candidate: userMap['marcus.vance@example.com']._id,
        status: 'hired',
        resumeUrl: 'uploads/resumes/marcus-vance-resume.pdf',
        aiMatchScore: 96,
        recommendation: 'Strong Match',
        matchedSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'Docker'],
        missingSkills: [],
        experienceFit: 'Ex-Staff Engineer with verified track record leading scalable full-stack and AI product teams.',
        fitSummary: 'Offer accepted. Successfully completed all hiring rounds with top-tier technical evaluation.',
      },
      {
        job: flagshipJob._id,
        candidate: userMap['priya.sharma@example.com']._id,
        status: 'applied',
        resumeUrl: 'uploads/resumes/priya-sharma-resume.pdf',
        aiMatchScore: 76,
        recommendation: 'Moderate Match',
        matchedSkills: ['React', 'Node.js', 'Express'],
        missingSkills: ['MongoDB', 'Gemini AI', 'Docker'],
        experienceFit: 'Solid mid-level frontend and Node.js developer with relational DB experience.',
        fitSummary: 'Good technical foundation. Candidate would benefit from structured onboarding on MongoDB and LLMs.',
      },
      {
        job: flagshipJob._id,
        candidate: userMap['liam.walker@example.com']._id,
        status: 'interview',
        resumeUrl: 'uploads/resumes/liam-walker-resume.pdf',
        aiMatchScore: 84,
        recommendation: 'Strong Match',
        matchedSkills: ['Node.js', 'Express', 'MongoDB', 'Docker', 'Gemini AI'],
        missingSkills: ['React'],
        experienceFit: 'Exceptional backend and AI systems engineer; minor gap in advanced React 19 component design.',
        fitSummary: 'Scheduled for system design interview. Strong algorithmic and API architecture depth.',
      },
      {
        job: flagshipJob._id,
        candidate: userMap['sophie.martin@example.com']._id,
        status: 'shortlisted',
        resumeUrl: 'uploads/resumes/sophie-martin-resume.pdf',
        aiMatchScore: 82,
        recommendation: 'Strong Match',
        matchedSkills: ['React', 'Node.js', 'MongoDB', 'Docker'],
        missingSkills: ['Gemini AI', 'Express'],
        experienceFit: '3.5 years of production web development across full-stack JavaScript architectures.',
        fitSummary: 'Shortlisted for initial screening call. Clear communicator with verified GitHub portfolio.',
      },
      {
        job: flagshipJob._id,
        candidate: userMap['jordan.taylor@example.com']._id,
        status: 'rejected',
        resumeUrl: 'uploads/resumes/jordan-taylor-resume.pdf',
        aiMatchScore: 40,
        recommendation: 'Low Match',
        matchedSkills: ['React'],
        missingSkills: ['Node.js', 'Express', 'MongoDB', 'Gemini AI', 'Docker'],
        experienceFit: 'Junior UI developer with HTML/CSS focus; lacks requisite backend microservices experience.',
        fitSummary: 'Profile archived due to significant gap in required server-side and database competencies.',
      },
    ];

    const createdApplications = await Application.insertMany(applicationDefinitions);
    console.log(`✔ Seeded ${createdApplications.length} applications across all 5 Kanban stages.\n`);

    // 7. Render Formatted Summary Table
    console.log('================================================================================');
    console.log('                    DATABASE SEEDING VERIFICATION SUMMARY                       ');
    console.log('================================================================================');
    console.log(`👥 Demo Accounts     : ${createdUsers.length} (1 Recruiter, ${createdUsers.length - 1} Candidates)`);
    console.log(`💼 Active Jobs       : ${createdJobs.length} Production Requisitions`);
    console.log(`📋 ATS Applications  : ${createdApplications.length} Applications Distributed Across 5 Stages`);
    console.log('--------------------------------------------------------------------------------');
    console.log('Kanban Stage Distribution for Flagship Role ("Full-Stack MERN & AI Engineer"):');
    console.log('  📥 Applied        : 2 candidates (David Chen [95%], Priya Sharma [76%])');
    console.log('  ⭐ Shortlisted    : 2 candidates (Alex Morgan [92%], Sophie Martin [82%])');
    console.log('  💬 Interview      : 2 candidates (Elena Rostova [88%], Liam Walker [84%])');
    console.log('  🎉 Offer Accepted : 1 candidate  (Marcus Vance [96%])');
    console.log('  📁 Archived       : 1 candidate  (Jordan Taylor [40%])');
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