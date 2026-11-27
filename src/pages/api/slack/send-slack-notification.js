import { logSentryApiError } from '@/utils/sentry-utils';
import { isInternalRequest } from '@/utils/internal-request-server';
const { WebClient } = require('@slack/web-api');

require('dotenv').config({ path: '.env.local' });

// Slack Config
const web = new WebClient(process.env.SLACK_OAUTH_TOKEN);

// Called only by this site's group route. Public requests are refused so Slack cannot be spammed.
export default async function handler(req, res) {
  if (!isInternalRequest(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { originalGuestName, newGuestName, email, cabin } = req.body;
  try {
    const channel =
      process.env.NODE_ENV === 'production'
        ? '#notifications_tickets'
        : '#testing_workflows';

    const message = `*<!channel>, a guest has been added to cabin ${cabin}!*\nAttendee: ${newGuestName}\nEmail: ${email}\nGroup Leader: ${originalGuestName}`;
    await web.chat.postMessage({
      channel,
      text: message,
    });
    res.status(200).json({ success: true });
  } catch (error) {
    await logSentryApiError({
      error,
      req,
      action: 'send-cabin-slack-notification',
    });
    res.status(500).json({ error: 'Unable to send Slack notification.' });
  }
}
