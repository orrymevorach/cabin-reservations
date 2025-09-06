import styles from './information.module.scss';

export default function Information() {
  return (
    <div className={styles.container}>
      <p className={styles.title}>
        Welcome to the reservation platform for Highlands Music Festival.
      </p>
      <p>Here you are able to:</p>
      <ol className={styles.list}>
        <li>Book a cabin you would like to sleep in</li>
        <li>Make a reservation on behalf of your friends/partner</li>
        <li>Reserve a specific bed in your cabin</li>
        <li>Make changes to an existing reservation</li>
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
