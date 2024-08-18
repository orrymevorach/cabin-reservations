import styles from './cabinList.module.scss';
import CabinSelectionTile from '../../cabinSelectionTile/cabinSelectionTile';
import { useCabinSelection } from '@/context/cabin-selection-context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronCircleDown } from '@fortawesome/free-solid-svg-icons';
import { useRef, useState } from 'react';
import { useFilters } from '../../../filters/filters-context';
import clsx from 'clsx';
import {
  filterByAvailableBeds,
  filterByCategory,
  sortByLeastAvailability,
} from './filter-utils';

export default function CabinList({ unitData, setHasAvailability }) {
  const { dispatch, actions } = useCabinSelection();
  const [scrollValue, setScrollValue] = useState(0);
  const { selectedFilters } = useFilters();

  const cabins = unitData.cabins;

  const handleSubmit = selectedCabin => {
    dispatch({
      type: actions.OPEN_CABIN_SELECTION,
      cabin: selectedCabin,
    });
  };
  const cabinListRef = useRef();

  const handleScrollDown = () => {
    cabinListRef.current.scrollTop = scrollValue + 150;
  };
  // console.log('cabins', cabins);
  const hasCabins = !!cabins.length;
  setHasAvailability(hasCabins);

  return (
    <div className={styles.cabinListOuterContainer}>
      <ul
        className={clsx(
          styles.cabinListInnerContainer,
          !hasCabins && styles.noAvailability
        )}
        ref={cabinListRef}
        onScroll={e => setScrollValue(e.target.scrollTop)}
      >
        {hasCabins ? (
          cabins.map(cabin => {
            return (
              <CabinSelectionTile
                cabin={cabin}
                key={`${cabin.unit}-${cabin.name}`}
                handleSelectCabin={() => handleSubmit(cabin)}
              />
            );
          })
        ) : (
          <p>There are no cabins in this unit that match your selection.</p>
        )}
      </ul>
      {hasCabins && (
        <button className={styles.scrollDownButton} onClick={handleScrollDown}>
          <FontAwesomeIcon icon={faChevronCircleDown} size="3x" />
        </button>
      )}
    </div>
  );
}
