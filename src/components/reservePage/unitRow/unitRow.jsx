import { useState } from 'react';
import styles from './unitRow.module.scss';
import CabinSelectionTile from './cabinSelectionTile/cabinSelectionTile';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { useCabinSelection } from '@/context/cabin-selection-context';
import colors from 'public/colors.jpg';
import Image from 'next/image';

export default function UnitRow({ unitData }) {
  const [showCabins, setShowCabins] = useState(true);
  const { dispatch, actions } = useCabinSelection();

  const [unitName, { cabins = [] }] = unitData;
  const hasCabinData = cabins.length;

  const icon = showCabins ? faChevronUp : faChevronDown;

  const handleSubmit = selectedCabin => {
    dispatch({
      type: actions.OPEN_CABIN_SELECTION,
      cabin: selectedCabin,
    });
  };

  return (
    <div>
      <button
        className={styles.showUnitButton}
        onClick={() => setShowCabins(!showCabins)}
      >
        {unitName} <FontAwesomeIcon icon={icon} size="sm" />
      </button>
      <div className={styles.unitContainer}>
        {showCabins && (
          <>
            {!hasCabinData ? (
              <p>There are currently no cabins available in this unit</p>
            ) : (
              <ul className={styles.unitList}>
                {cabins
                  .sort((a, b) => {
                    const aOpenBeds = parseFloat(a.openBeds);
                    const bOpenBeds = parseFloat(b.openBeds);
                    if (aOpenBeds > bOpenBeds) return -1;
                    return 1;
                  })
                  .map(cabin => {
                    return (
                      <CabinSelectionTile
                        cabin={cabin}
                        key={`${cabin.unit}-${cabin.name}`}
                        handleSelectCabin={() => handleSubmit(cabin)}
                      />
                    );
                  })}
              </ul>
            )}
            <Image
              src={colors}
              alt={`${unitName} unit`}
              className={styles.unitImage}
            />
          </>
        )}
      </div>
    </div>
  );
}
