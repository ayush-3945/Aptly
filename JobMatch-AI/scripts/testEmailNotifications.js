require('dotenv').config();
const { sendEmail } = require('../src/utils/emailService');
const serverEmailService = require('../server/utils/emailService');
const {
  getScoreStyles,
  applicationReceivedTemplate,
  applicationShortlistedTemplate,
  interviewScheduledTemplate,
  newApplicationAlertTemplate,
  interviewCancelledTemplate,
  applicationOfferTemplate,
  applicationHiredTemplate,
} = require('../src/emails/templates');
const serverTemplates = require('../server/emails/templates');

async function runTests() {
  console.log('🧪 [Test Suite] Starting Resend Email Service & Template Validation...\n');

  // 1. Check all 7 template functions exist across both src/ and server/ imports
  console.log('1. Checking template exports and aliases across src/ and server/...');
  const requiredTemplates = [
    'applicationReceivedTemplate',
    'applicationShortlistedTemplate',
    'interviewScheduledTemplate',
    'newApplicationAlertTemplate',
    'interviewCancelledTemplate',
    'applicationOfferTemplate',
    'applicationHiredTemplate',
  ];

  for (const tName of requiredTemplates) {
    const srcFn = require('../src/emails/templates')[tName];
    const srvFn = serverTemplates[tName];
    if (typeof srcFn !== 'function' || typeof srvFn !== 'function') {
      throw new Error(`Template ${tName} export mismatch or missing between src/ and server/`);
    }
  }

  if (typeof sendEmail !== 'function' || typeof serverEmailService.sendEmail !== 'function') {
    throw new Error('Email service sendEmail export mismatch between src and server');
  }
  console.log('   ✅ All 7 transactional templates & email service exports correctly aligned.\n');

  // 2. Test getScoreStyles for semantic thresholds
  console.log('2. Testing semantic match score color logic...');
  const highFit = getScoreStyles(85);
  const midFit = getScoreStyles(68);
  const lowFit = getScoreStyles(42);

  if (highFit.label !== 'Strong Match' || highFit.text !== '#2D7A3A') {
    throw new Error(`Expected high fit (85) to be Strong Match #2D7A3A, got: ${JSON.stringify(highFit)}`);
  }
  if (midFit.label !== 'Moderate Match' || midFit.text !== '#B45309') {
    throw new Error(`Expected mid fit (68) to be Moderate Match #B45309, got: ${JSON.stringify(midFit)}`);
  }
  if (lowFit.label !== 'Low Match' || lowFit.text !== '#B91C1C') {
    throw new Error(`Expected low fit (42) to be Low Match #B91C1C, got: ${JSON.stringify(lowFit)}`);
  }
  console.log('   ✅ Score tiers: Strong Match (85%), Moderate Match (68%), Low Match (42%) verified.\n');

  // 3. Test Template 1: Application Received
  console.log('3. Generating Application Received Template...');
  const receivedHtml = applicationReceivedTemplate({
    candidateName: 'Dr. Sarah Lin',
    jobTitle: 'Senior Clinical Research Associate',
    companyName: 'Genentech',
    matchScore: 88,
    dashboardUrl: 'http://localhost:3000/candidate/dashboard',
  });
  if (!receivedHtml.includes('Application confirmed') || !receivedHtml.includes('#0F6B5C') || !receivedHtml.includes('88%')) {
    throw new Error('Application Received template failed validation check.');
  }
  console.log('   ✅ Application Received template valid.\n');

  // 4. Test Template 2: Application Shortlisted
  console.log('4. Generating Application Shortlisted Template...');
  const shortlistedHtml = applicationShortlistedTemplate({
    candidateName: 'Dr. Sarah Lin',
    jobTitle: 'Senior Clinical Research Associate',
    companyName: 'Genentech',
    nextSteps: 'The team will invite you for a 45-minute technical review next week.',
    dashboardUrl: 'http://localhost:3000/candidate/dashboard',
  });
  if (!receivedHtml.includes('Genentech') || !shortlistedHtml.includes("You've been shortlisted")) {
    throw new Error('Application Shortlisted template failed validation check.');
  }
  console.log('   ✅ Application Shortlisted template valid.\n');

  // 5. Test Template 3: Interview Scheduled
  console.log('5. Generating Interview Scheduled Template...');
  const interviewHtml = interviewScheduledTemplate({
    candidateName: 'Dr. Sarah Lin',
    jobTitle: 'Senior Clinical Research Associate',
    companyName: 'Genentech',
    interviewDate: 'September 15, 2026',
    interviewTime: '2:00 PM EST',
    interviewerName: 'Dr. Robert Vance, VP Clinical Ops',
    meetingLink: 'https://meet.google.com/xyz-aptly-interview',
  });
  if (!interviewHtml.includes('September 15, 2026') || !interviewHtml.includes('Dr. Robert Vance')) {
    throw new Error('Interview Scheduled template failed validation check.');
  }
  console.log('   ✅ Interview Scheduled template valid.\n');

  // 6. Test Template 4: Recruiter New Application Alert
  console.log('6. Generating Recruiter New Application Alert Template...');
  const alertHtml = newApplicationAlertTemplate({
    recruiterName: 'Elena Rostova',
    candidateName: 'Dr. Sarah Lin',
    jobTitle: 'Senior Clinical Research Associate',
    matchScore: 92,
    scorecardUrl: 'http://localhost:3000/recruiter/pipeline/app-1234',
  });
  if (!alertHtml.includes('New candidate application') && !alertHtml.includes('New application received')) {
    throw new Error('New Application Alert template failed validation check.');
  }
  if (!alertHtml.includes('92%') || !alertHtml.includes('Aptly.AI — Clinical talent intelligence')) {
    throw new Error('New Application Alert template footer/score mismatch.');
  }
  console.log('   ✅ Recruiter New Application Alert template valid.\n');

  // 7. Test Template 5: Interview Cancelled Template
  console.log('7. Generating Interview Cancelled Template...');
  const cancelledHtml = interviewCancelledTemplate({
    candidateName: 'Dr. Sarah Lin',
    jobTitle: 'Senior Clinical Research Associate',
    companyName: 'Genentech',
    interviewDate: 'September 18, 2026 at 2:00 PM EST',
    reason: 'The hiring committee had an unexpected schedule conflict and will reschedule.',
    dashboardUrl: 'http://localhost:3000/dashboard',
  });
  if (!cancelledHtml.includes('Interview Cancelled') || !cancelledHtml.includes('schedule conflict')) {
    throw new Error('Interview Cancelled template failed validation check.');
  }
  console.log('   ✅ Interview Cancelled template valid.\n');

  // 8. Test Template 6: Application Offer Extended Template
  console.log('8. Generating Application Offer Extended Template...');
  const offerHtml = applicationOfferTemplate({
    candidateName: 'Dr. Sarah Lin',
    jobTitle: 'Senior Clinical Research Associate',
    companyName: 'Genentech',
    offerDetails: 'Base Salary: $145,000 + 15% bonus and health benefits package.',
    dashboardUrl: 'http://localhost:3000/dashboard',
  });
  if (!offerHtml.includes('Offer Extended') || !offerHtml.includes('$145,000') || !offerHtml.includes('Official Job Offer')) {
    throw new Error('Application Offer Extended template failed validation check.');
  }
  console.log('   ✅ Application Offer Extended template valid.\n');

  // 9. Test Template 7: Application Hired Template
  console.log('9. Generating Application Hired Template...');
  const hiredHtml = applicationHiredTemplate({
    candidateName: 'Dr. Sarah Lin',
    jobTitle: 'Senior Clinical Research Associate',
    companyName: 'Genentech',
    welcomeMessage: 'Your laptop and security clearance packet will ship by Monday.',
    dashboardUrl: 'http://localhost:3000/dashboard',
  });
  if (!hiredHtml.includes('Hired 🎉') || !hiredHtml.includes('Welcome to the Team!') || !hiredHtml.includes('security clearance')) {
    throw new Error('Application Hired template failed validation check.');
  }
  console.log('   ✅ Application Hired template valid.\n');

  // 10. Test sendEmail function with simulation fallback
  console.log('10. Testing sendEmail execution...');
  const res1 = await sendEmail(
    'candidate@example.com',
    'Application Received: Senior Clinical Research Associate at Genentech',
    receivedHtml
  );
  if (!res1.success) {
    throw new Error(`sendEmail failed: ${res1.error}`);
  }

  const res2 = await sendEmail({
    to: 'candidate@example.com',
    subject: 'Official Job Offer: Senior Clinical Research Associate at Genentech',
    htmlContent: offerHtml,
  });
  if (!res2.success) {
    throw new Error(`sendEmail object format failed: ${res2.error}`);
  }
  console.log('   ✅ sendEmail executed successfully in both positional & object configurations.\n');

  console.log('🎉 ALL 7 TRANSACTIONAL EMAIL NOTIFICATION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
