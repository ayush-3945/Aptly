#!/usr/bin/env node
/**
 * Aptly.AI - Reset Demo Data Script
 * Safely resets and re-seeds verified demo data for 1-click evaluation accounts:
 * - Recruiter: recruiter@aptly.ai / password123
 * - Candidate: candidate@aptly.ai / password123
 *
 * Seeds 3 production engineering jobs, 24 multi-stage applications
 * (20 AI evaluations + 4 keyword fallback evaluations), and verified interview schedules.
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

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jobmatch-ai';

async function resetDemoData() {
  console.log('\n======================================================');
  console.log('🔄 Aptly.AI - Demo Data Reset & Idempotent Seeder');
  console.log('======================================================\n');

  try {
    console.log(`📡 Connecting to MongoDB: ${MONGO_URI.replace(/\/\/.*@/, '//<credentials>@')} ...`);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log('✔ MongoDB connection established successfully.\n');
  } catch (connErr) {
    console.warn('⚠️ Could not connect to MongoDB: ' + connErr.message);
    console.warn('ℹ Skipping demo reset (MongoDB offline or unreachable in local test).');
    process.exit(0);
  }

  try {
    const defaultPassword = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    const demoUsers = [
      {
        name: 'Sarah Jenkins',
        email: 'recruiter@aptly.ai',
        password: hashedPassword,
        role: 'recruiter',
        bio: 'Lead Engineering Recruiter at Acme Payments & Aptly Labs.',
        location: 'Bengaluru, India',
      },
      {
        name: 'Sarah Jenkins (JobMatch Alias)',
        email: 'recruiter@jobmatch.ai',
        password: hashedPassword,
        role: 'recruiter',
        bio: 'Lead Engineering Recruiter at Acme Payments.',
        location: 'Bengaluru, India',
      },
      {
        name: 'Alex Morgan',
        email: 'candidate@aptly.ai',
        password: hashedPassword,
        role: 'candidate',
        bio: 'Senior Full-Stack & AI Systems Engineer with deep React and Node.js microservices background.',
        targetRole: 'Senior Full-Stack Engineer',
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Docker', 'TypeScript', 'Gemini AI'],
        location: 'Remote',
      },
      {
        name: 'Alex Morgan (JobMatch Alias)',
        email: 'candidate@jobmatch.ai',
        password: hashedPassword,
        role: 'candidate',
        bio: 'Full-stack developer specializing in scalable distributed web apps.',
        targetRole: 'Senior Full-Stack Engineer',
        skills: ['React', 'Node.js', 'MongoDB', 'Docker'],
        location: 'Remote',
      },
      {
        name: 'David Chen',
        email: 'david.chen@example.com',
        password: hashedPassword,
        role: 'candidate',
        bio: 'Principal distributed systems engineer.',
        targetRole: 'Staff Software Engineer',
        skills: ['Node.js', 'Express', 'MongoDB', 'Docker', 'Kubernetes', 'TypeScript'],
        location: 'Seattle, WA',
      },
      {
        name: 'Elena Rostova',
        email: 'elena.rostova@example.com',
        password: hashedPassword,
        role: 'candidate',
        bio: 'Frontend architecture specialist with expertise in React 19 and UI state machines.',
        targetRole: 'Senior Frontend Engineer',
        skills: ['React', 'TypeScript', 'Node.js', 'REST API', 'TailwindCSS'],
        location: 'Austin, TX',
      },
      {
        name: 'Marcus Vance',
        email: 'marcus.vance@example.com',
        password: hashedPassword,
        role: 'candidate',
        bio: 'Cloud and platform engineer with AWS and containerization focus.',
        targetRole: 'Lead Platform Architect',
        skills: ['Docker', 'AWS', 'Node.js', 'MongoDB', 'Python'],
        location: 'San Francisco, CA',
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        password: hashedPassword,
        role: 'candidate',
        bio: 'Full-stack software engineer building high-throughput APIs.',
        targetRole: 'Full-Stack Developer',
        skills: ['React', 'Node.js', 'Express', 'PostgreSQL', 'JavaScript'],
        location: 'New York, NY',
      },
      {
        name: 'Liam Walker',
        email: 'liam.walker@example.com',
        password: hashedPassword,
        role: 'candidate',
        bio: 'Backend systems engineer specializing in caching and database scaling.',
        targetRole: 'Senior Backend Engineer',
        skills: ['Node.js', 'Express', 'MongoDB', 'Docker', 'Redis'],
        location: 'Denver, CO',
      },
      {
        name: 'Sophie Martin',
        email: 'sophie.martin@example.com',
        password: hashedPassword,
        role: 'candidate',
        bio: 'MERN stack engineer passionate about clean architectures.',
        targetRole: 'Full-Stack Software Engineer',
        skills: ['React', 'Node.js', 'MongoDB', 'Next.js', 'Docker'],
        location: 'Chicago, IL',
      },
    ];

    console.log('🧹 Purging stale demo data...');
    const demoEmails = demoUsers.map((u) => u.email);
    const existing = await User.find({ email: { $in: demoEmails } });
    const existingIds = existing.map((u) => u._id);

    if (existingIds.length > 0) {
      await Interview.deleteMany({
        $or: [{ recruiterId: { $in: existingIds } }, { candidateId: { $in: existingIds } }],
      });
      await Application.deleteMany({ candidate: { $in: existingIds } });
      const existingJobs = await Job.find({ postedBy: { $in: existingIds } });
      const jobIds = existingJobs.map((j) => j._id);
      if (jobIds.length > 0) {
        await Interview.deleteMany({ jobId: { $in: jobIds } });
        await Application.deleteMany({ job: { $in: jobIds } });
        await Job.deleteMany({ _id: { $in: jobIds } });
      }
      await User.deleteMany({ _id: { $in: existingIds } });
    }
    console.log('✔ Stale demo records removed.\n');

    console.log('👤 Seeding demo users...');
    const createdUsers = await User.insertMany(demoUsers);
    const recruiterUser = createdUsers.find((u) => u.email === 'recruiter@aptly.ai') || createdUsers[0];
    const candidateUser = createdUsers.find((u) => u.email === 'candidate@aptly.ai') || createdUsers[2];
    console.log(`✔ Created ${createdUsers.length} demo users (Recruiter: recruiter@aptly.ai).\n`);

    console.log('💼 Publishing production job openings...');
    const jobDefinitions = [
      {
        title: 'Full-Stack MERN Systems Engineer',
        company: 'Acme Payments',
        location: 'Bengaluru, India (Remote)',
        requiredSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'Docker', 'TypeScript'],
        description: 'Lead engineering of our developer portal and semantic ATS pipelines with React, Node.js, and MongoDB.',
        postedBy: recruiterUser._id,
      },
      {
        title: 'Senior Frontend Architect',
        company: 'Aptly Labs',
        location: 'San Francisco, CA (Remote)',
        requiredSkills: ['React', 'TypeScript', 'Node.js', 'Docker', 'REST API'],
        description: 'Architect responsive modern user experiences and real-time state machines across distributed client applications.',
        postedBy: recruiterUser._id,
      },
      {
        title: 'Cloud Infrastructure & Microservices Engineer',
        company: 'Acme Payments',
        location: 'Remote',
        requiredSkills: ['Node.js', 'Docker', 'MongoDB', 'REST API', 'AWS'],
        description: 'Design resilient containerized microservice architectures and streamline CI/CD pipelines.',
        postedBy: recruiterUser._id,
      },
    ];

    const createdJobs = await Job.insertMany(jobDefinitions);
    console.log(`✔ Created ${createdJobs.length} active requisitions.\n`);

    console.log('📄 Seeding 24 multi-stage applications...');
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // Define 24 application profiles with verifiable evaluation sources & stages
    const appConfigs = [
      // Stage: hired (2) - real hire timestamps
      { cand: candidateUser, jobIdx: 0, status: 'hired', score: 92, source: 'ai', daysAgo: 21, hireDays: 14 },
      { cand: createdUsers[4], jobIdx: 1, status: 'hired', score: 88, source: 'ai', daysAgo: 18, hireDays: 12 },

      // Stage: offer (2)
      { cand: createdUsers[5], jobIdx: 0, status: 'offer', score: 89, source: 'ai', daysAgo: 14 },
      { cand: createdUsers[6], jobIdx: 2, status: 'offer', score: 85, source: 'ai', daysAgo: 12 },

      // Stage: interview (6)
      { cand: createdUsers[7], jobIdx: 0, status: 'interview', score: 84, source: 'ai', daysAgo: 10 },
      { cand: createdUsers[8], jobIdx: 0, status: 'interview', score: 81, source: 'ai', daysAgo: 9 },
      { cand: createdUsers[9], jobIdx: 1, status: 'interview', score: 79, source: 'ai', daysAgo: 8 },
      { cand: createdUsers[4], jobIdx: 2, status: 'interview', score: 76, source: 'ai', daysAgo: 7 },
      { cand: createdUsers[5], jobIdx: 2, status: 'interview', score: 74, source: 'ai', daysAgo: 6 },
      { cand: createdUsers[6], jobIdx: 1, status: 'interview', score: 72, source: 'fallback', daysAgo: 5 },

      // Stage: shortlisted (6)
      { cand: createdUsers[7], jobIdx: 1, status: 'shortlisted', score: 82, source: 'ai', daysAgo: 7 },
      { cand: createdUsers[8], jobIdx: 2, status: 'shortlisted', score: 80, source: 'ai', daysAgo: 6 },
      { cand: createdUsers[9], jobIdx: 0, status: 'shortlisted', score: 78, source: 'ai', daysAgo: 5 },
      { cand: candidateUser, jobIdx: 2, status: 'shortlisted', score: 75, source: 'ai', daysAgo: 4 },
      { cand: createdUsers[4], jobIdx: 0, status: 'shortlisted', score: 70, source: 'fallback', daysAgo: 4 },
      { cand: createdUsers[5], jobIdx: 1, status: 'shortlisted', score: 68, source: 'fallback', daysAgo: 3 },

      // Stage: applied (8)
      { cand: createdUsers[6], jobIdx: 0, status: 'applied', score: 86, source: 'ai', daysAgo: 4 },
      { cand: createdUsers[7], jobIdx: 2, status: 'applied', score: 83, source: 'ai', daysAgo: 3 },
      { cand: createdUsers[8], jobIdx: 1, status: 'applied', score: 77, source: 'ai', daysAgo: 3 },
      { cand: createdUsers[9], jobIdx: 2, status: 'applied', score: 73, source: 'ai', daysAgo: 2 },
      { cand: candidateUser, jobIdx: 1, status: 'applied', score: 66, source: 'ai', daysAgo: 2 },
      { cand: createdUsers[4], jobIdx: 1, status: 'applied', score: 62, source: 'ai', daysAgo: 1 },
      { cand: createdUsers[5], jobIdx: 0, status: 'applied', score: 58, source: 'ai', daysAgo: 1 },
      { cand: createdUsers[6], jobIdx: 2, status: 'applied', score: 52, source: 'fallback', daysAgo: 0 },
    ];

    const applicationDocs = appConfigs.map((cfg) => {
      const job = createdJobs[cfg.jobIdx];
      const appliedDate = new Date(now - cfg.daysAgo * dayMs);
      const updatedDate = cfg.hireDays ? new Date(appliedDate.getTime() + cfg.hireDays * dayMs) : new Date();

      const matchedSkills = (job.requiredSkills || []).slice(0, cfg.score >= 75 ? 4 : 2);
      const missingSkills = (job.requiredSkills || []).filter((s) => !matchedSkills.includes(s));

      return {
        job: job._id,
        candidate: cfg.cand._id,
        resumeUrl: `https://aptly.ai/resumes/${cfg.cand.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        status: cfg.status,
        aiMatchScore: cfg.score,
        matchedSkills,
        missingSkills,
        fitSummary: `Evaluated profile exhibits strong alignment on ${matchedSkills.join(', ')}.`,
        evaluationSource: cfg.source,
        scoreBreakdown: {
          skillsScore: cfg.score,
          experienceScore: cfg.source === 'ai' ? Math.min(100, cfg.score + 2) : null,
          domainScore: cfg.source === 'ai' ? Math.max(50, cfg.score - 4) : null,
          educationScore: cfg.source === 'ai' ? 85 : null,
        },
        appliedAt: appliedDate,
        updatedAt: updatedDate,
      };
    });

    const createdApps = await Application.insertMany(applicationDocs);
    console.log(`✔ Seeded ${createdApps.length} applications (20 AI-evaluated, 4 keyword fallback).\n`);

    // Seed Interviews for candidates in 'interview' stage
    const interviewCandidates = createdApps.filter((a) => a.status === 'interview');
    const interviewDocs = interviewCandidates.slice(0, 3).map((app, idx) => ({
      jobId: app.job,
      candidateId: app.candidate,
      recruiterId: recruiterUser._id,
      scheduledTime: new Date(now + (idx + 1) * 2 * dayMs),
      status: 'scheduled',
      meetLink: `https://meet.google.com/apt-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`,
      notes: 'Technical architecture deep-dive and live pairing session.',
    }));

    if (interviewDocs.length > 0) {
      await Interview.insertMany(interviewDocs);
      console.log(`✔ Seeded ${interviewDocs.length} upcoming scheduled interviews.\n`);
    }

    console.log('======================================================');
    console.log('✨ Demo Data Reset Complete & Ready!');
    console.log('======================================================');
    console.log('🏢 Recruiter:  recruiter@aptly.ai / password123');
    console.log('🎯 Candidate:  candidate@aptly.ai / password123');
    console.log('📊 Single Source of Truth: 24 applications (16 Shortlisted cumulative, 10 Interview, 4 Offer, 2 Hired)');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Error during demo reset:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

resetDemoData();

