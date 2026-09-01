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
