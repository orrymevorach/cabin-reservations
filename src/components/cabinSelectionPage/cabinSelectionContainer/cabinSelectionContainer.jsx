import CabinSelectionTakeover from '../cabinSelectionTakeover/cabinSelectionTakeover';
import Units from '../units/units';
import { useCabinSelection } from '@/context/cabin-selection-context';
import { useCabinAndUnitData } from '@/context/cabin-and-unit-data-context';
import Filters from '../filters/filters';
import styles from './cabinSelectionContainer.module.scss';
import Loader from '@/components/shared/loader/loader';
import { useRef } from 'react';
import MapOfCamp from '../mapOfCamp/mapOfCamp';
import UnitDescriptions from '../unitDescriptions/unitDescriptions';
import BookingAssistant from '../bookingAssistant/bookingAssistant';
import Sidebar from '../sidebar/sidebar';

export default function CabinSelectionContainer() {
  const { showTakeover, showBookingAssistant } = useCabinSelection();
  const { isLoading, units } = useCabinAndUnitData();
  const headerRef = useRef();

  if (isLoading || !units.length) return <Loader isDotted />;

  return (
    <>
      {showBookingAssistant ? (
        <BookingAssistant headerRef={headerRef} />
      ) : (
        <>
          <div className={styles.outerContainer}>
            <div className={styles.headerContainer} ref={headerRef}>
              <UnitDescriptions />
              <Filters />
              <MapOfCamp />
              <Sidebar mainSectionRef={headerRef} />
            </div>
          </div>
          <Units />
          {showTakeover && <CabinSelectionTakeover />}
        </>
      )}
    </>
  );
}
