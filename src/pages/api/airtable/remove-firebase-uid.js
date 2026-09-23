import { transformFields } from '../../../lib/airtable';
const Airtable = require('airtable');

// Airtable Config
var airtableBase = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
}).base(process.env.AIRTABLE_BASE);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { tableId, recordId, newFields = {} } = req.body;

    if (!recordId || typeof recordId !== 'string') {
      return res.status(400).json({ message: 'A valid Airtable record ID is required.' });
    }

    try {
      const response = await airtableBase(tableId).update([
        {
          id: recordId,
          fields: { ...newFields, 'Firebase UID': '' },
        },
      ]);

      const record = response[0];
      const fields = transformFields({ record });
      const transformedRecord = {
        ...fields,
        id: record.id,
      };

      res.status(200).json({ record: transformedRecord });
    } catch (err) {
      res.status(err.statusCode || 500).json({ message: err.message || 'Unable to update Airtable record.' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
