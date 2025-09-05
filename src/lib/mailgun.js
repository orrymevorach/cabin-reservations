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
    `https://highlandsmusicfestival.ca/api/mailgun/send-cabin-reservation-email?emailAddress=${emailAddress}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailAddress,
      }),
    }
  ).then(res => res.json());
};
