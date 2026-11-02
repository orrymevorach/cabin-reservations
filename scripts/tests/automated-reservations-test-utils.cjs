const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..', '..');
const envFilePath = path.join(projectRoot, '.env.local');
const expectedBaseId = 'appFe9v1pu6BLVxeD';
const testEmailPrefix = 'reservations-automation+';
const testGroupPrefix = 'AUTOMATED TEST RESERVATION ';
const cabinBedFields = [
  'Front Bunk Left',
  'Back Bunk Left',
  'Front Cot Left',
  'Back Cot Left',
  'Front Loft Left',
  'Back Loft Left',
  'Front Bunk Right',
  'Back Bunk Right',
  'Front Cot Right',
  'Back Cot Right',
  'Front Loft Right',
  'Back Loft Right',
];

function readLocalEnvironment() {
  const contents = fs.readFileSync(envFilePath, 'utf8');
  const environment = {};

  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;

    let value = match[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, '');
    }

    environment[match[1]] = value;
  }

  return environment;
}

function getTestConfiguration() {
  const localEnvironment = readLocalEnvironment();
  const baseId = localEnvironment.AIRTABLE_BASE_AUTOMATED_TESTING;
  const personalAccessToken =
    localEnvironment.AIRTABLE_PERSONAL_ACCESS_TOKEN;

  if (baseId !== expectedBaseId) {
    throw new Error(
      'AIRTABLE_BASE_AUTOMATED_TESTING must match the approved duplicated base.',
    );
  }
  if (!personalAccessToken) {
    throw new Error(
      'AIRTABLE_PERSONAL_ACCESS_TOKEN is required for automated reservations tests.',
    );
  }

  return { baseId, personalAccessToken };
}

