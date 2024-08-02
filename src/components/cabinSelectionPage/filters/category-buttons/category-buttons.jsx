import Button from '@/components/shared/button/button';
import useGetCabinAndUnitData from '@/hooks/useGetCabinAndUnitData';
import { getFilterCategories } from '../../units/unitRow/cabinList/filter-utils';
import styles from './category-buttons.module.scss';
import { FILTERS } from '../filters-context';

export default function CategoryButtons({ handleChange }) {
  const { units } = useGetCabinAndUnitData();
  const filterCategories = getFilterCategories({ unitData: units });
  return (
    <div className={styles.container}>
      <p>Popular Selections:</p>
      <div className={styles.innerContainer}>
        {filterCategories.map(category => {
          return (
            <Button
              key={category}
              handleClick={() =>
                handleChange({ event: category, label: FILTERS.CATEGORY })
              }
            >
              {category}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
