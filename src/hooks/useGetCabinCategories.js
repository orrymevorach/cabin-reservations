import { getCabinCategories } from '@/lib/platform-api';
import { useEffect, useState } from 'react';

export default function useGetCabinCategories() {
  const [cabinCategories, setCabinCategories] = useState(null);
  useEffect(() => {
    const getCabinCategoryData = async () => {
      const cabinCategories = await getCabinCategories();
      setCabinCategories(cabinCategories);
    };
    getCabinCategoryData();
  }, []);

  return {
    cabinCategories,
  };
}
