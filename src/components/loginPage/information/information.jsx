import styles from './information.module.scss';

export default function Information() {
  return (
    <div className={styles.container}>
      <p className={styles.title}>
        Welcome to the reservation platform for Highlands Music Festival.
      </p>
      <p>Here you are able to:</p>
      <ol className={styles.list}>
        <li>Book the cabin you would like to stay in</li>
        <li>Make a reservation for a friend or partner</li>
        <li>Reserve a specific bed in your cabin</li>
        <li>View or make changes to an existing reservation</li>
        <li>
          Cabin, Ticket Bundle, and Yurt purchasers can add guests to their
          group and send them their ticket confirmations
        </li>
      </ol>
      <p>What you need to log in:</p>
      <ol className={styles.list}>
        <li>Your email address</li>
        <li>
          <span className={styles.bold}>First time Highlands attendees</span>{' '}
          who are creating a new account will need their temporary password,
          which was shared when you received the booking email.
        </li>
        <li>
          <span className={styles.bold}>Returning Highlands attendees</span> who
          have previously created an account should use the password they set
          when they created an account.
        </li>
      </ol>
      <p>What you need to make a reservation:</p>
      <ol className={styles.list}>
        <li>Your email address</li>
        <li>
          The email address(es) for each person you wish to reserve a spot for
          (optional)
        </li>
      </ol>
    </div>
  );
}
