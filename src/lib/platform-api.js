import { logSentryError } from '@/utils/sentry-utils';

export async function getAttendeeAndAssignFirebaseUid({ idToken }) {
  const response = await fetch('/api/airtable/add-firebase-uid', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Unable to link your ticket to your account.');
  }
  return result.user;
}

export default async function getCabinAndUnitData() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ENV_URL}/api/platform/cabins`,
    ).then(res => res.json());
    return response;
  } catch (error) {
    logSentryError(error, { action: 'load-cabin-and-unit-data' });
    return { units: [], cabins: [] };
  }
}

export async function getCabinCategories() {
  try {
    const { cabinCategories } = await fetch(
      `${process.env.NEXT_PUBLIC_ENV_URL}/api/platform/cabin-categories`,
    ).then(res => res.json());
    return cabinCategories;
  } catch (error) {
    logSentryError(error, { action: 'load-cabin-categories' });
    return [];
  }
}

export async function reserveCabin({
  cabinId,
  groupMemberIds,
  hostUserId,
  selectedBeds,
}) {
  try {
    const response = await fetch('/api/platform/reserve-cabin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cabinId,
        groupMemberIds,
        hostUserId,
        selectedBeds,
      }),
    }).then(res => res.json());
    return response;
  } catch (error) {
    logSentryError(error, { action: 'reserve-cabin-request' });
    return { message: 'Unable to reserve cabin. Please try again.' };
  }
}

export async function addGroupMember({
  groupId,
  hostUserId,
  memberIds,
  email,
  cabinId,
}) {
  try {
    const response = await fetch('/api/platform/group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add-existing-ticket-holder',
        groupId,
        hostUserId,
        memberIds,
        email,
        cabinId,
      }),
    }).then(res => res.json());
    return response;
  } catch (error) {
    logSentryError(error, { action: 'add-group-member-request' });
    return { message: 'Unable to add guest. Please try again.' };
  }
}

export async function createGroupMember({
  groupId,
  hostUserId,
  memberIds,
  email,
  firstName,
  lastName,
  cabinId,
}) {
  try {
    const response = await fetch('/api/platform/group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create-cabin-guest',
        groupId,
        hostUserId,
        memberIds,
        email,
        firstName,
        lastName,
        cabinId,
      }),
    }).then(res => res.json());
    return response;
  } catch (error) {
    logSentryError(error, { action: 'create-group-member-request' });
    return { message: 'Unable to add guest. Please try again.' };
  }
}

export async function assignPurchasedTicketToGroupMember({
  groupId,
  hostUserId,
  email,
  firstName,
  lastName,
  cabinId,
}) {
  try {
    const response = await fetch('/api/platform/group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'assign-purchased-ticket',
        groupId,
        hostUserId,
        email,
        firstName,
        lastName,
        cabinId,
      }),
    }).then(res => res.json());
    return response;
  } catch (error) {
    logSentryError(error, { action: 'assign-purchased-ticket-request' });
    return {
      message: 'Unable to assign your purchased ticket. Please try again.',
    };
  }
}

export async function removeGroupMember({ groupId, memberIds, removeUserId }) {
  try {
    const response = await fetch('/api/platform/group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'remove-group-member',
        groupId,
        memberIds,
        removeUserId,
      }),
    }).then(res => res.json());
    return response;
  } catch (error) {
    logSentryError(error, { action: 'remove-group-member-request' });
    return { message: 'Unable to remove guest. Please try again.' };
  }
}

export async function reserveBeds({ cabinId, reservingAttendeeId, beds }) {
  try {
    const response = await fetch('/api/platform/reserve-bed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cabinId, reservingAttendeeId, beds }),
    }).then(res => res.json());
    return response;
  } catch (error) {
    logSentryError(error, { action: 'reserve-beds-request' });
    return { message: 'Unable to reserve bed. Please try again.' };
  }
}

export async function syncGuestIntake({ user, arrivalTime, requiresWaiver }) {
  try {
    const response = await fetch('/api/platform/guest-intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, arrivalTime, requiresWaiver }),
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        ok: false,
        message: data?.message || 'Unable to sync guest intake.',
        data,
      };
    }
    return { ok: true, data };
  } catch (error) {
    logSentryError(error, {
      action: 'sync-guest-intake',
      userId: user?.id,
      arrivalTime,
      requiresWaiver,
    });
    return {
      ok: false,
      message: error.message || 'Unable to sync guest intake.',
    };
  }
}
