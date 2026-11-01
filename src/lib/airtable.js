import {
  generateRandomPassword,
  isObjectEmpty,
  toCamelCase,
} from '@/utils/string-utils';
import { BEDS, AIRTABLE_BASES, COOKIES, ROUTES } from '@/utils/constants';
import Cookies from 'cookies';
import { logSentryApiError, logSentryError } from '@/utils/sentry-utils';
import { ticketLookupErrorMessage } from '@/utils/api-error-utils';
import { throwIfReservationTicketIsInvalid, isInactiveTicketStatus } from '@/utils/ticket-utils';

const isServer = () => typeof window === 'undefined';

// Server code (API routes and server-rendered pages) queries Airtable directly instead of sending an
// HTTP request back to this site's /api/airtable routes. That round trip started a second serverless
// function for every lookup and failed with "fetch failed" when Netlify closed the reused connection.
// The typeof check stays inline so browser bundles leave out the server module and the Airtable token.
const loadAirtableServer = () =>
  typeof window === 'undefined' ? import('@/lib/airtable-server') : null;

// Report a failed server request to Sentry and return { message }, the same result shape the browser
// gets from a failed /api/airtable route, so callers handle both failures the same way.
async function runServerAirtableRequest({ action, extra, request }) {
  try {
    const airtableServer = await loadAirtableServer();
    return await request(airtableServer);
  } catch (error) {
    await logSentryApiError({ error, action, extra });
    return { message: error?.message || 'Unable to reach Airtable.' };
  }
}

export const createRecord = async ({
  tableId,
  newFields,
  endpoint = '/create-record',
}) => {
  if (isServer()) {
    return runServerAirtableRequest({
      action: 'airtable-create-record',
      extra: { tableId },
      request: async ({ createAirtableRecord }) => ({
        record: await createAirtableRecord({ tableId, newFields }),
      }),
    });
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ENV_URL}/api/airtable${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableId, newFields }),
      },
    ).then(res => res.json());
    return response;
  } catch (error) {
    logSentryError(error, { action: 'airtable-create-record-request' });
    return { message: error.message || 'Unable to create Airtable record.' };
  }
};

export async function getRecords({
  tableId,
  endpoint = '/get-records',
  view = 'Grid view',
}) {
  if (isServer()) {
    return runServerAirtableRequest({
      action: 'airtable-get-records',
      extra: { tableId, view },
      request: async ({ getAirtableRecords }) => ({
        records: await getAirtableRecords({ tableId, view }),
      }),
    });
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ENV_URL}/api/airtable${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableId, view }),
      },
    ).then(res => res.json());
    return response;
  } catch (error) {
    logSentryError(error, { action: 'airtable-get-records-request' });
  }
}

export async function getRecordsByFieldValue({
  tableId,
  endpoint = '/get-records-by-field-value',
  formulaArray,
}) {
  if (isServer()) {
    return runServerAirtableRequest({
      action: 'airtable-get-records-by-field-value',
      extra: {
        tableId,
        fieldNames: formulaArray?.map(({ fieldName }) => fieldName),
      },
      request: async ({ getAirtableRecordsByFieldValue }) => ({
        records: await getAirtableRecordsByFieldValue({
          tableId,
          formulaArray,
        }),
      }),
    });
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ENV_URL}/api/airtable${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableId, formulaArray }),
      },
    ).then(res => res.json());
    return response;
  } catch (error) {
    logSentryError(error, { action: 'airtable-get-records-by-field-value-request' });
  }
}

export async function getRecord({
  tableId,
  field,
  fieldValue,
  endpoint = '/get-record',
}) {
  if (isServer()) {
    return runServerAirtableRequest({
      action: 'airtable-get-record',
      extra: { tableId, field },
      request: async ({ getAirtableRecord }) => ({
        record: await getAirtableRecord({ tableId, field, fieldValue }),
      }),
    });
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ENV_URL}/api/airtable${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableId, field, fieldValue }),
      },
    ).then(res => res.json());
    return response;
  } catch (error) {
    logSentryError(error, { action: 'airtable-get-record-request' });
  }
}

