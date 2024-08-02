import { toCamelCase } from '@/utils/string-utils';
import { BEDS } from '@/utils/constants';

export const createRecord = async ({
  tableId,
  newFields,
  endpoint = '/create-record',
}) => {
  try {
    const response = await fetch(`/api/airtable${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tableId, newFields }),
    }).then(res => res.json());
    return response;
  } catch (error) {
    console.log('error', error);
  }
};

export async function getRecords({
  tableId,
  endpoint = '/get-records',
  view = 'Grid view',
}) {
  try {
    const response = await fetch(`/api/airtable${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tableId, view }),
    }).then(res => res.json());
    return response;
  } catch (error) {
    console.log('error', error);
  }
}

export async function getRecord({
  tableId,
  field,
  fieldValue,
  endpoint = '/get-record',
}) {
  try {
    const response = await fetch(`/api/airtable${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tableId, field, fieldValue }),
    }).then(res => res.json());
    return response;
  } catch (error) {
    console.log('error', error);
  }
}

export async function getRecordById({
  tableId,
  recordId,
  endpoint = '/get-record-by-id',
}) {
  try {
    const response = await fetch(`/api/airtable${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tableId, recordId }),
    }).then(res => res.json());
    return response;
  } catch (error) {
    console.log('error', error);
  }
}

export const updateRecord = async ({
  tableId,
  recordId,
  newFields,
  endpoint = '/update-record',
}) => {
  try {
    const response = await fetch(`/api/airtable${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tableId, newFields, recordId }),
    }).then(res => res.json());
    return response;
  } catch (error) {
    console.log('error', error);
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

export const getCabin = async ({ cabinName }) => {
  const { record: cabin } = await getRecord({
    tableId: 'Cabins',
    field: 'Name',
    fieldValue: cabinName,
    endpoint: '/get-cabin',
  });
  return cabin;
};

export const getCabinById = async ({ cabinId }) => {
  const { record: cabin } = await getRecordById({
    tableId: 'Cabins',
    recordId: cabinId,
    endpoint: '/get-cabin-by-id',
  });
  return cabin;
};

export const reserveSpotInCabin = async ({ cabinId = '', attendeeId }) => {
  const { record } = await updateRecord({
    tableId: 'Ticket Purchases 2024',
    recordId: attendeeId,
    newFields: { Cabin: [cabinId] },
    endpoint: '/reserve-spot-in-cabin',
  });
  return record;
};

export const getUserByEmail = async ({ email }) => {
  const { record: user } = await getRecord({
    tableId: 'Ticket Purchases 2024',
    field: 'Email Address',
    fieldValue: email,
    endpoint: '/get-user-by-email',
  });
  return user;
};

export const getUserByRecordId = async ({ id }) => {
  const { record: user } = await getRecordById({
    tableId: 'Ticket Purchases 2024',
    recordId: id,
    endpoint: '/get-user-by-record-id',
  });
  return user;
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
  const { record: currentBedOccupant } = await getRecordById({
    tableId: 'Ticket Purchases 2024',
    recordId: userId,
    endpoint: '/get-bed-occupant',
  });
  return currentBedOccupant;
};

export const clearCurrentBedSelection = async ({ userId }) => {
  const { record: user } = await updateRecord({
    tableId: 'Ticket Purchases 2024',
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
    endpoint: '/create-group',
  });
  return group;
};

export const updateGroup = async ({ groupId, members }) => {
  const { record: groupData } = await updateRecord({
    tableId: 'Groups',
    recordId: groupId,
    newFields: { Members: members },
    endpoint: '/update-group',
  });
  return groupData;
};

export const getGroup = async ({ groupId }) => {
  const { record: groupData } = await getRecordById({
    tableId: 'Groups',
    recordId: groupId,
    endpoint: '/get-group',
  });
  return groupData;
};

export const checkIn = async ({
  name,
  arrivalDay,
  arrivalTime,
  questions,
  city,
  birthday,
  howDidYouHearAboutHighlands,
}) => {
  const { record: user } = await createRecord({
    tableId: 'Check In',
    newFields: {
      Name: name,
      City: city,
      Birthday: birthday,
    },
  });
  return user;
};
