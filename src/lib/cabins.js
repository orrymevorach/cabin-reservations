export default async function getCabinAndUnitData() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ENV_URL}/api/cabins`,
    ).then(res => res.json());
    return response;
  } catch (error) {
    console.log('error', error);
    return { units: [], cabins: [] };
  }
}
