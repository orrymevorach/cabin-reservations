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
  canCreateNewUser,
  remainingPurchasedTicketCount = 0,
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
      {remainingPurchasedTicketCount > 0 && (
        <p className={styles.text}>
          You have {remainingPurchasedTicketCount} purchased{' '}
          {remainingPurchasedTicketCount === 1 ? 'ticket' : 'tickets'} available
          to assign. Enter each guest&apos;s name and email to assign a ticket
          and send them their access details.
        </p>
      )}
      {!canCreateNewUser && (
        <p className={styles.text}>
          In order to reserve a spot in your cabin on behalf of your friends or
          partners, please make sure they have already purchased a ticket.
        </p>
      )}

      {!errorMessage ? (
        <div className={styles.input}>
          <InputVerify
            handleSubmit={handleSubmit}
            canCreateNewUser={canCreateNewUser}
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
