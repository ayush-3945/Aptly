const { Resend } = require('resend');

const apiKey = process.env.RESEND_API_KEY;
const isLiveKey = apiKey && !apiKey.includes('demo') && !apiKey.includes('placeholder') && apiKey.startsWith('re_');

let resendClient = null;
if (apiKey) {
  try {
    resendClient = new Resend(apiKey);
  } catch (err) {
    console.warn('[EmailService] Failed to initialize Resend client:', err.message);
  }
}

/**
 * Sends a transactional email using Resend, with simulation fallback for development/sandbox environments.
 * 
 * @param {string|object} to - Recipient email address, or options object { to, subject, htmlContent }
 * @param {string} [subject] - Email subject
 * @param {string} [htmlContent] - HTML body
 * @returns {Promise<{ success: boolean, data?: any, simulated?: boolean, error?: string }>}
 */
async function sendEmail(to, subject, htmlContent) {
  // Support both positional arguments and object parameter
  let targetTo = to;
  let targetSubject = subject;
  let targetHtml = htmlContent;

  if (typeof to === 'object' && to !== null && !Array.isArray(to)) {
    targetTo = to.to;
    targetSubject = to.subject;
    targetHtml = to.htmlContent || to.html;
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Aptly.AI <onboarding@resend.dev>';

  if (!targetTo) {
    console.warn('[EmailService] Skipped: No recipient email address provided.');
    return { success: false, error: 'Recipient email required' };
  }

  // Simulation mode if key is placeholder, missing, or in development mode without live Resend key
  if (!isLiveKey || !resendClient) {
    console.log('\n======================================================');
    console.log('[EmailService - Simulated Dispatch via Resend]');
    console.log(`From:    ${fromEmail}`);
    console.log(`To:      ${targetTo}`);
    console.log(`Subject: ${targetSubject}`);
    console.log(`Status:  Simulated delivery (RESEND_API_KEY placeholder or dev mode)`);
    console.log('======================================================\n');
    return {
      success: true,
      simulated: true,
      id: `sim_${Date.now()}`,
      to: targetTo,
      subject: targetSubject,
    };
  }

  try {
    const { data, error } = await resendClient.emails.send({
      from: fromEmail,
      to: targetTo,
      subject: targetSubject,
      html: targetHtml,
    });

    if (error) {
      console.warn(`[EmailService] Resend API responded with error for ${targetTo}:`, error.message || error);
      // Log fallback simulation so developer sees the notification was generated
      console.log(`[EmailService Fallback] Email to ${targetTo} with subject "${targetSubject}" recorded.`);
      return { success: false, error: error.message || error, simulated: true };
    }

    console.log(`[EmailService] Successfully sent email to ${targetTo} [ID: ${data?.id}]`);
    return { success: true, data };
  } catch (err) {
    console.warn(`[EmailService] Network/client exception when sending email to ${targetTo}:`, err.message);
    return { success: false, error: err.message, simulated: true };
  }
}

module.exports = {
  sendEmail,
};