async function airtableRequest({ method = 'GET', table, recordId, body, query }) {
  const { baseId, personalAccessToken } = getTestConfiguration();
  const tablePath = encodeURIComponent(table);
  const recordPath = recordId ? `/${encodeURIComponent(recordId)}` : '';
  const requestUrl = new URL(
    `https://api.airtable.com/v0/${baseId}/${tablePath}${recordPath}`,
  );
  if (query) {
    for (const [key, value] of query.entries()) {
      requestUrl.searchParams.append(key, value);
    }
  }

  const response = await fetch(requestUrl, {
    method,
    headers: {
      Authorization: `Bearer ${personalAccessToken}`,
      ...(body && { 'Content-Type': 'application/json' }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });
  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    const errorType = responseBody?.error?.type || 'Airtable request failed';
    throw new Error(`${method} ${table} returned ${response.status}: ${errorType}`);
  }

  return responseBody;
}

async function listAirtableRecords(table) {
  const records = [];
  let offset;

  do {
    const query = new URLSearchParams({ pageSize: '100' });
    if (offset) query.set('offset', offset);

    const response = await airtableRequest({ table, query });
    records.push(...(response.records || []));
    offset = response.offset;
  } while (offset);

  return records;
}

async function deleteAirtableRecords(table, recordIds) {
  for (let index = 0; index < recordIds.length; index += 10) {
    const batch = recordIds.slice(index, index + 10);
    const query = new URLSearchParams();
    for (const recordId of batch) query.append('records[]', recordId);
    await airtableRequest({ method: 'DELETE', table, query });
  }
}

async function resetAutomatedReservationFixtures() {
  const ticketRecords = await listAirtableRecords('Ticket Purchases');
  const testTicketRecords = ticketRecords.filter(({ fields = {} }) => {
    const emailAddress = String(fields['Email Address'] || '').toLowerCase();
    return (
      emailAddress.startsWith(testEmailPrefix) &&
      emailAddress.endsWith('@example.invalid')
    );
  });
  const testTicketRecordIds = new Set(testTicketRecords.map(({ id }) => id));

  const [checkInRecords, groupRecords] = await Promise.all([
    listAirtableRecords('Check In'),
    listAirtableRecords('Groups'),
  ]);
  const testCheckInRecordIds = checkInRecords
    .filter(({ fields = {} }) =>
      (fields.Attendee || []).some(attendeeId =>
        testTicketRecordIds.has(attendeeId),
      ),
    )
    .map(({ id }) => id);
  // Groups created through the API are named after the test host, so also remove groups made up only of test tickets.
  const isTestGroup = ({ fields = {} }) => {
    const memberIds = fields.Members || [];
    return (
      String(fields['Group Name'] || '').startsWith(testGroupPrefix) ||
      (memberIds.length > 0 &&
        memberIds.every(memberId => testTicketRecordIds.has(memberId)))
    );
  };
  const testGroupRecordIds = groupRecords
    .filter(isTestGroup)
    .map(({ id }) => id);

  await deleteAirtableRecords('Check In', testCheckInRecordIds);
  await deleteAirtableRecords('Groups', testGroupRecordIds);
  await deleteAirtableRecords(
    'Ticket Purchases',
    [...testTicketRecordIds],
  );

  const [remainingTickets, remainingCheckIns, remainingGroups] =
    await Promise.all([
      listAirtableRecords('Ticket Purchases'),
      listAirtableRecords('Check In'),
      listAirtableRecords('Groups'),
    ]);
  const hasRemainingTestTicket = remainingTickets.some(({ fields = {} }) => {
    const emailAddress = String(fields['Email Address'] || '').toLowerCase();
    return (
      emailAddress.startsWith(testEmailPrefix) &&
      emailAddress.endsWith('@example.invalid')
    );
  });
  const hasRemainingTestCheckIn = remainingCheckIns.some(({ fields = {} }) =>
    (fields.Attendee || []).some(attendeeId =>
      testTicketRecordIds.has(attendeeId),
    ),
  );
  const testGroupRecordIdSet = new Set(testGroupRecordIds);
  const hasRemainingTestGroup = remainingGroups.some(
    group =>
      testGroupRecordIdSet.has(group.id) ||
      String(group.fields?.['Group Name'] || '').startsWith(testGroupPrefix),
  );

  if (hasRemainingTestTicket || hasRemainingTestCheckIn || hasRemainingTestGroup) {
    throw new Error('Automated reservation fixture reset did not complete.');
  }

  return {
    ticketRecordsRemoved: testTicketRecordIds.size,
    checkInRecordsRemoved: testCheckInRecordIds.length,
    groupRecordsRemoved: testGroupRecordIds.length,
  };
}

async function captureTestBaseBaseline() {
  const tables = ['Ticket Purchases', 'Cabins', 'Groups', 'Check In'];
  const tableRecords = await Promise.all(
    tables.map(async table => {
      const records = await listAirtableRecords(table);
      records.sort((firstRecord, secondRecord) =>
        firstRecord.id.localeCompare(secondRecord.id),
      );
      return [
        table,
        new Map(
          records.map(({ id, fields }) => [
            id,
            JSON.parse(JSON.stringify(fields)),
          ]),
        ),
      ];
    }),
  );

  return new Map(tableRecords);
}

function getChangedBaselineFields({ originalFields, currentFields }) {
  const fieldNames = new Set([
    ...Object.keys(originalFields),
    ...Object.keys(currentFields),
  ]);
  return [...fieldNames]
    .filter(fieldName => {
      const originalValue = JSON.stringify(originalFields[fieldName]);
      const currentValue = JSON.stringify(currentFields[fieldName]);
      return originalValue !== currentValue;
    })
    .sort();
}

function compareTestBaseBaselines({ originalBaseline, currentBaseline }) {
  const differences = [];
  for (const [table, originalRecords] of originalBaseline) {
    const currentRecords = currentBaseline.get(table);
    const recordIds = new Set([
      ...originalRecords.keys(),
      ...currentRecords.keys(),
    ]);

    for (const recordId of recordIds) {
      const originalFields = originalRecords.get(recordId);
      const currentFields = currentRecords.get(recordId);
      if (!originalFields || !currentFields) {
        differences.push({
          table,
          recordId,
          change: originalFields ? 'record-missing' : 'record-added',
        });
        continue;
      }

      const changedFields = getChangedBaselineFields({
        originalFields,
        currentFields,
      });
      if (changedFields.length) {
        differences.push({ table, recordId, changedFields });
      }
    }
  }

  return differences;
}

async function restoreCabinBedSelections({ originalBaseline }) {
  const originalCabins = originalBaseline.get('Cabins');
  const currentCabins = await listAirtableRecords('Cabins');

  for (const cabinRecord of currentCabins) {
    const originalFields = originalCabins.get(cabinRecord.id);
    if (!originalFields) continue;

    const fieldsToRestore = {};
    for (const fieldName of cabinBedFields) {
      const originalValue = originalFields[fieldName] || [];
      const currentValue = cabinRecord.fields[fieldName] || [];
      if (JSON.stringify(originalValue) !== JSON.stringify(currentValue)) {
        fieldsToRestore[fieldName] = originalValue;
      }
    }

    if (Object.keys(fieldsToRestore).length) {
      await airtableRequest({
        method: 'PATCH',
        table: 'Cabins',
        recordId: cabinRecord.id,
        body: { fields: fieldsToRestore, typecast: true },
      });
    }
  }
}

module.exports = {
  airtableRequest,
  captureTestBaseBaseline,
  compareTestBaseBaselines,
  expectedBaseId,
  getTestConfiguration,
  listAirtableRecords,
  restoreCabinBedSelections,
  projectRoot,
  resetAutomatedReservationFixtures,
  testEmailPrefix,
  testGroupPrefix,
};
