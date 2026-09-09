/**
 * Aptly.AI / JobMatch AI - Transactional Email Templates
 * Brand System: Clinical Teal Paper
 * Primary Accent: #0F6B5C
 * Header Canvas: #F4F4F0
 * Card Body: #FFFFFF
 * Serif Headlines: Charter, Newsreader, Georgia
 */

/**
 * Returns color palette tokens for a given match score percentage
 */
function getScoreStyles(score) {
  const num = Number(score) || 0;
  if (num >= 75) {
    return {
      text: '#2D7A3A',
      bg: '#EAF6EC',
      border: '#BCE2C5',
      label: 'Strong Match',
    };
  }
  if (num >= 50) {
    return {
      text: '#B45309',
      bg: '#FEF3C7',
      border: '#FDE68A',
      label: 'Moderate Match',
    };
  }
  return {
    text: '#B91C1C',
    bg: '#FEE2E2',
    border: '#FECACA',
    label: 'Low Match',
  };
}

/**
 * Base email layout wrapper
 */
function baseLayout({ title, previewText, content, unsubscribeUrl }) {
  const unsubLink = unsubscribeUrl || `${process.env.APP_URL || 'http://localhost:3000'}/settings/notifications`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Aptly.AI Notification'}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    @media screen and (max-width: 620px) {
      .container {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 0 !important;
      }
      .content-padding {
        padding: 24px 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F4F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1F2937;">
  ${previewText ? `<div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #F4F4F0;">${previewText}</div>` : ''}

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F4F4F0; padding: 40px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container (Max 600px) -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="container" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          
          <!-- Top Clinical Header -->
          <tr>
            <td style="background-color: #F4F4F0; padding: 24px 32px; border-bottom: 1px solid #E5E7EB;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="font-family: 'Charter', 'Newsreader', 'Georgia', serif; font-size: 22px; font-weight: 700; color: #0F6B5C; letter-spacing: -0.01em;">Aptly<span style="color: #1F2937;">.AI</span></span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #0F6B5C; background-color: #E6F4F1; padding: 4px 8px; border-radius: 3px; border: 1px solid #B8E0D7;">
                      Talent Intelligence
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td class="content-padding" style="padding: 36px 32px 32px 32px; background-color: #FFFFFF;">
              ${content}
            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td style="background-color: #FAFAF8; padding: 24px 32px; border-top: 1px solid #E5E7EB; text-align: center;">
              <p style="margin: 0; font-size: 13px; font-weight: 500; color: #4B5563;">
                Aptly.AI — Clinical talent intelligence
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #9CA3AF; line-height: 1.5;">
                This transactional email was sent to notify you about your hiring activity.<br>
                <a href="${unsubLink}" style="color: #0F6B5C; text-decoration: underline; font-weight: 500;">Unsubscribe</a> from automated hiring updates.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 1. Candidate: Application Received Template
 */
function applicationReceivedTemplate({
  candidateName = 'Candidate',
  jobTitle = 'Position',
  companyName = 'Company',
  matchScore = null,
  dashboardUrl = null,
}) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const actionUrl = dashboardUrl || `${appUrl}/dashboard`;
  const scoreInfo = matchScore !== null ? getScoreStyles(matchScore) : null;

  const scoreBadgeHtml = scoreInfo
    ? `
    <div style="margin: 24px 0; padding: 18px 20px; background-color: #F8FAF9; border: 1px solid #E5E7EB; border-left: 4px solid #0F6B5C; border-radius: 4px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td valign="middle">
            <span style="font-size: 13px; font-weight: 600; color: #4B5563; text-transform: uppercase; letter-spacing: 0.03em;">AI Match Score</span>
            <div style="font-family: 'Charter', 'Newsreader', 'Georgia', serif; font-size: 28px; font-weight: 700; color: #0F6B5C; margin-top: 2px;">
              ${matchScore}%
            </div>
          </td>
          <td align="right" valign="middle">
            <span style="display: inline-block; padding: 5px 10px; font-size: 12px; font-weight: 600; color: ${scoreInfo.text}; background-color: ${scoreInfo.bg}; border: 1px solid ${scoreInfo.border}; border-radius: 3px;">
              ${scoreInfo.label}
            </span>
          </td>
        </tr>
      </table>
    </div>`
    : '';

  const content = `
    <h1 style="margin: 0 0 16px 0; font-family: 'Charter', 'Newsreader', 'Georgia', serif; font-size: 24px; font-weight: 700; color: #111827; line-height: 1.3;">
      Application confirmed
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">
      Hello ${candidateName},
    </p>
    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #374151;">
      Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been successfully received and submitted to the hiring team.
    </p>

    ${scoreBadgeHtml}

    <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.6; color: #4B5563;">
      Our AI evaluator has indexed your qualifications against the role requirements. You can track your application status, interview schedules, and updates directly in your candidate dashboard.
    </p>

    <div style="margin: 28px 0 10px 0;">
      <a href="${actionUrl}" style="display: inline-block; background-color: #0F6B5C; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 3px; box-shadow: 0 1px 2px rgba(15, 107, 92, 0.2);">
        View your application
      </a>
    </div>
  `;

  return baseLayout({
    title: `Application Received: ${jobTitle} at ${companyName}`,
    previewText: `Your application for ${jobTitle} at ${companyName} has been received.`,
    content,
    unsubscribeUrl: `${appUrl}/settings/notifications`,
  });
}

/**
 * 2. Candidate: Application Shortlisted Template
 */
function applicationShortlistedTemplate({
  candidateName = 'Candidate',
  jobTitle = 'Position',
  companyName = 'Company',
  nextSteps = 'Our recruiting team will contact you shortly with interview details.',
  dashboardUrl = null,
}) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const actionUrl = dashboardUrl || `${appUrl}/dashboard`;

  const content = `
    <div style="margin-bottom: 12px;">
      <span style="display: inline-block; font-size: 12px; font-weight: 600; color: #2D7A3A; background-color: #EAF6EC; border: 1px solid #BCE2C5; padding: 3px 8px; border-radius: 3px;">
        Stage: Shortlisted
      </span>
    </div>
    <h1 style="margin: 0 0 16px 0; font-family: 'Charter', 'Newsreader', 'Georgia', serif; font-size: 24px; font-weight: 700; color: #111827; line-height: 1.3;">
      Congratulations! You've been shortlisted
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">
      Dear ${candidateName},
    </p>
    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #374151;">
      Great news — the recruitment team at <strong>${companyName}</strong> has reviewed your application for <strong>${jobTitle}</strong> and advanced you to the <strong>Shortlisted</strong> stage.
    </p>

    <div style="margin: 24px 0; padding: 20px; background-color: #F8FAF9; border: 1px solid #E5E7EB; border-left: 4px solid #0F6B5C; border-radius: 4px;">
      <div style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; color: #0F6B5C; margin-bottom: 6px;">
        Next Steps
      </div>
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #374151;">
        ${nextSteps}
      </p>
    </div>

    <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.6; color: #4B5563;">
      Please keep an eye on your email for upcoming interview invitations and team updates.
    </p>

    <div style="margin: 28px 0 10px 0;">
      <a href="${actionUrl}" style="display: inline-block; background-color: #0F6B5C; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 3px; box-shadow: 0 1px 2px rgba(15, 107, 92, 0.2);">
        View application status
      </a>
    </div>
  `;

  return baseLayout({
    title: `Congratulations: Shortlisted for ${jobTitle} at ${companyName}`,
    previewText: `You have been shortlisted for ${jobTitle} at ${companyName}!`,
    content,
    unsubscribeUrl: `${appUrl}/settings/notifications`,
  });
}

