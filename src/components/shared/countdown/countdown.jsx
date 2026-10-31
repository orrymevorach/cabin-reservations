import React, { useEffect, useState } from 'react';
import styles from './countdown.module.scss';
import Loader from '../loader/loader';
import Takeover from '../takeover/takeover';

function getDeltaParts() {
  const targetDate = new Date('2026-11-01T19:00:00Z');

  const currentDateAndTime = new Date();

  if (currentDateAndTime.getTime() >= targetDate.getTime()) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  }

  const totalMs = targetDate.getTime() - currentDateAndTime.getTime();

  const totalSeconds = Math.floor(totalMs / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const days = Math.floor(totalHours / 24);

  return { days, hours, minutes, seconds, totalMs };
}

export default function CountdownToDate() {
  const [parts, setParts] = useState(() => getDeltaParts());

  // Refresh the displayed remaining time once per second while the countdown is visible.
  useEffect(() => {
    const id = setInterval(() => {
      const delta = getDeltaParts();
      setParts(delta);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  return (
    <Takeover hideCloseButton modalClassNames={styles.modal}>
      <div className={styles.container}>
        {parts.totalMs === 0 ? (
          <div className={styles.openContainer}>
            <Loader isDotted classNames={styles.loader} />
            <p className={styles.eyebrow}>Highlands Music Festival</p>
            <h1 className={styles.heading}>Reservations are opening</h1>
            <p className={styles.note}>
              Please refresh your page in a few moments.
            </p>
          </div>
        ) : (
          <>
            <p className={styles.eyebrow}>Highlands Music Festival</p>
            <h1 className={styles.heading}>Cabin Reservations</h1>
            <p className={styles.text}>Open in</p>
            <div className={styles.timer} role='timer' aria-live='off'>
              {parts.days > 0 && (
                <div className={styles.timeUnit}>
                  <span className={styles.number}>{parts.days}</span>
                  <span className={styles.label}>Days</span>
                </div>
              )}
              <div className={styles.timeUnit}>
                <span className={styles.number}>{pad(parts.hours)}</span>
                <span className={styles.label}>Hours</span>
              </div>
              <div className={styles.timeUnit}>
                <span className={styles.number}>{pad(parts.minutes)}</span>
                <span className={styles.label}>Minutes</span>
              </div>
              <div className={styles.timeUnit}>
                <span className={styles.number}>{pad(parts.seconds)}</span>
                <span className={styles.label}>Seconds</span>
              </div>
            </div>
            <p className={styles.dateNote}>
              <span className={styles.date}>Sunday, November 1</span>
              <span className={styles.dateTime}>2:00 p.m. EST</span>
            </p>
          </>
        )}
      </div>
    </Takeover>
  );
}
