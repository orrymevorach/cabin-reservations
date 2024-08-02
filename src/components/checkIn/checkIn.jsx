import Layout from '../shared/layout/layout';
import CheckInForm from './form/form';
import styles from './checkIn.module.scss';
import { useCheckIn } from '@/context/check-in-context';

export default function CheckIn() {
  const {
    state: { stage },
    stages,
  } = useCheckIn();

  return (
    <main>
      {stage === stages.FILL_OUT_FORM && (
        <Layout>
          <div className={styles.textContainer}>
            <h2 className={styles.title}>Welcome!</h2>

            <p className={styles.text}>
              Please fill out the form below to help us prepare for your
              arrival. Thank you!
            </p>
          </div>
          <CheckInForm />
        </Layout>
      )}
      {stage === stages.SIGN_WAIVER && (
        <Layout>
          <div>
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLScgMu0FynbVLhvjh6EmTsTh0X9je7Gl6t5HUAz9VWezoN4vYw/viewform"
              frameborder="0"
              className={styles.iframe}
            ></iframe>
          </div>
        </Layout>
      )}
      {stage === stages.CONFIRMATION && (
        <Layout>
          <div className={styles.confirmationContainer}>
            <p className={styles.confirmationText}>
              Thank you! See you at Highlands!
            </p>
          </div>
        </Layout>
      )}
    </main>
  );
}