/**
 * 3. Candidate: Interview Scheduled Template
 */
function interviewScheduledTemplate({
  candidateName = 'Candidate',
  jobTitle = 'Position',
  companyName = 'Company',
  interviewDate = 'To be confirmed',
  interviewTime = 'To be confirmed',
  duration = 45,
  format = 'Video Call',
  interviewerName = 'Hiring Team',
  meetingLink = null,
  notes = '',
  dashboardUrl = null,
}) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const actionUrl = dashboardUrl || `${appUrl}/dashboard`;

  const content = `
    <div style="margin-bottom: 12px;">
      <span style="display: inline-block; font-size: 12px; font-weight: 600; color: #0F6B5C; background-color: #E6F4F1; border: 1px solid #B8E0D7; padding: 3px 8px; border-radius: 3px;">
        Interview Scheduled
      </span>
    </div>
    <h1 style="margin: 0 0 16px 0; font-family: 'Charter', 'Newsreader', 'Georgia', serif; font-size: 24px; font-weight: 700; color: #111827; line-height: 1.3;">
      Your interview details
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">
      Dear ${candidateName},
    </p>
    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #374151;">
      An interview has been scheduled for your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.
    </p>

    <!-- Interview Details Card -->
    <div style="margin: 24px 0; background-color: #F8FAF9; border: 1px solid #E5E7EB; border-radius: 4px; padding: 20px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding-bottom: 12px; font-size: 13px; color: #6B7280; width: 120px;">Role:</td>
          <td style="padding-bottom: 12px; font-size: 14px; font-weight: 600; color: #111827;">${jobTitle}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 12px; font-size: 13px; color: #6B7280;">Company:</td>
          <td style="padding-bottom: 12px; font-size: 14px; font-weight: 600; color: #111827;">${companyName}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 12px; font-size: 13px; color: #6B7280;">Date:</td>
          <td style="padding-bottom: 12px; font-size: 14px; font-weight: 600; color: #0F6B5C;">${interviewDate}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 12px; font-size: 13px; color: #6B7280;">Time:</td>
          <td style="padding-bottom: 12px; font-size: 14px; font-weight: 600; color: #0F6B5C;">${interviewTime} (${duration} mins)</td>
        </tr>
        <tr>
          <td style="padding-bottom: 12px; font-size: 13px; color: #6B7280;">Format:</td>
          <td style="padding-bottom: 12px; font-size: 14px; font-weight: 600; color: #111827;">
            <span style="display: inline-block; padding: 2px 7px; font-size: 12px; font-weight: 600; background: #E6F4F1; color: #0F6B5C; border-radius: 3px;">
              ${format}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom: ${meetingLink || notes ? '12px' : '0'}; font-size: 13px; color: #6B7280;">Interviewer:</td>
          <td style="padding-bottom: ${meetingLink || notes ? '12px' : '0'}; font-size: 14px; font-weight: 600; color: #111827;">${interviewerName}</td>
        </tr>
        ${meetingLink ? `
        <tr>
          <td style="padding-bottom: ${notes ? '12px' : '0'}; font-size: 13px; color: #6B7280;">Meeting Link:</td>
          <td style="padding-bottom: ${notes ? '12px' : '0'}; font-size: 14px; font-weight: 600;"><a href="${meetingLink}" style="color: #0F6B5C; text-decoration: underline;">${meetingLink}</a></td>
        </tr>` : ''}
        ${notes ? `
        <tr>
          <td style="vertical-align: top; font-size: 13px; color: #6B7280;">Preparation Notes:</td>
          <td style="font-size: 13px; color: #4B5563; line-height: 1.5;">${notes}</td>
        </tr>` : ''}
      </table>
    </div>

    <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.6; color: #4B5563;">
      Please prepare in advance and join a few minutes early. If you need to reschedule, please reach out directly through your dashboard.
    </p>

    <div style="margin: 28px 0 10px 0;">
      <a href="${actionUrl}" style="display: inline-block; background-color: #0F6B5C; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 3px; box-shadow: 0 1px 2px rgba(15, 107, 92, 0.2);">
        View interview in dashboard
      </a>
    </div>
  `;

  return baseLayout({
    title: `Interview Scheduled: ${jobTitle} at ${companyName}`,
    previewText: `Your interview for ${jobTitle} at ${companyName} has been scheduled.`,
    content,
    unsubscribeUrl: `${appUrl}/settings/notifications`,
  });
}

