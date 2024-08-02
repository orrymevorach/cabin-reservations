import styles from './cabinSelectionTakeover.module.scss';
import { useCabinSelection } from '@/context/cabin-selection-context';
import BottomRow from './bottomRow/bottomRow';
import ImageCarousel from '@/components/shared/imageCarousel/imageCarousel';
import CabinSummary from './cabinSummary/cabinSummary';
import Takeover from '@/components/shared/takeover/takeover';
import { useWindowSize } from '@/context/window-size-context';
import { useState } from 'react';
import BedSelection from '@/components/shared/bedSelection/bedSelection';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const BedSelectionTakeover = ({ showBedSelection, setShowBedSelection }) => {
  const { showTakeover, dispatch, actions, selectedCabin } =
    useCabinSelection();
  return (
    <Takeover
      showTakeover={showTakeover}
      handleClose={() => dispatch({ type: actions.CLOSE_CABIN_SELECTION })}
      modalClassNames={styles.modal}
    >
      <BedSelection cabin={selectedCabin} readOnly />
      <BottomRow
        showBedSelection={showBedSelection}
        setShowBedSelection={setShowBedSelection}
      />
    </Takeover>
  );
};

export default function CabinSelectionTakeover() {
  const { showTakeover, dispatch, actions, selectedCabin } =
    useCabinSelection();
  const { isMobile } = useWindowSize();
  const [showBedSelection, setShowBedSelection] = useState(false);

  return (
    <>
      {showBedSelection ? (
        <BedSelectionTakeover
          showBedSelection={showBedSelection}
          setShowBedSelection={setShowBedSelection}
        />
      ) : (
        <Takeover
          showTakeover={showTakeover}
          handleClose={() => dispatch({ type: actions.CLOSE_CABIN_SELECTION })}
          modalClassNames={styles.modal}
        >
          <div className={styles.outerContainer}>
            <div className={styles.innerContainer}>
              <ImageCarousel
                images={selectedCabin.images}
                classNames={styles.carousel}
                height={isMobile ? 200 : 300}
              />
              <div className={styles.right}>
                <CabinSummary {...selectedCabin} />
                <div className={styles.overlayText}>
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className={styles.infoIcon}
                    size="xs"
                  />
                  <p>
                    All cabins have the exact same layout, though each cabin may
                    differ slightly from the images.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <BottomRow
            showBedSelection={showBedSelection}
            setShowBedSelection={setShowBedSelection}
          />
        </Takeover>
      )}

      <BottomRow
        showBedSelection={showBedSelection}
        setShowBedSelection={setShowBedSelection}
      />
    </>
  );
}
