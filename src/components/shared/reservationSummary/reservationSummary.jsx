import { useUser } from '@/context/user-context';
import styles from './reservationSummary.module.scss';
import { useReservation } from '@/context/reservation-context';
import { replaceCamelCaseWithSpaces } from '@/utils/string-utils';

export default function ReservationSummary({
  cabinData,
  showBedSelection = false,
}) {
  const { user } = useUser();
  const { cabin } = cabinData;
  const { selectedBeds } = useReservation();

  const selectedBed = selectedBeds.find(({ name }) => name === user.name);
  const selectedBedName = selectedBed
    ? replaceCamelCaseWithSpaces(selectedBed.bedName)
    : '--';

  const { name, unit, additionalInformation, category } = cabin;
  const hasAdditionalInformation =
    additionalInformation && additionalInformation.length > 0;

  return (
    <div className={styles.summaryContainer}>
      <p>
        <span className={styles.left}>Name:</span>
        <span className={styles.right}>{user.name}</span>
      </p>
      <p>
        <span className={styles.left}>Cabin:</span>
        <span className={styles.right}>{name}</span>
      </p>
      <p>
        <span className={styles.left}>Unit:</span>
        <span className={styles.right}>{unit}</span>
      </p>
      {category?.length && (
        <p>
          <span className={styles.left}>Category:</span>
          <span className={styles.right}>{category[0]}</span>
        </p>
      )}
      {showBedSelection && (
        <p>
          <span className={styles.left}>Bed:</span>
          <span className={styles.right}>{selectedBedName}</span>
        </p>
      )}

      {hasAdditionalInformation && (
        <div className={styles.additionalInformationContainer}>
          <p className={styles.additionalInformationTitle}>
            Additional information:
          </p>
          <ul className={styles.additionalInformationList}>
            {additionalInformation.map(detail => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
