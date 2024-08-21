import { getCabinCategories } from '@/lib/airtable';
import { useEffect, useState } from 'react';

export default function useGetCabinCategories() {
  const [cabinCategories, setCabinCategories] = useState(null);
  useEffect(() => {
    const getCabinCategoryData = async () => {
      const response = await getCabinCategories({});
      setCabinCategories(response);
    };
    getCabinCategoryData();
  }, []);

  return {
    cabinCategories,
  };
}