export async function getRecordById({
  tableId,
  recordId,
  endpoint = '/get-record-by-id',
}) {
  // Skip the Airtable request when a caller has no record ID (for example, a
  // guest with no linked ticket), and report it with the table and endpoint so
  // the calling code can be found in Sentry.
  if (!recordId) {
    logSentryError(new Error(`Missing Airtable record ID for ${tableId}`), {
      action: 'airtable-get-record-by-id-request',
      tableId,
      endpoint,
    });
    return { record: null };
  }
  if (isServer()) {
    return runServerAirtableRequest({
      action: 'airtable-get-record-by-id',
      extra: { tableId, recordId },
      request: async ({ getAirtableRecordById }) => ({
        record: await getAirtableRecordById({ tableId, recordId }),
      }),
    });
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ENV_URL}/api/airtable${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableId, recordId }),
      },
    ).then(res => res.json());
    return response;
  } catch (error) {
    logSentryError(error, { action: 'airtable-get-record-by-id-request' });
    return { record: null };
  }
}

export const updateRecord = async ({
  tableId,
  recordId,
  newFields,
  endpoint = '/update-record',
}) => {
  if (isServer()) {
    return runServerAirtableRequest({
      action: 'airtable-update-record',
      extra: { tableId, recordId },
      request: async ({ updateAirtableRecord }) => ({
        record: await updateAirtableRecord({ tableId, recordId, newFields }),
      }),
    });
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ENV_URL}/api/airtable${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableId, newFields, recordId }),
      },
    ).then(res => res.json());
    return response;
  } catch (error) {
    logSentryError(error, { action: 'airtable-update-record-request' });
    return { message: error.message || 'Unable to update Airtable record.' };
  }
};

export const transformFields = ({ record }) => {
  let transformedFieldsObj = {};
  const entries = Object.entries(record.fields);
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    const transformedKey = toCamelCase(key);
    transformedFieldsObj[transformedKey] = value;
    transformedFieldsObj.id = record.id;
  }
  return transformedFieldsObj;
};

export const getCabins = async () => {
  const { records: cabins } = await getRecords({
    tableId: 'Cabins',
    endpoint: '/get-cabins',
  });
  return cabins;
};

export const getUnits = async () => {
  const { records: units } = await getRecords({
    tableId: 'Units',
    endpoint: '/get-units',
    view: 'List view',
  });
  return units;
};

export const getCabinById = async ({ cabinId }) => {
  const { record: cabin } = await getRecordById({
    tableId: 'Cabins',
    recordId: cabinId,
    endpoint: '/get-record-by-id',
  });
  return cabin;
};

export const getUserCabin = async user => {
  const cabinName =
    (Array.isArray(user?.['name(FromCabin)'])
      ? user['name(FromCabin)'][0]
      : user?.['name(FromCabin)']) ||
    user?.cabinName ||
    null;

  if (cabinName) return cabinName;

  const cabinRecord = user?.cabinRecordId || user?.cabin;
  const cabinId = Array.isArray(cabinRecord) ? cabinRecord[0] : cabinRecord;
  if (!cabinId) return null;

  const cabin = await getCabinById({ cabinId });
  return cabin?.name || null;
};

export const reserveSpotInCabin = async ({ cabinId = '', attendeeId }) => {
  const { record } = await updateRecord({
    tableId: AIRTABLE_BASES.TICKET_PURCHASES,
    recordId: attendeeId,
    newFields: { Cabin: [cabinId] },
    endpoint: '/update-record',
  });
  return record;
};

export const getUserByEmail = async ({ email }) => {
  const response = await getRecordsByFieldValue({
    tableId: AIRTABLE_BASES.TICKET_PURCHASES,
    endpoint: '/get-records-by-field-value',
    formulaArray: [{ fieldName: 'Email Address', fieldValue: email }],
  });
  const records = response?.records;
  // A failed lookup must not be treated as "no ticket", so login, account creation and Add Guest show a retry message
  // instead of telling a ticket holder that their email is not on file.
  if (!Array.isArray(records)) {
    throw new Error(ticketLookupErrorMessage);
  }
  if (records.length === 0) return {};
  const user = records.find(record => {
    if (record.status !== 'Payment Made' && !isInactiveTicketStatus(record.status)) return record;
    return null;
  });
  if (user?.length === 0) return {};
  return user || {};
};

const isTicketPurchaserStatus = status =>
  Boolean(
    status === 'Ticket Purchased' ||
      (status?.toLowerCase().includes('bundle') &&
        !status.toLowerCase().includes('guest')),
  );
