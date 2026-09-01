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
