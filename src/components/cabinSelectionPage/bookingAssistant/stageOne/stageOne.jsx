import styles from './stageOne.module.scss';
import Button from '@/components/shared/button/button';
import { useCabinSelection } from '@/context/cabin-selection-context';
import clsx from 'clsx';

export default function StageOne({ setStage }) {
  const { dispatch, actions } = useCabinSelection();
  return (
    <div>
      <p className={clsx(styles.line, styles.title)}>
        Welcome to the Cabin Booking Assistant!
      </p>
      <p className={styles.line}>
        The booking assistant is designed to help you find a cabin that best
        fits your needs.
      </p>
      <p>
        We recommend using the booking assistant if any of the following apply:
      </p>
      <ul className={styles.list}>
        <li>This is your first year at Highlands</li>
        <li>You have specific cabin requests</li>
        <li>You want to learn about our new accommodation options</li>
      </ul>
      <p>You may choose to skip the booking assistant if:</p>
      <ul className={styles.list}>
        <li>
          You do not care what cabin you live in, so long as you are with your
          friends!
        </li>
      </ul>
      <div className={styles.buttonsContainer}>
        <Button classNames={styles.button} handleClick={() => setStage(3)}>
          Continue with the Booking Assistant
        </Button>
        <Button
          handleClick={() =>
            dispatch({ type: actions.CLOSE_BOOKING_ASSISTANT })
          }
        >
          Skip
        </Button>
      </div>
    </div>
  );
}
