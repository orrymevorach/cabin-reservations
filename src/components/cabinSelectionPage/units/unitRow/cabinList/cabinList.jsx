import styles from './cabinList.module.scss';
import CabinSelectionTile from '../../cabinSelectionTile/cabinSelectionTile';
import { useCabinSelection } from '@/context/cabin-selection-context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronCircleDown } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

export default function CabinList({ unitData, setHasAvailability }) {
  const { dispatch, actions } = useCabinSelection();
  const [scrollValue, setScrollValue] = useState(0);
  const cabinListRef = useRef();

  const cabins = unitData.cabins;
  const hasCabins = !!cabins?.length;

  useEffect(() => {
    setHasAvailability(hasCabins);
  }, []);

  const handleSubmit = selectedCabin => {
    dispatch({
      type: actions.OPEN_CABIN_SELECTION,
      cabin: selectedCabin,
    });
  };

  const handleScrollDown = () => {
    cabinListRef.current.scrollTop = scrollValue + 150;
  };

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
