import styles from './stageOne.module.scss';
import Button from '@/components/shared/button/button';

export default function StageOne({ setStage }) {
  return (
    <div>
      <p className={styles.line}>Welcome to the Booking Assistant!</p>
      <p className={styles.line}>
        The booking assistant is designed to help you find a cabin that best
        fits your needs.
      </p>
      <p className={styles.line}>
        If this is your first year attending Highlands, or if you have specific
        preferences for the cabin you live in, we recommend using the booking
        assistant.
      </p>
      <p className={styles.line}>
        If you feel comfortable proceeding without the assistant, feel free to
        close it at any time!
      </p>
      <div className={styles.buttonsContainer}>
        <Button classNames={styles.button} handleClick={() => setStage(2)}>
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
