export async function sendSlackNotification({
  originalGuestName,
  newGuestName,
  email,
  cabin,
}) {
  const response = await fetch('/api/slack/send-slack-notification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ originalGuestName, newGuestName, email, cabin }),
  }).then(res => res.json());
  return response;
}
