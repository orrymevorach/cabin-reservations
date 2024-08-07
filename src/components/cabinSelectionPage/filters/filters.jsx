import Dropdown from '@/components/shared/dropdown/dropdown';
import styles from './filters.module.scss';
import { useCabinAndUnitData } from '@/context/cabin-and-unit-data-context';
import clsx from 'clsx';
import { FILTERS, useFilters } from './filters-context';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useCabinCategories } from '@/context/cabin-categories';

export default function Filters({ classNames = '' }) {
  const { selectedFilters, setSelectedFilters } = useFilters();
  const { units } = useCabinAndUnitData();
  const { cabinCategories } = useCabinCategories();
  const router = useRouter();
  // On page load, set filters based on filter query params
  useEffect(() => {
    if (router.query) {
      setSelectedFilters(router.query);
    }
  }, []);

  if (!cabinCategories) return;

  const categoryNames = cabinCategories.map(({ name }) => name);

  const numberOfGuests = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const unitNames = units.map(({ name }) => name);

  const handleChange = ({ event, label }) => {
    const selectedFiltersCopy = Object.assign({}, selectedFilters);
    selectedFiltersCopy[label] = event;
    setSelectedFilters(selectedFiltersCopy);
  };

  return (
    <div className={clsx(styles.filters, classNames)}>
      <p className={styles.title}>Filter by:</p>
      <Dropdown
        options={numberOfGuests}
        label={FILTERS.AVAILABLE_BEDS}
        variant="standard"
        handleChange={event => handleChange({ event, label: 'Available beds' })}
        defaultValue={router.query[FILTERS.AVAILABLE_BEDS]}
      />
      <Dropdown
        options={['All', ...unitNames]}
        label={FILTERS.UNIT}
        variant="standard"
        handleChange={event => handleChange({ event, label: 'Unit' })}
        defaultValue={router.query[FILTERS.UNIT]}
      />
      <Dropdown
        options={['All', ...categoryNames]}
        label={FILTERS.CATEGORY}
        variant="standard"
        handleChange={event => handleChange({ event, label: 'Category' })}
        defaultValue={router.query[FILTERS.CATEGORY]}
      />
    </div>
  );
}
