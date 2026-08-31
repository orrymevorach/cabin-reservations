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
