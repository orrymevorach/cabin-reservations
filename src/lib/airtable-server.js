import Airtable from 'airtable';
import { transformFields } from '@/lib/airtable';

// Server-only Airtable access for the shared helpers in lib/airtable.js. Each function mirrors one
// /api/airtable route and returns the same record shape, so callers see the same data either way.
const airtableBase = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
}).base(process.env.AIRTABLE_BASE);

const toRecordWithId = record => ({
  ...transformFields({ record }),
  id: record.id,
});

export async function createAirtableRecord({ tableId, newFields }) {
  const [record] = await airtableBase(tableId).create([
    { fields: { ...newFields } },
  ]);
  return toRecordWithId(record);
}

export async function getAirtableRecords({ tableId, view }) {
  const records = await airtableBase(tableId).select({ view }).all();
  return records.map(record => transformFields({ record }));
}

export async function getAirtableRecordsByFieldValue({
  tableId,
  formulaArray,
}) {
  const formula = formulaArray
    .map(({ fieldName, fieldValue }) => {
      const escapedFieldValue = String(fieldValue ?? '')
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"');
      return `{${fieldName}} = "${escapedFieldValue}"`;
    })
    .join(', ');

  const records = await airtableBase(tableId)
    .select({ filterByFormula: `AND(${formula})` })
    .all();
  return records.map(toRecordWithId);
}

// Returns the last record whose field exactly matches the value, or {} when none match.
export async function getAirtableRecord({ tableId, field, fieldValue }) {
  const records = await airtableBase(tableId).select().all();
  const matchingRecords = records.filter(
    record => record.fields[field] === fieldValue,
  );
  const matchingRecord = matchingRecords[matchingRecords.length - 1];
  return matchingRecord ? toRecordWithId(matchingRecord) : {};
}

export async function getAirtableRecordById({ tableId, recordId }) {
  const record = await airtableBase(tableId).find(recordId);
  return toRecordWithId(record);
}

export async function updateAirtableRecord({ tableId, recordId, newFields }) {
  const [record] = await airtableBase(tableId).update([
    { id: recordId, fields: { ...newFields } },
  ]);
  return toRecordWithId(record);
}
