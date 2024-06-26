import { transformFields } from '../../../lib/airtable';
const Airtable = require('airtable');

// Airtable Config
var airtableBase = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
}).base(process.env.AIRTABLE_BASE);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { tableId, field, fieldValue } = req.body;
    try {
      let recordObj = {};
      const response = await airtableBase(tableId)
        .select()
        .eachPage((records, fetchNextPage) => {
          records.forEach(record => {
            if (record.fields[field] === fieldValue) {
              const fields = transformFields({ record });
              recordObj = fields;
              recordObj.id = record.getId();
            }
          });
          fetchNextPage();
        });

      res.status(200).json({ record: recordObj });
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
