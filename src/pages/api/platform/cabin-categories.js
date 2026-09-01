import { getCabinCategories } from '@/lib/airtable';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const cabinCategories = await getCabinCategories({});
    res.status(200).json({ cabinCategories });
  } catch (err) {
    console.log('error', err);
    res.status(err.statusCode || 500).json({ message: err.message });
  }
}