/**
 * 4. Recruiter: New Application Alert Template
 */
function newApplicationAlertTemplate({
  recruiterName = 'Recruiter',
  candidateName = 'Candidate',
  jobTitle = 'Position',
  matchScore = 0,
  scorecardUrl = null,
}) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const actionUrl = scorecardUrl || `${appUrl}/recruiter/pipeline`;
  const scoreInfo = getScoreStyles(matchScore);

  const content = `
    <div style="margin-bottom: 12px;">
      <span style="display: inline-block; font-size: 12px; font-weight: 600; color: #0F6B5C; background-color: #E6F4F1; border: 1px solid #B8E0D7; padding: 3px 8px; border-radius: 3px;">
        Pipeline Alert
      </span>
    </div>
    <h1 style="margin: 0 0 16px 0; font-family: 'Charter', 'Newsreader', 'Georgia', serif; font-size: 24px; font-weight: 700; color: #111827; line-height: 1.3;">
      New application received
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">
      Hello ${recruiterName},
    </p>
    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #374151;">
      <strong>${candidateName}</strong> has just submitted an application for <strong>${jobTitle}</strong>.
    </p>

    <!-- AI Match Score Card -->
    <div style="margin: 24px 0; padding: 20px; background-color: #F8FAF9; border: 1px solid #E5E7EB; border-radius: 4px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td>
            <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #6B7280; margin-bottom: 4px;">
              Evaluated Match Score
            </div>
            <div style="display: inline-flex; align-items: baseline;">
              <span style="font-family: 'Charter', 'Newsreader', 'Georgia', serif; font-size: 32px; font-weight: 700; color: ${scoreInfo.text};">
                ${matchScore}%
              </span>
              <span style="margin-left: 10px; display: inline-block; padding: 3px 8px; font-size: 12px; font-weight: 600; color: ${scoreInfo.text}; background-color: ${scoreInfo.bg}; border: 1px solid ${scoreInfo.border}; border-radius: 3px;">
                ${scoreInfo.label}
              </span>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.6; color: #4B5563;">
      The candidate's resume, skill breakdown, and fit analysis are ready for review in your recruiter command center.
    </p>

    <div style="margin: 28px 0 10px 0;">
      <a href="${actionUrl}" style="display: inline-block; background-color: #0F6B5C; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 3px; box-shadow: 0 1px 2px rgba(15, 107, 92, 0.2);">
        View candidate scorecard
      </a>
    </div>
  `;

  return baseLayout({
    title: `New Candidate: ${candidateName} applied for ${jobTitle}`,
    previewText: `${candidateName} applied for ${jobTitle} with match score of ${matchScore}%.`,
    content,
    unsubscribeUrl: `${appUrl}/settings/notifications`,
  });
}

