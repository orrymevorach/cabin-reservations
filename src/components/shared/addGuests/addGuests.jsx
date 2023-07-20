import InputVerify from './inputVerify/inputVerify';
import styles from './addGuests.module.scss';
import { useReservation } from '@/context/reservation-context';
import clsx from 'clsx';

const getErrorMessage = ({
  numberOfOpenBeds,
  numberOfMembersNotConfirmedInCurrentCabin,
}) => {
  const isCabinFull = numberOfOpenBeds === 0;
  const noAdditionalBeds =
    numberOfMembersNotConfirmedInCurrentCabin >= numberOfOpenBeds;
  if (isCabinFull || noAdditionalBeds)
    return 'No additional beds are available in this cabin.';
  else return;
};

export default function AddGuests({ cabin, classNames = '' }) {
  const { numberOfMembersNotConfirmedInCurrentCabin } = useReservation();

  if (!cabin) return;
  const numberOfOpenBeds = cabin.openBeds;

  const errorMessage = getErrorMessage({
    numberOfOpenBeds,
    numberOfMembersNotConfirmedInCurrentCabin,
  });

  return (
    <div className={clsx(styles.container, classNames)}>
      <p className={styles.title}>Add Guests (optional)</p>
      <p className={styles.text}>
        If you would like to reserve a spot in your cabin on behalf of your
        friends or partners, please make sure they have purchased a ticket in
        advance, and verify their email address.
      </p>
      {!errorMessage ? (
        <div className={styles.input}>
          <InputVerify />
        </div>
      ) : (
        <div className={styles.input}>
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
