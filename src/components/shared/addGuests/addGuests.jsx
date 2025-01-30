import InputVerify from './inputVerify/inputVerify';
import styles from './addGuests.module.scss';
import clsx from 'clsx';

const getErrorMessage = ({ numberOfOpenBeds }) => {
  const isCabinFull = numberOfOpenBeds <= 0; // Non purchased cabin
  if (isCabinFull) return 'No additional beds are available in this cabin.';
  else return;
};

export default function AddGuests({
  cabin,
  classNames = '',
  allowCreateNewUser,
  handleSubmit,
}) {
  if (!cabin) return;
  const numberOfOpenBeds = cabin.openBeds;

  const errorMessage = getErrorMessage({
    numberOfOpenBeds,
  });

  return (
    <div className={clsx(styles.container, classNames)}>
      <p className={styles.title}>Add Guests (optional)</p>
      {!allowCreateNewUser && (
        <p className={styles.text}>
          In order to reserve a spot in your cabin on behalf of your friends or
          partners, please make sure they have already purchased a ticket.
        </p>
      )}

      {!errorMessage ? (
        <div className={styles.input}>
          <InputVerify
            handleSubmit={handleSubmit}
            allowCreateNewUser={allowCreateNewUser}
          />
        </div>
      ) : (
        <div className={styles.input}>
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
