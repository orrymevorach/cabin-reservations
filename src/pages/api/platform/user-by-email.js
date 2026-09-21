import { getUserByEmail } from '@/lib/airtable';
import { isObjectEmpty } from '@/utils/string-utils';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'email is required.' });
    }

    const user = await getUserByEmail({ email });
    res.status(200).json({ user: isObjectEmpty(user) ? null : user });
  } catch (err) {
    console.log('error', err);
    res.status(err.statusCode || 500).json({ message: err.message });
  }
}