const isPurchasedTicketGuestStatus = status =>
  status === 'Ticket Purchased' || status === 'Bundle Guest';

export const getPurchasedTicketAllocation = async ({ user }) => {
  if (!user?.id || !user?.name || !user?.emailAddress) {
    return {
      remainingTicketCount: 0,
      placeholderRecords: [],
      isBundlePurchase: false,
    };
  }

  const buyerResponse = await getRecordsByFieldValue({
    tableId: AIRTABLE_BASES.TICKET_PURCHASES,
    endpoint: '/get-records-by-field-value',
    formulaArray: [
      { fieldName: 'Email Address', fieldValue: user.emailAddress },
    ],
  });

  if (!Array.isArray(buyerResponse?.records)) {
    throw new Error('Unable to verify purchased ticket records.');
  }

  const normalizeValue = value => String(value || '').trim().toLowerCase();
  const purchaserName = normalizeValue(user.name);
  const purchaserEmail = normalizeValue(user.emailAddress);
  const buyerTicketRecords = buyerResponse.records.filter(record => {
    const hasMatchingName = normalizeValue(record.name) === purchaserName;
    const doesHaveMatchingEmail =
      normalizeValue(record.emailAddress) === purchaserEmail;
    const doesHaveTicketStatus = !isInactiveTicketStatus(record.status) &&
      isTicketPurchaserStatus(record.status);

    return (
      hasMatchingName &&
      doesHaveMatchingEmail &&
      doesHaveTicketStatus
    );
  });
  const buyerRecords = buyerTicketRecords.filter(record => {
    const hasPurchasedQuantity = Number(record.quantity) > 0;
    const hasNoPurchaserAttribution = !record.purchaser;
    return hasPurchasedQuantity || hasNoPurchaserAttribution;
  });
  if (buyerRecords.length === 0) {
    return {
      remainingTicketCount: 0,
      placeholderRecords: [],
      isBundlePurchase: false,
    };
  }
  const purchasedTicketCount = buyerRecords.reduce(
    (total, record) =>
      total + (Number(record.quantity) > 0 ? Number(record.quantity) : 1),
    0,
  );
  const buyerTicketCount = buyerRecords.length;
  const isBundlePurchase = buyerRecords.some(({ status }) =>
    status?.toLowerCase().includes('bundle'),
  );
  if (purchasedTicketCount <= buyerTicketCount) {
    return {
      remainingTicketCount: 0,
      placeholderRecords: [],
      isBundlePurchase,
    };
  }

  const purchaserResponse = await getRecordsByFieldValue({
    tableId: AIRTABLE_BASES.TICKET_PURCHASES,
    endpoint: '/get-records-by-field-value',
    formulaArray: [{ fieldName: 'Purchaser', fieldValue: user.name }],
  });
  if (!Array.isArray(purchaserResponse?.records)) {
    throw new Error('Unable to verify purchased ticket assignments.');
  }

  const buyerRecordIds = new Set(buyerRecords.map(({ id }) => id));
  const purchaserTicketRecords = purchaserResponse.records.filter(record => {
    const isNotBuyerRecord = !buyerRecordIds.has(record.id);
    return isNotBuyerRecord && !isInactiveTicketStatus(record.status) &&
      isPurchasedTicketGuestStatus(record.status);
  });
  // Blank checkout rows share the buyer's identity; keep them available to claim.
  const isPlaceholderRecord = record => {
    const isNotBuyerRecord = !buyerRecordIds.has(record.id);
    const hasTicketGuestStatus = isPurchasedTicketGuestStatus(record.status);
    const hasPurchaserName = normalizeValue(record.name) === purchaserName;
    const hasPurchaserEmail =
      normalizeValue(record.emailAddress) === purchaserEmail;
    return (
      isNotBuyerRecord &&
      hasTicketGuestStatus &&
      hasPurchaserName &&
      hasPurchaserEmail
    );
  };
  const placeholderRecords = [
    ...purchaserTicketRecords.filter(isPlaceholderRecord),
    ...buyerTicketRecords.filter(isPlaceholderRecord),
  ].filter(
    (record, index, records) =>
      records.findIndex(({ id }) => id === record.id) === index,
  );
  const placeholderRecordIds = new Set(placeholderRecords.map(({ id }) => id));
  const assignedGuestCount = purchaserTicketRecords.filter(
    ({ id }) => !placeholderRecordIds.has(id),
  ).length;
  const remainingTicketCount = Math.max(
    purchasedTicketCount - buyerTicketCount - assignedGuestCount,
    0,
  );

  return {
    remainingTicketCount,
    placeholderRecords,
    isBundlePurchase,
  };
};

