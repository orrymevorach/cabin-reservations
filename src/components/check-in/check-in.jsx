import Layout from '../shared/layout/layout';
import CheckInForm from './form/form';
import styles from './check-in.module.scss';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { COOKIES } from '@/utils/constants';
import Takeover from '../shared/takeover/takeover';
import Login from '../loginPage/login/login';
import { useUser } from '@/context/user-context';
import Loader from '../shared/loader/loader';
import { useCheckIn } from '@/context/check-in-context';

export default function CheckIn() {
  const {
    state: { stage },
    stages,
    dispatch,
    actions,
  } = useCheckIn();
  useEffect(() => {
    const userRecordCookie = Cookies.get(COOKIES.USER_RECORD);
    if (!userRecordCookie) {
      dispatch({
        type: actions.SET_STAGE,
        stage: stages.LOG_IN,
      });
    } else {
      dispatch({
        type: actions.SET_STAGE,
        stage: stages.FILL_OUT_FORM,
      });
    }
  }, []);

  const handleSuccess = () => {
    dispatch({
      type: actions.SET_STAGE,
      stage: stages.FILL_OUT_FORM,
    });
  };

  const { user } = useUser();
  if (stage === stages.PAGE_LOAD) return <Loader />;
  return (
    <main>
      {stage === stages.LOG_IN && (
        <>
          <Takeover
            handleClose={() => setShowLoginTakeover(false)}
            modalClassNames={styles.takeover}
            hideCloseButton
          >
            <p>Log in</p>
            <Login handleSuccess={handleSuccess} />
          </Takeover>
          <Loader />
        </>
      )}
      {stage === stages.FILL_OUT_FORM && (
        <Layout>
          <div className={styles.textContainer}>
            {user?.name && (
              <h2 className={styles.title}>Welcome, {user.name}</h2>
            )}

            <p className={styles.text}>
              Please fill out the form below to help us prepare for your
              arrival. Thank you!
            </p>
          </div>
          <CheckInForm />
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
