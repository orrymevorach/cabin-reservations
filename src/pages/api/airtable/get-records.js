import { transformFields } from '../../../lib/airtable';
const Airtable = require('airtable');

// Airtable Config
var airtableBase = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
}).base(process.env.AIRTABLE_BASE);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { tableId, view } = req.body;
    try {
      const recordsArray = [];
      const response = await airtableBase(tableId)
        .select({ view })
        .eachPage((records, fetchNextPage) => {
          records.forEach(record => {
            const fields = transformFields({ record });
            record.fields.id = record.getId();
            recordsArray.push(fields);
          });
          fetchNextPage();
        });

      res.status(200).json({ records: recordsArray });
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
