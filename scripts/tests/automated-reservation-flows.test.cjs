const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const {
  airtableRequest,
  getTestConfiguration,
  listAirtableRecords,
  resetAutomatedReservationFixtures,
  testEmailPrefix,
  testGroupPrefix,
} = require('./automated-reservations-test-utils.cjs');

const appUrl = process.env.AUTOMATED_TEST_BASE_URL;
const runId = Date.now().toString(36);
const temporaryPassword = 'Automated-Reservation-Test-Only';
let fixtureIndex = 0;
let testCabin;
let testYurt;

assert.equal(
  process.env.AUTOMATED_TEST_RESET_APPLIED,
  'true',
  'The automated test-base reset must be applied before tests start.',
);
assert.ok(appUrl, 'AUTOMATED_TEST_BASE_URL is required.');

function nextFixtureIdentity(label) {
  fixtureIndex += 1;
  const suffix = `${runId}-${fixtureIndex}-${label}`;
  return {
    name: `Reservations Automation ${suffix}`,
    emailAddress: `${testEmailPrefix}${suffix}@example.invalid`,
  };
}

async function createTicket({
  name,
  emailAddress,
  status,
  quantity,
  purchaser,
  cabinId,
  discountCode,
}) {
  const fields = {
    Name: name,
    'Email Address': emailAddress,
    'Temporary Password': temporaryPassword,
    Status: status,
  };
  if (quantity !== undefined) fields.Quantity = quantity;
  if (purchaser) fields.Purchaser = purchaser;
  if (cabinId) fields.Cabin = [cabinId];
  if (discountCode) fields.discountCode = discountCode;

  return airtableRequest({
    method: 'POST',
    table: 'Ticket Purchases',
    body: { fields, typecast: true },
  });
}

async function createHost({
  label,
  status,
  quantity,
  cabinId,
  discountCode,
  shouldCreateGroup = true,
}) {
  const identity = nextFixtureIdentity(label);
  const hostRecord = await createTicket({
    ...identity,
    status,
    quantity,
    cabinId,
    discountCode,
  });
  if (!shouldCreateGroup) {
    return { ...identity, id: hostRecord.id, groupId: null };
  }

  const groupName = `${testGroupPrefix}${runId} ${label}`;
  const groupRecord = await airtableRequest({
    method: 'POST',
    table: 'Groups',
    body: {
      fields: {
        'Group Name': groupName,
        Members: [hostRecord.id],
      },
      typecast: true,
    },
  });
  const refreshedHost = await airtableRequest({
    table: 'Ticket Purchases',
    recordId: hostRecord.id,
  });
  const groupIds = refreshedHost.fields.Group || [];

  assert.ok(
    groupIds.includes(groupRecord.id),
    'Creating the test group should establish the host-to-group link.',
  );

  return {
    ...identity,
    id: hostRecord.id,
    groupId: groupRecord.id,
    name: hostRecord.fields.Name,
  };
}

async function createAssignedTicket({ host, label, status }) {
  const identity = nextFixtureIdentity(label);
  const record = await createTicket({
    ...identity,
    status,
    purchaser: host.name,
  });
  return { ...identity, id: record.id };
}

async function createCabinGuestIdentity(label) {
  return nextFixtureIdentity(label);
}

// Airtable creates at most 10 records per request.
async function createGroupGuestTickets({ host, label, count }) {
  const guestIds = [];
  for (let index = 0; index < count; index += 10) {
    const batchSize = Math.min(10, count - index);
    const response = await airtableRequest({
      method: 'POST',
      table: 'Ticket Purchases',
      body: {
        records: Array.from({ length: batchSize }, (_, batchIndex) => {
          const identity = nextFixtureIdentity(`${label}-${index + batchIndex}`);
          return {
            fields: {
              Name: identity.name,
              'Email Address': identity.emailAddress,
              'Temporary Password': temporaryPassword,
              Status: 'Cabin Guest',
            },
          };
        }),
        typecast: true,
      },
    });
    guestIds.push(...response.records.map(({ id }) => id));
  }

  await airtableRequest({
    method: 'PATCH',
    table: 'Groups',
    recordId: host.groupId,
    body: { fields: { Members: [host.id, ...guestIds] }, typecast: true },
  });
  return guestIds;
}

