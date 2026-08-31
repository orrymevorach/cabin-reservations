const mailchimp = require('@mailchimp/mailchimp_transactional')(
  process.env.MAILCHIMP_TRANSACTIONAL_API_KEY,
);

const DEFAULT_FROM_EMAIL = 'noreply@highlandsmusicfestival.ca';
const DEFAULT_FROM_NAME = 'Highlands Music Festival';

function normalizeRecipients(to) {
  if (!to) return [];

  if (Array.isArray(to)) {
    return to
      .map(recipient => {
        if (!recipient) return null;

        if (typeof recipient === 'string') {
          const email = recipient.trim();
          return email ? { email, type: 'to' } : null;
        }

        if (typeof recipient === 'object' && recipient.email) {
          const email = String(recipient.email).trim();
          if (!email) return null;

          return {
            ...recipient,
            email,
            type: recipient.type || 'to',
          };
        }

        return null;
      })
      .filter(Boolean);
  }

  if (typeof to === 'string') {
    const email = to.trim();
    return email ? [{ email, type: 'to' }] : [];
  }

  if (typeof to === 'object' && to.email) {
    const email = String(to.email).trim();
    return email ? [{ ...to, email, type: to.type || 'to' }] : [];
  }

  return [];
}

async function sendTransactionalEmail({
  to,
  subject,
  html,
  fromEmail = DEFAULT_FROM_EMAIL,
  fromName = DEFAULT_FROM_NAME,
}) {
  const recipients = normalizeRecipients(to);

  if (!recipients.length) {
    throw new Error('No valid recipients provided to sendTransactionalEmail');
  }

  return mailchimp.messages.send({
    message: {
      from_email: fromEmail,
      from_name: fromName,
      to: recipients,
      subject,
      html,
    },
  });
}

function getTransactionalErrorMessage(err) {
  return (
    err.response?.body?.detail ||
    err.response?.body ||
    err.message ||
    'Unknown error'
  );
}

module.exports = {
  sendTransactionalEmail,
  getTransactionalErrorMessage,
};
