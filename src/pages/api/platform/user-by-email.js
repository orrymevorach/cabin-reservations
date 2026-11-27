import { logSentryApiError } from '@/utils/sentry-utils';
import { getUserByEmail } from '@/lib/airtable';
import { isObjectEmpty } from '@/utils/string-utils';
import { requireSignedInUser } from '@/lib/user-session-server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  // Signed-in users look up other ticket holders (for example to add them to a group). Only the
  // fields that identify a ticket are returned, never contact details or passwords.
  const signedInUser = await requireSignedInUser(req, res);
  if (!signedInUser) return;
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'email is required.' });
    }

    const user = await getUserByEmail({ email });
    res.status(200).json({
      user: isObjectEmpty(user)
        ? null
        : { id: user.id, name: user.name, status: user.status },
    });
  } catch (err) {
    await logSentryApiError({
      error: err,
      req,
      action: 'load-user-by-email',
      extra: {},
    });
    res.status(err.statusCode || 500).json({ message: err.message });
  }
}
