import { useUser } from '@/context/user-context';
import styles from './reservationSummary.module.scss';
import { useReservation } from '@/context/reservation-context';
import { replaceCamelCaseWithSpaces } from '@/utils/string-utils';
import Pill from '../pill/pill';

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
          <Pill isGold>{category[0]}</Pill>
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
            {additionalInformation
              .filter(detail => detail !== category?.[0])
              .map(detail => (
                <li key={detail}>
                  <Pill classNames={styles.pill}>{detail}</Pill>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
