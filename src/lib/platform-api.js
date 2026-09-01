export default async function getCabinAndUnitData() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ENV_URL}/api/platform/cabins`,
    ).then(res => res.json());
    return response;
  } catch (error) {
    console.log('error', error);
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
    console.log('error', error);
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
    console.log('error', error);
    return { message: 'Unable to reserve cabin. Please try again.' };
  }
}

export async function addGroupMember({ groupId, hostUserId, memberIds, email }) {
  try {
    const response = await fetch('/api/platform/group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add',
        groupId,
        hostUserId,
        memberIds,
        email,
      }),
    }).then(res => res.json());
    return response;
  } catch (error) {
    console.log('error', error);
    return { message: 'Unable to add guest. Please try again.' };
  }
}

export async function removeGroupMember({ groupId, memberIds, removeUserId }) {
  try {
    const response = await fetch('/api/platform/group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'remove',
        groupId,
        memberIds,
        removeUserId,
      }),
    }).then(res => res.json());
    return response;
  } catch (error) {
    console.log('error', error);
    return { message: 'Unable to remove guest. Please try again.' };
  }
}

export async function reserveBeds({ cabinId, hostUserId, beds }) {
  try {
    const response = await fetch('/api/platform/reserve-bed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cabinId, hostUserId, beds }),
    }).then(res => res.json());
    return response;
  } catch (error) {
    console.log('error', error);
    return { message: 'Unable to reserve bed. Please try again.' };
  }
}