/**
 * 5. Candidate: Interview Cancelled Template
 */
function interviewCancelledTemplate({
  candidateName = 'Candidate',
  jobTitle = 'Position',
  companyName = 'Company',
  interviewDate = 'Scheduled Date',
  reason = 'The hiring team had to cancel this session.',
  dashboardUrl = null,
}) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const actionUrl = dashboardUrl || `${appUrl}/dashboard`;

  const content = `
    <div style="margin-bottom: 12px;">
      <span style="display: inline-block; font-size: 12px; font-weight: 600; color: #B91C1C; background-color: #FEE2E2; border: 1px solid #FECACA; padding: 3px 8px; border-radius: 3px;">
        Interview Cancelled
      </span>
    </div>
    <h1 style="margin: 0 0 16px 0; font-family: 'Charter', 'Newsreader', 'Georgia', serif; font-size: 24px; font-weight: 700; color: #111827; line-height: 1.3;">
      Update on your interview
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">
      Dear ${candidateName},
    </p>
    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #374151;">
      Your scheduled interview for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> on <strong>${interviewDate}</strong> has been cancelled.
    </p>

    <div style="margin: 24px 0; padding: 18px; background-color: #FFF5F5; border: 1px solid #FED7D7; border-left: 4px solid #B91C1C; border-radius: 4px;">
      <div style="font-size: 13px; font-weight: 600; color: #991B1B; margin-bottom: 4px;">
        Notice from Hiring Team
      </div>
      <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #4B5563;">
        ${reason}
      </p>
    </div>

    <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.6; color: #4B5563;">
      The recruiter may reach out to reschedule. You can track your application status anytime on your candidate dashboard.
    </p>

    <div style="margin: 28px 0 10px 0;">
      <a href="${actionUrl}" style="display: inline-block; background-color: #0F6B5C; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 3px; box-shadow: 0 1px 2px rgba(15, 107, 92, 0.2);">
        View Dashboard
      </a>
    </div>
  `;

  return baseLayout({
    title: `Interview Cancelled: ${jobTitle} at ${companyName}`,
    previewText: `Your interview for ${jobTitle} at ${companyName} has been cancelled.`,
    content,
    unsubscribeUrl: `${appUrl}/settings/notifications`,
  });
}

module.exports = {
  getScoreStyles,
  baseLayout,
  applicationReceivedTemplate,
  applicationShortlistedTemplate,
  interviewScheduledTemplate,
  newApplicationAlertTemplate,
  interviewCancelledTemplate,
};

