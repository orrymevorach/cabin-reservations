import { clearUserSession } from '@/lib/user-session-server';

// Sign the user out by clearing the httpOnly session cookie, which browser code cannot remove.
export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
  clearUserSession(res);
  return res.status(200).json({ success: true });
}
