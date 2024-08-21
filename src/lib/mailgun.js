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
