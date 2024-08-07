import CabinSelectionTakeover from '../cabinSelectionTakeover/cabinSelectionTakeover';
import Units from '../units/units';
import { useCabinSelection } from '@/context/cabin-selection-context';
import { useCabinAndUnitData } from '@/context/cabin-and-unit-data-context';
import Filters from '../filters/filters';
import styles from './cabinSelectionContainer.module.scss';
import Loader from '@/components/shared/loader/loader';
import Button from '@/components/shared/button/button';
import { useRef, useState } from 'react';
import useShowOnScroll from '@/hooks/useShowOnScroll';
import MapOfCamp from '../mapOfCamp/mapOfCamp';
import UnitDescriptions from '../unitDescriptions/unitDescriptions';
import BookingAssistant from '../bookingAssistant/bookingAssistant';

export default function CabinSelectionContainer() {
  const [showBackToTopButton, setShowBackToTopButton] = useState(false);
  const { showTakeover, showBookingAssistant, dispatch, actions } =
    useCabinSelection();
  const { isLoading, units } = useCabinAndUnitData();
  const headerRef = useRef();
  useShowOnScroll({ ref: headerRef, setIsShowing: setShowBackToTopButton });

  if (isLoading || !units.length) return <Loader isDotted />;

  const scrollToTop = () => window.scrollTo(0, 0);

  return (
    <>
      {showBookingAssistant ? (
        <BookingAssistant />
      ) : (
        <>
          <div className={styles.outerContainer}>
            <div className={styles.headerContainer} ref={headerRef}>
              <UnitDescriptions />
              <Filters />
              <MapOfCamp />
            </div>
          </div>
          <Units />
          {showTakeover && <CabinSelectionTakeover />}
          {showBackToTopButton && (
            <Button handleClick={scrollToTop} classNames={styles.backToTop}>
              Back to top
            </Button>
          )}
        </>
      )}
    </>
  );
}
