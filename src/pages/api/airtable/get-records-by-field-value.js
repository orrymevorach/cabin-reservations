import { transformFields } from '../../../lib/airtable';
const Airtable = require('airtable');

// Airtable Config
const airtableBase = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
}).base(process.env.AIRTABLE_BASE);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { tableId, formulaArray } = req.body;
    const formula = formulaArray
      .map(({ fieldName, fieldValue }) => {
        return `{${fieldName}} = "${fieldValue}"`;
      })
      .join(', ');

    try {
      const records = [];
      await airtableBase(tableId)
        .select({
          filterByFormula: `AND(${formula})`,
        })
        .eachPage((pageRecords, fetchNextPage) => {
          records.push(...pageRecords);
          fetchNextPage();
        });

      const recordsWithIds = records.map(record => {
        const fields = transformFields({ record });
        return {
          id: record.getId(),
          ...fields,
        };
      });

      res.status(200).json({ records: recordsWithIds });
    } catch (err) {
      console.log('Error:', err);
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
