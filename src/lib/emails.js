export const sendConfirmationEmail = async ({
  groupMember,
  cabin,
  selectedBeds,
  host,
}) => {
  const res = await fetch('/api/cabin-confirmation-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      groupMember,
      cabin,
      selectedBeds,
      host,
    }),
  }).then(res => res.json());
};

export const sendTemporaryPasswordEmail = async ({ emailAddress }) => {
  const res = await fetch(
    `https://highlandsmusicfestival.ca/api/email-templates/send-cabin-reservation-email?emailAddress=${emailAddress}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailAddress,
      }),
    },
  ).then(res => res.json());
};

export const sendQRCode = async ({ email, recordId }) => {
  const res = await fetch(
    `https://highlandsmusicfestival.ca/api/email-templates/send-qr-codes?email=${email}&recordId=${recordId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        recordId,
      }),
    },
  ).then(res => res.json());
};

export const sendEmail = async ({ emailAddress, subject, html }) => {
  const baseUrl = 'https://highlandsmusicfestival.ca';
  const endpoint = `${baseUrl}/api/mailchimp/send-email`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: baseUrl,
      },
      body: JSON.stringify({ emailAddress, subject, html }),
    });

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = {
        error: 'Invalid JSON response from Mailchimp send-email endpoint',
      };
    }

    return { response, data };
  } catch (error) {
    return {
      response: null,
      data: {
        error: error.message || 'Unable to send Mailchimp email',
      },
    };
  }
};
