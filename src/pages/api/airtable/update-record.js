import { transformFields } from '../../../lib/airtable';
const Airtable = require('airtable');

// Airtable Config
var airtableBase = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
}).base(process.env.AIRTABLE_BASE);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { tableId, recordId, newFields } = req.body;
    try {
      const response = await airtableBase(tableId).update([
        {
          id: recordId,
          fields: { ...newFields },
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
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
