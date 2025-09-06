import Button from '@/components/shared/button/button';
import styles from './cabinSelectionTile.module.scss';
import clsx from 'clsx';
import Pill from '@/components/shared/pill/pill';

export default function CabinSelectionTile({ cabin, handleSelectCabin }) {
  const {
    name,
    openBeds,
    totalBeds,
    availability,
    category: categoryRef,
  } = cabin;
  const isAvailable = openBeds > 0 && availability === 'Open';
  const category = categoryRef[0];
  return (
    <li key={name} className={styles.cabinContainer}>
      <div className={styles.topRow}>
        <p className={styles.nameContainer}>
          Cabin Name: <span className={styles.name}>{name}</span>
        </p>
        {isAvailable && (
          <p>
            Available Beds: {openBeds} of {totalBeds}
          </p>
        )}
        {category !== 'Anywhere!' && (
          <Pill classNames={styles.pill}>{category}</Pill>
        )}

        {isAvailable ? (
          <Button
            classNames={styles.button}
            handleClick={() => handleSelectCabin(cabin)}
            isSmall
          >
            Select
          </Button>
        ) : (
          <Button
            classNames={styles.button}
            handleClick={() => {}}
            isSmall
            isDisabled
          >
            Full
          </Button>
        )}
      </div>
    </li>
  );
}
