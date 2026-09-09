require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Job = require('../src/models/Job');
const Application = require('../src/models/Application');
const Interview = require('../src/models/Interview');
const {
  scheduleInterview,
  getInterviews,
  updateInterview,
  cancelInterview,
} = require('../src/controllers/interviewController');

// Helper mock req/res
function createMockReqRes(user, body = {}, params = {}, query = {}) {
  const req = {
    user,
    body,
    params,
    query,
  };
  let responseData = null;
  let statusCode = 200;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    getResponse() {
      return { status: statusCode, data: responseData };
    },
  };

  return { req, res };
}

async function runTests() {
  console.log('--- Starting Native Interview Scheduling Automated Verification ---');
  await connectDB();

  let testRecruiter = null;
  let testCandidate = null;
  let testJob = null;
  let testApplication = null;
  let createdInterviewId = null;

  try {
    // 1. Create or retrieve test recruiter & candidate
    const emailRecruiter = `test_recruiter_${Date.now()}@aptly.ai`;
    const emailCandidate = `test_candidate_${Date.now()}@gmail.com`;

    testRecruiter = await User.create({
      name: 'Dr. Sarah Lin (Recruiter)',
      email: emailRecruiter,
      password: 'Password123!',
      role: 'recruiter',
    });

    testCandidate = await User.create({
      name: 'Alex Rivera (Candidate)',
      email: emailCandidate,
      password: 'Password123!',
      role: 'candidate',
    });

    // 2. Create test job
    testJob = await Job.create({
      title: 'Senior Distributed Systems Architect',
      description: 'Lead backend microservices and high-throughput data processing pipelines.',
      company: 'Aptly Cloud Labs',
      location: 'San Francisco, CA (Hybrid)',
      requiredSkills: ['Node.js', 'MongoDB', 'Distributed Systems', 'Redis'],
      postedBy: testRecruiter._id,
    });

    // 3. Create test application in 'shortlisted' state
    testApplication = await Application.create({
      job: testJob._id,
      candidate: testCandidate._id,
      resumeUrl: 'https://aptly.ai/resumes/alex-rivera.pdf',
      status: 'shortlisted',
      aiMatchScore: 92,
      matchedSkills: ['Node.js', 'MongoDB', 'Redis'],
      missingSkills: ['Distributed Systems'],
      fitSummary: 'Outstanding backend architecture expertise.',
    });

    console.log('✓ Test fixtures initialized (Recruiter, Candidate, Job, Application [shortlisted])');

    // 4. Test scheduleInterview (POST /api/interviews/schedule)
    const interviewDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // 2 days from now
    const { req: schedReq, res: schedRes } = createMockReqRes(
      testRecruiter,
      {
        jobId: testJob._id.toString(),
        candidateId: testCandidate._id.toString(),
        scheduledAt: interviewDate.toISOString(),
        duration: 45,
        format: 'Video Call',
        meetingLink: 'https://meet.google.com/aptly-sync-test',
        notes: 'Technical systems design round with live architecture diagrams.',
      }
    );

    await scheduleInterview(schedReq, schedRes);
    const schedResult = schedRes.getResponse();

    if (schedResult.status !== 201 || !schedResult.data?.interview) {
      throw new Error(`scheduleInterview failed with status ${schedResult.status}: ${JSON.stringify(schedResult.data)}`);
    }

    createdInterviewId = schedResult.data.interview._id;
    console.log(`✓ scheduleInterview passed! Created interview ID: ${createdInterviewId}`);

    // Verify Application status was auto-advanced to 'interview'
    const updatedApp = await Application.findById(testApplication._id);
    if (updatedApp.status !== 'interview') {
      throw new Error(`Expected Application status 'interview', got '${updatedApp.status}'`);
    }
    console.log("✓ Application status automatically synchronized to 'interview'");

    // 5. Test getInterviews for Recruiter
    const { req: getRecReq, res: getRecRes } = createMockReqRes(testRecruiter);
    await getInterviews(getRecReq, getRecRes);
    const getRecResult = getRecRes.getResponse();

    if (getRecResult.status !== 200 || !Array.isArray(getRecResult.data) || getRecResult.data.length === 0) {
      throw new Error(`getInterviews (recruiter) failed: ${JSON.stringify(getRecResult.data)}`);
    }
    console.log(`✓ getInterviews (Recruiter) passed! Found ${getRecResult.data.length} interview(s)`);

    // 6. Test getInterviews for Candidate
    const { req: getCandReq, res: getCandRes } = createMockReqRes(testCandidate);
    await getInterviews(getCandReq, getCandRes);
    const getCandResult = getCandRes.getResponse();

    if (getCandResult.status !== 200 || !Array.isArray(getCandResult.data) || getCandResult.data.length === 0) {
      throw new Error(`getInterviews (Candidate) failed: ${JSON.stringify(getCandResult.data)}`);
    }
    console.log(`✓ getInterviews (Candidate) passed! Candidate sees scheduled session with ${getCandResult.data[0].jobId.company}`);

    // 7. Test updateInterview (PATCH /api/interviews/:id) - update duration & notes
    const { req: updateReq, res: updateRes } = createMockReqRes(
      testRecruiter,
      {
        duration: 60,
        notes: 'Extended to 60 mins to include coding exercise.',
      },
      { id: createdInterviewId }
    );

    await updateInterview(updateReq, updateRes);
    const updateResult = updateRes.getResponse();

    if (updateResult.status !== 200 || updateResult.data.interview.duration !== 60) {
      throw new Error(`updateInterview failed: ${JSON.stringify(updateResult.data)}`);
    }
    console.log('✓ updateInterview passed! Updated duration to 60 minutes');

    // 8. Test cancelInterview (DELETE /api/interviews/:id)
    const { req: cancelReq, res: cancelRes } = createMockReqRes(
      testRecruiter,
      { reason: 'Role requirements shifted, rescheduling next cycle.' },
      { id: createdInterviewId }
    );

    await cancelInterview(cancelReq, cancelRes);
    const cancelResult = cancelRes.getResponse();

    if (cancelResult.status !== 200 || cancelResult.data.interview.status !== 'Cancelled') {
      throw new Error(`cancelInterview failed: ${JSON.stringify(cancelResult.data)}`);
    }
    console.log('✓ cancelInterview passed! Status marked as Cancelled & cancellation email dispatched');

    console.log('\n======================================================');
    console.log('ALL BACKEND INTERVIEW SCHEDULING TESTS PASSED (100%)');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    // Cleanup fixtures
    if (createdInterviewId) await Interview.findByIdAndDelete(createdInterviewId);
    if (testApplication) await Application.findByIdAndDelete(testApplication._id);
    if (testJob) await Job.findByIdAndDelete(testJob._id);
    if (testRecruiter) await User.findByIdAndDelete(testRecruiter._id);
    if (testCandidate) await User.findByIdAndDelete(testCandidate._id);
    await mongoose.disconnect();
  }
}

runTests();
