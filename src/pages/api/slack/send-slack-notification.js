const { WebClient } = require('@slack/web-api');

require('dotenv').config({ path: '.env.local' });

// Slack Config
const web = new WebClient(process.env.SLACK_OAUTH_TOKEN);

export default async function handler(req, res) {
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
    console.error('Error sending message:', error);
    res.status(400).json({ error });
  }
}
