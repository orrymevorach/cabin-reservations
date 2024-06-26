import { useWindowSize } from '@/context/window-size-context';
import BedColumn from '../bedColumn/bedColumn';
import styles from './cabin.module.scss';

const leftBeds = [
  ['backBunkLeft'],
  ['backLoftLeft', 'frontLoftLeft'],
  ['backCotLeft', 'frontCotLeft'],
  ['frontBunkLeft'],
];

const rightBeds = [
  ['backBunkRight'],
  ['backLoftRight', 'frontLoftRight'],
  ['backCotRight', 'frontCotRight'],
  ['frontBunkRight'],
];

export default function Cabin({ readOnly, cabin }) {
  const { isMobile } = useWindowSize();
  return (
    <div className={styles.cabinContainer}>
      {!isMobile && <p>Back of cabin</p>}
      <div className={styles.bedColumnsContainer}>
        {isMobile && <p className={styles.sideText}>Left side of cabin</p>}
        <BedColumn beds={leftBeds} readOnly={readOnly} cabin={cabin} />
        {isMobile && <p className={styles.sideText}>Right side of cabin</p>}
        <BedColumn
          beds={rightBeds}
          flip={!isMobile}
          readOnly={readOnly}
          cabin={cabin}
        />
      </div>
      {!isMobile && <p>Front door</p>}
    </div>
  );
}
