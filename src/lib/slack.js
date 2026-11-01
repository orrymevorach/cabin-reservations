// Called from server-side API routes, so the request needs an absolute URL; relative URLs fail in Node's fetch.
export async function sendSlackNotification({
  originalGuestName,
  newGuestName,
  email,
  cabin,
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ENV_URL}/api/slack/send-slack-notification`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ originalGuestName, newGuestName, email, cabin }),
    },
  );
  if (!response.ok) {
    throw new Error(
      `Slack notification request failed with status ${response.status}.`,
    );
  }
  return response.json();
}