export const createPurchasedTicketGuest = async ({
  host,
  email,
  name,
  cabinId,
  placeholderRecord,
  isBundlePurchase,
}) => {
  const temporaryPassword = generateRandomPassword();
  const newFields = {
    Name: name,
    'Email Address': email,
    'Temporary Password': temporaryPassword,
    Purchaser: host.name,
    ...(cabinId && { Cabin: [cabinId] }),
  };
  let guest;

  // Claim an existing paid GA row instead of issuing another ticket.
  if (placeholderRecord) {
    throwIfReservationTicketIsInvalid(host);
    throwIfReservationTicketIsInvalid(placeholderRecord);
    const updateResponse = await updateRecord({
      tableId: AIRTABLE_BASES.TICKET_PURCHASES,
      recordId: placeholderRecord.id,
      newFields,
      endpoint: '/update-record',
    });
    guest = updateResponse?.record;
  } else {
    const createResponse = await createRecord({
      tableId: AIRTABLE_BASES.TICKET_PURCHASES,
      newFields: {
        ...newFields,
        ...(!isBundlePurchase && {
          amount: 0,
          'Full Ticket Price': 0,
        }),
        Status:
          process.env.NODE_ENV === 'production'
            ? isBundlePurchase
              ? 'Bundle Guest'
              : 'Ticket Purchased'
            : 'Testing',
        ...(host.productID?.length && { 'Product ID': host.productID }),
        ...(host.subscriptionId?.length && {
          'Subscription Id': host.subscriptionId,
        }),
      },
      endpoint: '/create-record',
    });
    guest = createResponse?.record;
  }

  if (!guest?.id) {
    throw new Error('Unable to create the purchased ticket guest record.');
  }

  return { guest };
};

export const getUserByRecordId = async ({ id }) => {
  const { record: user } = await getRecordById({
    tableId: AIRTABLE_BASES.TICKET_PURCHASES,
    recordId: id,
    endpoint: '/get-record-by-id',
  });
  return isInactiveTicketStatus(user?.status) ? {} : user;
};

export const getUserCheckIn = async ({ attendeeId }) => {
  const { records = [] } = (await getRecords({ tableId: 'Check In' })) || {};
  return records.find(record => record.attendee?.includes(attendeeId)) || null;
};

export const reserveBed = async ({ userId, bedName, cabinId }) => {
  const { record: cabin } = await updateRecord({
    tableId: 'Cabins',
    recordId: cabinId,
    newFields: {
      [bedName]: [userId],
    },
    endpoint: '/reserve-bed',
  });
  return cabin;
};

export const getBedOccupant = async ({ userId }) => {
  // if (!userId) return;
  const { record: currentBedOccupant } = await getRecordById({
    tableId: AIRTABLE_BASES.TICKET_PURCHASES,
    recordId: userId,
    endpoint: '/get-bed-occupant',
  });
  return isInactiveTicketStatus(currentBedOccupant?.status) ? {} : currentBedOccupant;
};

export const clearCurrentBedSelection = async ({ userId }) => {
  const { record: user } = await updateRecord({
    tableId: AIRTABLE_BASES.TICKET_PURCHASES,
    recordId: userId,
    newFields: {
      [BEDS.frontBunkLeft]: [],
      [BEDS.backBunkLeft]: [],
      [BEDS.frontCotLeft]: [],
      [BEDS.backCotLeft]: [],
      [BEDS.frontLoftLeft]: [],
      [BEDS.backLoftLeft]: [],
      [BEDS.frontBunkRight]: [],
      [BEDS.backBunkRight]: [],
      [BEDS.frontCotRight]: [],
      [BEDS.backCotRight]: [],
      [BEDS.frontLoftRight]: [],
      [BEDS.backLoftRight]: [],
    },
    endpoint: '/clear-current-bed-selection',
  });
  return user;
};

