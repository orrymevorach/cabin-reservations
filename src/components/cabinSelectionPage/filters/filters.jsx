import Dropdown from '@/components/shared/dropdown';
import styles from './filters.module.scss';
import { useCabinAndUnitData } from '@/context/cabin-and-unit-data-context';
import clsx from 'clsx';
import { FILTERS, useFilters } from './filters-context';
import { getFilterCategories } from '../units/unitRow/cabinList/filter-utils';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Filters({ classNames = '' }) {
  const { selectedFilters, setSelectedFilters } = useFilters();
  const { units } = useCabinAndUnitData();
  const router = useRouter();

  const numberOfGuests = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const unitNames = units.map(({ name }) => name);
  const categories = getFilterCategories({ unitData: units });

  const handleChange = ({ event, label }) => {
    const selectedFiltersCopy = Object.assign({}, selectedFilters);
    selectedFiltersCopy[label] = event;
    setSelectedFilters(selectedFiltersCopy);
    router.push(
      {
        pathname: '/cabin-selection',
        query: {
          ...router.query,
          [label]: event,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  // On page load, set filters based on filter query params
  useEffect(() => {
    if (router.query) {
      setSelectedFilters(router.query);
    }
  }, []);

  return (
    <div className={clsx(styles.filters, classNames)}>
      <p className={styles.title}>Filter by:</p>
      <Dropdown
        options={numberOfGuests}
        label={FILTERS.AVAILABLE_BEDS}
        variant="standard"
        handleChange={event => handleChange({ event, label: 'Available beds' })}
      />
      <Dropdown
        options={['All', ...unitNames]}
        label={FILTERS.UNIT}
        variant="standard"
        handleChange={event => handleChange({ event, label: 'Unit' })}
      />
      <Dropdown
        options={['All', ...categories]}
        label={FILTERS.CATEGORY}
        variant="standard"
        handleChange={event => handleChange({ event, label: 'Category' })}
      />
    </div>
  );
}