async function createIncludedCabinGuest({ host, label, cabinId }) {
  const guest = await createCabinGuestIdentity(label);
  const response = await postJson('/api/platform/group', {
    action: 'create-cabin-guest',
    groupId: host.groupId,
    hostUserId: host.id,
    memberIds: await getGroupMemberIds(host),
    email: guest.emailAddress,
    firstName: 'Automation',
    lastName: label,
    cabinId,
  });
  return { guest, response };
}

async function postJson(pathname, body, { cookie } = {}) {
  const response = await fetch(`${appUrl}${pathname}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie && { Cookie: cookie }),
    },
    body: JSON.stringify(body),
  });
  const responseBody = await response.json().catch(() => null);
  return { status: response.status, body: responseBody };
}

async function addExistingTicketHolder({ host, guest, cabinId }) {
  return postJson('/api/platform/group', {
    action: 'add-existing-ticket-holder',
    groupId: host.groupId,
    hostUserId: host.id,
    memberIds: await getGroupMemberIds(host),
    email: guest.emailAddress,
    ...(cabinId && { cabinId }),
  });
}

async function assignPurchasedTicket({ host, label, cabinId }) {
  const guest = await createCabinGuestIdentity(label);
  const response = await postJson(
    '/api/platform/group',
    {
      action: 'assign-purchased-ticket',
      groupId: host.groupId,
      hostUserId: host.id,
      email: guest.emailAddress,
      firstName: 'Automation',
      lastName: label,
      ...(cabinId && { cabinId }),
    },
    { cookie: `user_record_id=${host.id}` },
  );
  return { guest, response };
}

async function getReservationData(hostId) {
  const response = await fetch(
    `${appUrl}/api/platform/user-reservation-data?userId=${encodeURIComponent(hostId)}`,
  );
  const body = await response.json();
  assert.equal(response.status, 200);
  return body;
}

async function getTicketRecord(recordId) {
  return airtableRequest({ table: 'Ticket Purchases', recordId });
}

async function getTicketByEmail(emailAddress) {
  const records = await listAirtableRecords('Ticket Purchases');
  return records.find(
    ({ fields = {} }) => fields['Email Address'] === emailAddress,
  );
}

async function chooseOpenCabin() {
  const cabinRecords = await listAirtableRecords('Cabins');
  const candidate = cabinRecords.find(({ fields = {} }) => {
    const cabinUnitName = Array.isArray(fields.Unit)
      ? fields.Unit[0]
      : fields.Unit;
    return (
      fields.Availability === 'Open' &&
      fields['Bed Configuration'] !== 'Head Staff' &&
      Number(fields['Open Beds']) >= 2 &&
      Number(fields['Total Beds']) > 3 &&
      (!fields['Front Bunk Left'] ||
        fields['Front Bunk Left'].length === 0) &&
      String(cabinUnitName || '').toLowerCase() !== 'yurtlands'
    );
  });

  assert.ok(candidate, 'The test base needs an open non-yurt cabin with two beds.');
  return candidate;
}

async function chooseOpenYurt() {
  const cabinRecords = await listAirtableRecords('Cabins');
  const candidate = cabinRecords.find(({ fields = {} }) => {
    const cabinUnitName = Array.isArray(fields.Unit)
      ? fields.Unit[0]
      : fields.Unit;
    return (
      fields.Availability === 'Open' &&
      String(cabinUnitName || '').toLowerCase() === 'yurtlands' &&
      Number(fields['Open Beds']) >= 2
    );
  });

  assert.ok(candidate, 'The test base needs an open Yurtlands yurt with two beds.');
  return candidate;
}

// Yurts hold the purchaser plus two included guests, so the Cabins "Total Beds" formula must give Yurtlands 3 beds.
async function chooseEmptyYurtForThreePeople({ excludedCabinId }) {
  const cabinRecords = await listAirtableRecords('Cabins');
  const candidate = cabinRecords.find(({ id, fields = {} }) => {
    const cabinUnitName = Array.isArray(fields.Unit)
      ? fields.Unit[0]
      : fields.Unit;
    return (
      id !== excludedCabinId &&
      fields.Availability === 'Open' &&
      String(cabinUnitName || '').toLowerCase() === 'yurtlands' &&
      Number(fields['Open Beds']) >= 3
    );
  });

  assert.ok(
    candidate,
    'The test base needs an open yurt with three beds. Update the Yurtlands value in the Cabins "Total Beds" formula to 3.',
  );
  return candidate;
}

async function getGroupMemberIds(host) {
  const group = await airtableRequest({
    table: 'Groups',
    recordId: host.groupId,
  });
  return group.fields.Members || [];
}

before(async () => {
  getTestConfiguration();
  [testCabin, testYurt] = await Promise.all([
    chooseOpenCabin(),
    chooseOpenYurt(),
  ]);
});

after(async () => {
  await resetAutomatedReservationFixtures();
});

test('browses the available cabin inventory', async () => {
  const response = await fetch(`${appUrl}/api/platform/cabins`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(body.cabins));
  assert.ok(body.cabins.some(({ id }) => id === testCabin.id));
});

test('adds an existing ticket holder to a cabin group and reserves their spot', async () => {
  const host = await createHost({
    label: 'cabin-owner',
    status: 'Cabin Purchased',
  });
  const guest = await createAssignedTicket({
    host,
    label: 'cabin-existing-ticket-holder',
    status: 'Ticket Purchased',
  });

  const response = await addExistingTicketHolder({
    host,
    guest,
    cabinId: testCabin.id,
  });

  assert.equal(response.status, 200);
  assert.ok((await getGroupMemberIds(host)).includes(guest.id));
  const guestRecord = await getTicketRecord(guest.id);
  assert.deepEqual(guestRecord.fields.Cabin, [testCabin.id]);
});

test('reserves a Yurtlands yurt for a Yurt ticket holder and allows their included cabin guest', async () => {
  const host = await createHost({
    label: 'yurt-holder',
    status: 'Yurt',
  });
  const guest = await createAssignedTicket({
    host,
    label: 'yurt-existing-ticket-holder',
    status: 'Ticket Purchased',
  });

  const reserveYurtResponse = await postJson(
    '/api/platform/reserve-cabin',
    {
      cabinId: testYurt.id,
      hostUserId: host.id,
      groupMemberIds: [host.id],
      selectedBeds: [],
    },
  );
  assert.equal(reserveYurtResponse.status, 200);
  assert.deepEqual((await getTicketRecord(host.id)).fields.Cabin, [testYurt.id]);

  const includedGuest = await createCabinGuestIdentity('yurt-included-guest');
  const createCabinGuestResponse = await postJson('/api/platform/group', {
    action: 'create-cabin-guest',
    groupId: host.groupId,
    hostUserId: host.id,
    memberIds: [host.id],
    email: includedGuest.emailAddress,
    firstName: 'Automation',
    lastName: 'YurtGuest',
    cabinId: testYurt.id,
  });
  assert.equal(createCabinGuestResponse.status, 200);
  const createdCabinGuest = await getTicketByEmail(includedGuest.emailAddress);
  assert.equal(createdCabinGuest.fields.Status, 'Cabin Guest');
  assert.deepEqual(createdCabinGuest.fields.Cabin, [testYurt.id]);
  assert.ok((await getGroupMemberIds(host)).includes(createdCabinGuest.id));
  assert.equal(
    (await getReservationData(host.id)).user.remainingPurchasedTicketCount,
    0,
  );

  const { guest: unpurchasedGuest, response: purchasedAssignmentResponse } =
    await assignPurchasedTicket({
      host,
      label: 'yurt-no-multi-ticket-quantity',
    });
  assert.equal(purchasedAssignmentResponse.status, 422);
  assert.match(
    purchasedAssignmentResponse.body.message,
    /no unassigned purchased tickets/i,
  );
  assert.equal(
    await getTicketByEmail(unpurchasedGuest.emailAddress),
    undefined,
  );

  const addResponse = await addExistingTicketHolder({ host, guest });
  assert.equal(addResponse.status, 200);
  assert.ok((await getGroupMemberIds(host)).includes(guest.id));
  assert.ok((await getGroupMemberIds(host)).includes(createdCabinGuest.id));

  const reserveStandardCabinResponse = await postJson(
    '/api/platform/reserve-cabin',
    {
      cabinId: testCabin.id,
      hostUserId: host.id,
      groupMemberIds: [host.id, guest.id],
      selectedBeds: [],
    },
  );
  assert.equal(reserveStandardCabinResponse.status, 422);
  assert.match(
    reserveStandardCabinResponse.body.message,
    /only reserve a yurt in yurtlands/i,
  );
});

test('creates a cabin guest without a ticket and rejects creating one for an existing ticket holder', async () => {
  const host = await createHost({
    label: 'cabin-free-guest-host',
    status: 'Cabin Purchased',
    cabinId: testCabin.id,
  });
  const freeGuest = await createCabinGuestIdentity('cabin-no-ticket-guest');
  const createResponse = await postJson('/api/platform/group', {
    action: 'create-cabin-guest',
    groupId: host.groupId,
    hostUserId: host.id,
    memberIds: [host.id],
    email: freeGuest.emailAddress,
    firstName: 'Automation',
    lastName: 'CabinGuest',
    cabinId: testCabin.id,
  });

  assert.equal(createResponse.status, 200);
  assert.ok(
    createResponse.body.group.members.some(
      ({ emailAddress }) => emailAddress === freeGuest.emailAddress,
    ),
  );
  const createdGuest = await getTicketByEmail(freeGuest.emailAddress);
  assert.equal(createdGuest.fields.Status, 'Cabin Guest');
  assert.deepEqual(createdGuest.fields.Cabin, [testCabin.id]);
  assert.equal(createdGuest.fields.discountCode, undefined);

  const ticketedGuest = await createAssignedTicket({
    host,
    label: 'cabin-ticketed-existing-user',
    status: 'Ticket Purchased',
  });
  const rejectResponse = await postJson('/api/platform/group', {
    action: 'create-cabin-guest',
    groupId: host.groupId,
    hostUserId: host.id,
    memberIds: [host.id],
    email: ticketedGuest.emailAddress,
    firstName: 'Automation',
    lastName: 'AlreadyTicketed',
    cabinId: testCabin.id,
  });

  assert.equal(rejectResponse.status, 422);
  assert.match(rejectResponse.body.message, /already have a ticket/i);
  assert.equal(await getGroupMemberIds(host).then(ids => ids.includes(ticketedGuest.id)), false);
});

test('adds an already-assigned multi-ticket guest, claims a blank paid placeholder, and blocks over-allocation', async () => {
  const host = await createHost({
    label: 'multi-ticket-placeholder-host',
    status: 'Ticket Purchased',
    quantity: 3,
    discountCode: 'AUTOMATED HOST CODE',
  });
  const alreadyAssignedGuest = await createAssignedTicket({
    host,
    label: 'multi-ticket-already-assigned',
    status: 'Ticket Purchased',
  });
  const addResponse = await addExistingTicketHolder({
    host,
    guest: alreadyAssignedGuest,
  });
  assert.equal(addResponse.status, 200);

  const placeholder = await createTicket({
    name: host.name,
    emailAddress: host.emailAddress,
    status: 'Ticket Purchased',
    purchaser: host.name,
    discountCode: 'AUTOMATED PLACEHOLDER CODE',
  });
  const beforeAssignment = await getReservationData(host.id);
  assert.equal(beforeAssignment.user.remainingPurchasedTicketCount, 1);

  const { guest, response } = await assignPurchasedTicket({
    host,
    label: 'multi-ticket-placeholder-claim',
  });
  assert.equal(response.status, 200);
  assert.equal(response.body.remainingPurchasedTicketCount, 0);

  const claimedTicket = await getTicketRecord(placeholder.id);
  assert.equal(claimedTicket.fields['Email Address'], guest.emailAddress);
  assert.equal(claimedTicket.fields.Purchaser, host.name);
  assert.equal(claimedTicket.fields.Status, 'Ticket Purchased');
  // The claimed ticket was paid for in its own order, so it keeps that order's code.
  assert.equal(claimedTicket.fields.discountCode, 'AUTOMATED PLACEHOLDER CODE');
  assert.equal(await getTicketByEmail(guest.emailAddress).then(({ id }) => id), placeholder.id);

  const { response: overAllocationResponse } = await assignPurchasedTicket({
    host,
    label: 'multi-ticket-over-allocation',
  });
  assert.equal(overAllocationResponse.status, 422);
  assert.match(
    overAllocationResponse.body.message,
    /no unassigned purchased tickets/i,
  );
});

test('adds an assigned bundle guest, assigns an unused bundle slot, and blocks over-allocation', async () => {
  const host = await createHost({
    label: 'bundle-host',
    status: 'Ticket Bundle',
    quantity: 3,
    discountCode: 'AUTOMATED BUNDLE CODE',
  });
  const alreadyAssignedGuest = await createAssignedTicket({
    host,
    label: 'bundle-already-assigned',
    status: 'Bundle Guest',
  });

  const beforeAssignment = await getReservationData(host.id);
  assert.equal(beforeAssignment.user.remainingPurchasedTicketCount, 1);

  const addResponse = await addExistingTicketHolder({
    host,
    guest: alreadyAssignedGuest,
  });
  assert.equal(addResponse.status, 200);

  const { guest, response } = await assignPurchasedTicket({
    host,
    label: 'bundle-unassigned-slot',
  });
  assert.equal(response.status, 200);
  assert.equal(response.body.remainingPurchasedTicketCount, 0);

  const assignedBundleGuest = await getTicketByEmail(guest.emailAddress);
  assert.equal(assignedBundleGuest.fields.Status, 'Bundle Guest');
  assert.equal(assignedBundleGuest.fields.Purchaser, host.name);
  assert.equal(assignedBundleGuest.fields.discountCode, 'AUTOMATED BUNDLE CODE');

  const { response: overAllocationResponse } = await assignPurchasedTicket({
    host,
    label: 'bundle-over-allocation',
  });
  assert.equal(overAllocationResponse.status, 422);
  assert.match(
    overAllocationResponse.body.message,
    /no unassigned purchased tickets/i,
  );
});

test('assigns a new multi-ticket guest when no guest ticket has been assigned yet', async () => {
  const host = await createHost({
    label: 'multi-ticket-unassigned-host',
    status: 'Ticket Purchased',
    quantity: 2,
    discountCode: 'AUTOMATED MULTI TICKET CODE',
  });
  const { guest, response } = await assignPurchasedTicket({
    host,
    label: 'multi-ticket-new-guest',
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.remainingPurchasedTicketCount, 0);
  const assignedGuest = await getTicketByEmail(guest.emailAddress);
  assert.equal(assignedGuest.fields.Status, 'Ticket Purchased');
  assert.equal(assignedGuest.fields.Purchaser, host.name);
  assert.equal(
    assignedGuest.fields.discountCode,
    'AUTOMATED MULTI TICKET CODE',
  );
});

test('rejects purchased-ticket assignment when the purchaser has no remaining slots', async () => {
  const host = await createHost({
    label: 'purchased-ticket-limit-host',
    status: 'Ticket Purchased',
    quantity: 2,
  });
  await createAssignedTicket({
    host,
    label: 'purchased-ticket-limit-used',
    status: 'Ticket Purchased',
  });
  const allocation = await getReservationData(host.id);
  assert.equal(allocation.user.remainingPurchasedTicketCount, 0);

  const { guest, response } = await assignPurchasedTicket({
    host,
    label: 'purchased-ticket-limit-rejected',
  });
  assert.equal(response.status, 422);
  assert.match(
    response.body.message,
    /no unassigned purchased tickets/i,
  );
  assert.equal(await getTicketByEmail(guest.emailAddress), undefined);
});

test('reserves an open cabin, selects a bed, submits check-in, and accepts the waiver', async () => {
  const host = await createHost({
    label: 'reservation-check-in-host',
    status: 'Cabin Purchased',
  });
  const guest = await createAssignedTicket({
    host,
    label: 'reservation-check-in-guest',
    status: 'Ticket Purchased',
  });
  const group = await airtableRequest({
    method: 'PATCH',
    table: 'Groups',
    recordId: host.groupId,
    body: {
      fields: { Members: [host.id, guest.id] },
      typecast: true,
    },
  });
  assert.deepEqual(group.fields.Members, [host.id, guest.id]);

  const reserveResponse = await postJson('/api/platform/reserve-cabin', {
    cabinId: testCabin.id,
    hostUserId: host.id,
    groupMemberIds: [host.id, guest.id],
    selectedBeds: [],
  });
  assert.equal(reserveResponse.status, 200);
  assert.deepEqual((await getTicketRecord(host.id)).fields.Cabin, [testCabin.id]);
  assert.deepEqual((await getTicketRecord(guest.id)).fields.Cabin, [testCabin.id]);
  for (const productId of testCabin.fields['Product Inventory'] || []) {
    const cabinProduct = await airtableRequest({
      table: 'Product Inventory',
      recordId: productId,
    });
    assert.equal(cabinProduct.fields.Status, 'Reserved');
  }

  const bedResponse = await postJson('/api/platform/reserve-bed', {
    cabinId: testCabin.id,
    reservingAttendeeId: host.id,
    beds: [{ userId: guest.id, bedName: 'frontBunkLeft' }],
  });
  assert.equal(bedResponse.status, 200);
  const updatedCabin = await airtableRequest({
    table: 'Cabins',
    recordId: testCabin.id,
  });
  assert.ok(
    (updatedCabin.fields['Front Bunk Left'] || []).includes(guest.id),
  );

  const checkInResponse = await postJson('/api/platform/create-check-in', {
    tableId: 'Check In',
    newFields: { Attendee: [guest.id] },
  });
  assert.equal(checkInResponse.status, 200);
  assert.ok(checkInResponse.body.record.id);

  const waiverResponse = await postJson('/api/airtable/update-record', {
    tableId: 'Check In',
    recordId: checkInResponse.body.record.id,
    newFields: {
      'Waiver Accepted': true,
      'Waiver Accepted Date': new Date().toISOString(),
    },
  });
  assert.equal(waiverResponse.status, 200);
  assert.equal(waiverResponse.body.record.waiverAccepted, true);
});

test('keeps one saved group when the reserve page omits members or a stale page sends no group', async () => {
  const host = await createHost({
    label: 'saved-group-host',
    status: 'Cabin Purchased',
    shouldCreateGroup: false,
  });
  const [firstGuest, secondGuest, thirdGuest] = await Promise.all(
    ['saved-group-guest-1', 'saved-group-guest-2', 'saved-group-guest-3'].map(
      label =>
        createAssignedTicket({ host, label, status: 'Ticket Purchased' }),
    ),
  );

  const firstResponse = await postJson('/api/platform/group', {
    action: 'add-existing-ticket-holder',
    groupId: null,
    hostUserId: host.id,
    email: firstGuest.emailAddress,
  });
  assert.equal(firstResponse.status, 200, JSON.stringify(firstResponse.body));
  const savedGroupId = firstResponse.body.group.id;

  // The reserve page sends the group without its member list; this used to replace the saved members with only the new guest.
  const secondResponse = await postJson('/api/platform/group', {
    action: 'add-existing-ticket-holder',
    groupId: savedGroupId,
    hostUserId: host.id,
    email: secondGuest.emailAddress,
  });
  assert.equal(secondResponse.status, 200, JSON.stringify(secondResponse.body));

  // A page loaded before the group existed still sends no group; this used to create a second group for the host.
  const staleResponse = await postJson('/api/platform/group', {
    action: 'add-existing-ticket-holder',
    groupId: null,
    hostUserId: host.id,
    memberIds: [],
    email: thirdGuest.emailAddress,
  });
  assert.equal(staleResponse.status, 200, JSON.stringify(staleResponse.body));
  assert.equal(staleResponse.body.group.id, savedGroupId);

  const savedMemberIds = await getGroupMemberIds({
    ...host,
    groupId: savedGroupId,
  });
  assert.deepEqual(
    [...savedMemberIds].sort(),
    [host.id, firstGuest.id, secondGuest.id, thirdGuest.id].sort(),
  );
  assert.deepEqual((await getTicketRecord(host.id)).fields.Group, [
    savedGroupId,
  ]);
});

test('removes a group member without deleting their purchased ticket', async () => {
  const host = await createHost({
    label: 'group-removal-host',
    status: 'Cabin Purchased',
  });
  const guest = await createAssignedTicket({
    host,
    label: 'group-removal-guest',
    status: 'Ticket Purchased',
  });
  const addResponse = await addExistingTicketHolder({ host, guest });
  assert.equal(addResponse.status, 200);

  const removeResponse = await postJson('/api/platform/group', {
    action: 'remove-group-member',
    groupId: host.groupId,
    memberIds: [host.id, guest.id],
    removeUserId: guest.id,
  });

  assert.equal(removeResponse.status, 200);
  assert.deepEqual(await getGroupMemberIds(host), [host.id]);
  assert.equal((await getTicketRecord(guest.id)).fields.Status, 'Ticket Purchased');
});

test('lets a Yurt holder add two included guests with the purchaser discount code and blocks a third', async () => {
  const yurtForThreePeople = await chooseEmptyYurtForThreePeople({
    excludedCabinId: testYurt.id,
  });
  const host = await createHost({
    label: 'yurt-allowance-host',
    status: 'Yurt',
    discountCode: 'AUTOMATED YURT CODE',
  });
  const reserveResponse = await postJson('/api/platform/reserve-cabin', {
    cabinId: yurtForThreePeople.id,
    hostUserId: host.id,
    groupMemberIds: [host.id],
    selectedBeds: [],
  });
  assert.equal(reserveResponse.status, 200);

  for (const label of ['yurt-allowance-guest-1', 'yurt-allowance-guest-2']) {
    const { guest, response } = await createIncludedCabinGuest({
      host,
      label,
      cabinId: yurtForThreePeople.id,
    });
    assert.equal(response.status, 200, JSON.stringify(response.body));
    const createdGuest = await getTicketByEmail(guest.emailAddress);
    assert.equal(createdGuest.fields.Status, 'Cabin Guest');
    assert.deepEqual(createdGuest.fields.Cabin, [yurtForThreePeople.id]);
    assert.equal(createdGuest.fields.discountCode, 'AUTOMATED YURT CODE');
  }
  assert.equal((await getGroupMemberIds(host)).length, 3);

  const { guest: extraGuest, response: extraGuestResponse } =
    await createIncludedCabinGuest({
      host,
      label: 'yurt-allowance-guest-3',
      cabinId: yurtForThreePeople.id,
    });
  assert.equal(extraGuestResponse.status, 422);
  assert.match(
    extraGuestResponse.body.message,
    /added all of the guests included/i,
  );
  assert.equal(await getTicketByEmail(extraGuest.emailAddress), undefined);
});

test('blocks a 15th included cabin guest using the saved group, not the member list sent by the browser', async () => {
  const host = await createHost({
    label: 'cabin-allowance-host',
    status: 'Cabin Purchased',
    cabinId: testCabin.id,
  });
  await createGroupGuestTickets({
    host,
    label: 'cabin-allowance-existing-guest',
    count: 14,
  });

  const extraGuest = await createCabinGuestIdentity('cabin-allowance-extra');
  const response = await postJson('/api/platform/group', {
    action: 'create-cabin-guest',
    groupId: host.groupId,
    hostUserId: host.id,
    memberIds: [host.id],
    email: extraGuest.emailAddress,
    firstName: 'Automation',
    lastName: 'CabinAllowanceExtra',
    cabinId: testCabin.id,
  });

  assert.equal(response.status, 422);
  assert.match(response.body.message, /added all of the guests included/i);
  assert.equal(await getTicketByEmail(extraGuest.emailAddress), undefined);
  assert.equal((await getGroupMemberIds(host)).length, 15);
});

test('rejects a purchaser adding their own ticket, with or without a saved group', async () => {
  const hostWithGroup = await createHost({
    label: 'own-ticket-group-host',
    status: 'Cabin Purchased',
  });
  const groupResponse = await addExistingTicketHolder({
    host: hostWithGroup,
    guest: hostWithGroup,
  });
  assert.equal(groupResponse.status, 422);
  assert.match(groupResponse.body.message, /your own ticket/i);
  assert.deepEqual(await getGroupMemberIds(hostWithGroup), [hostWithGroup.id]);

  // Without this check Airtable rejected a new group listing the purchaser twice and the request crashed.
  const hostWithoutGroup = await createHost({
    label: 'own-ticket-no-group-host',
    status: 'Yurt',
    shouldCreateGroup: false,
  });
  const noGroupResponse = await postJson('/api/platform/group', {
    action: 'add-existing-ticket-holder',
    groupId: null,
    hostUserId: hostWithoutGroup.id,
    memberIds: [],
    email: hostWithoutGroup.emailAddress,
  });
  assert.equal(noGroupResponse.status, 422);
  assert.match(noGroupResponse.body.message, /your own ticket/i);
  assert.equal(
    (await getTicketRecord(hostWithoutGroup.id)).fields.Group,
    undefined,
  );
});

test('rejects adding guests for an archived ticket with a guest-facing message', async () => {
  const host = await createHost({
    label: 'archived-host',
    status: 'Archived',
  });
  const guest = await createAssignedTicket({
    host,
    label: 'archived-host-guest',
    status: 'Ticket Purchased',
  });

  const response = await addExistingTicketHolder({ host, guest });

  assert.equal(response.status, 410);
  assert.match(response.body.message, /no longer valid/i);
  assert.deepEqual(await getGroupMemberIds(host), [host.id]);
});

test('loads the summary page for a signed-in purchaser and sends an archived ticket back to login', async () => {
  const host = await createHost({
    label: 'summary-page-host',
    status: 'Cabin Purchased',
    cabinId: testCabin.id,
  });
  const summaryResponse = await fetch(`${appUrl}/summary`, {
    headers: { Cookie: `user_record_id=${host.id}` },
    redirect: 'manual',
  });
  assert.equal(summaryResponse.status, 200);
  assert.match(await summaryResponse.text(), new RegExp(host.name));

  const archivedHost = await createHost({
    label: 'summary-page-archived-host',
    status: 'Archived',
    shouldCreateGroup: false,
  });
  const archivedResponse = await fetch(`${appUrl}/summary`, {
    headers: { Cookie: `user_record_id=${archivedHost.id}` },
    redirect: 'manual',
  });
  assert.equal(archivedResponse.status, 307);
  assert.equal(archivedResponse.headers.get('location'), '/');
  assert.match(
    archivedResponse.headers.get('set-cookie') || '',
    /user_record_id=;/,
  );
});