export const createGroup = async ({ groupName, members }) => {
  const { record: group } = await createRecord({
    tableId: 'Groups',
    newFields: {
      'Group Name': groupName,
      Members: members,
    },
    endpoint: '/create-record',
  });
  return group;
};

export const updateGroup = async ({ groupId, members }) => {
  const { record: groupData } = await updateRecord({
    tableId: 'Groups',
    recordId: groupId,
    newFields: { Members: members },
    endpoint: '/update-record',
  });
  return groupData;
};

export const getGroup = async ({ groupId }) => {
  const { record: groupData } = await getRecordById({
    tableId: 'Groups',
    recordId: groupId,
    endpoint: '/get-record-by-id',
  });
  return groupData;
};

export const checkIn = async ({
  attendee,
  arrivalDay,
  arrivalTime,
  city,
  birthday,
  howDidYouHearAboutHighlands,
  electricVehicle,
  departureTime,
}) => {
  const existingAttendee = await getUserByRecordId({ id: attendee });
  if (!existingAttendee?.id) {
    throw new Error('An active ticket is required to check in.');
  }
  if (existingAttendee?.checkedIn === 'Yes') {
    return { alreadyCheckedIn: true };
  }
  try {
    const { record: user } = await createRecord({
      tableId: 'Check In',
      endpoint: '/create-check-in',
      newFields: {
        Attendee: [attendee],
        City: city,
        Birthday: birthday,
        'Arrival Day': arrivalDay,
        'Arrival Time': arrivalTime,
        'How Did You Hear About Highlands': howDidYouHearAboutHighlands,
        'Does your EV need to be charged?': electricVehicle,
        'Departing before 9AM on Sunday?': departureTime,
      },
    });
    return { user };
  } catch (error) {
    logSentryError(error, { action: 'create-check-in' });
  }
};

export const acceptWaiver = async ({ checkInRecordId }) => {
  if (!checkInRecordId) {
    throw new Error('A check-in record ID is required to accept the waiver.');
  }
  const { record } = await updateRecord({
    tableId: 'Check In',
    recordId: checkInRecordId,
    newFields: {
      'Waiver Accepted': true,
      'Waiver Accepted Date': new Date().toISOString(),
    },
  });
  return record;
};

export const getCabinCategories = async () => {
  const { records: cabins } = await getRecords({
    tableId: 'Cabin Categories',
    endpoint: '/get-cabin-categories',
  });
  return cabins;
};

export const removeFirebaseUid = async ({ attendeeId, uid = '' }) => {
  const { record } = await updateRecord({
    tableId: AIRTABLE_BASES.TICKET_PURCHASES,
    recordId: attendeeId,
    newFields: { 'Firebase UID': uid },
    endpoint: '/remove-firebase-uid',
  });
  return record;
};

export const createUser = async ({ email, name, cabinId }) => {
  const randomPassword = generateRandomPassword();
  const { record: airtableResponse } = await createRecord({
    tableId: AIRTABLE_BASES.TICKET_PURCHASES,
    newFields: {
      'Temporary Password': randomPassword,
      Name: name,
      'Email Address': email,
      Status: process.env.NODE_ENV === 'production' ? 'Cabin Guest' : 'Testing',
      Cabin: [cabinId],
    },
  });
  return airtableResponse;
};

export async function getPageLoadData({ req, res }) {
  try {
    const cookies = new Cookies(req, res);
    const userRecId = cookies.get(COOKIES.USER_RECORD);
    if (!userRecId) return { user: null, redirect: null };
    const user = await getUserByRecordId({ id: userRecId });
    const hasUser = !isObjectEmpty(user);
    // The login cookie points to a ticket that is not active in the current
    // Airtable base (for example, an ID from a previous year's base). Delete the
    // cookie and return a redirect so pages send the guest back to the login
    // page instead of showing the error takeover.
    if (!hasUser) {
      cookies.set(COOKIES.USER_RECORD, null, { httpOnly: false });
      return {
        user: null,
        redirect: { destination: ROUTES.HOME, permanent: false },
      };
    }
    // const hasMembership = user.hasMembership === 'True';
    return {
      user,
      redirect: null,
      // hasMembership,
    };
  } catch (error) {
    console.error('No user data found:', error);
    return { user: null, redirect: null };
  }
}
