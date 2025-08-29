import Button from '@/components/shared/button/button';
import styles from './cabinSelectionTile.module.scss';
import clsx from 'clsx';

export default function CabinSelectionTile({ cabin, handleSelectCabin }) {
  const { name, openBeds, totalBeds, availability } = cabin;
  const isAvailable = openBeds > 0 && availability === 'Open';
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
