import React, { useEffect, useState } from 'react';
import styles from './countdown.module.scss';
import Loader from '../loader/loader';
import Takeover from '../takeover/takeover';

function getDeltaParts() {
  const year = 2025;
  const month = 8; // September (0-based)
  const day = 6;
  const hour = 11;
  const minute = 0;

  // Convert target EST/EDT time into a fixed UTC timestamp
  // Sept 6, 2025 is daylight saving time (EDT = UTC-4)
  const targetDate = new Date(Date.UTC(year, month, day, hour + 4, minute, 0));

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
            <p className={styles.open}>Reservations are opening momentarily.</p>
            <p>Please refresh your page every few seconds.</p>
          </div>
        ) : (
          <>
            <p className={styles.text}>Reservations open in:</p>
            <p className={styles.time}>
              {parts.days > 0 && (
                <span className={styles.time}>{parts.days} days</span>
              )}
              <span className={styles.time}>{pad(parts.hours)} hrs</span>
              <span className={styles.time}>{pad(parts.minutes)} min</span>
              <span className={styles.time}>{pad(parts.seconds)} sec</span>
            </p>
          </>
        )}
      </div>
    </Takeover>
  );
}
