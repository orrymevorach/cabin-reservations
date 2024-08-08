import { useState } from 'react';
import styles from './cabinSummary.module.scss';
import { useCabinCategories } from '@/context/cabin-categories';

export default function CabinSummary({
  name,
  additionalInformation = [],
  unit,
  category,
}) {
  const hasAdditionalInformation = additionalInformation?.length > 0;
  const [showReadMore, setShowReadMore] = useState(false);
  const { cabinCategories } = useCabinCategories();
  const categoryName = category && category.length ? category[0] : null;
  const categoryData = categoryName
    ? cabinCategories.find(({ name }) => name === categoryName)
    : null;
  return (
    <div className={styles.summaryContainer}>
      {showReadMore ? (
        <>{categoryData.fullDescription}</>
      ) : (
        <>
          <p className={styles.name}>Cabin {name}</p>
          <p className={styles.description}>
            Cabin {name} is located in the{' '}
            <span className={styles.unit}>{unit}</span> unit.
          </p>
          {categoryName && (
            <div>
              <p className={styles.pill}>{categoryName}</p>
              <button onClick={() => setShowReadMore(true)}>Read more</button>
            </div>
          )}
          {hasAdditionalInformation && (
            <div className={styles.additionalInformationContainer}>
              <p className={styles.additionalInformationTitle}>
                Additonal details:
              </p>
              <ul className={styles.additionalInformationList}>
                {additionalInformation.map(info => {
                  return (
                    <li key={info} className={styles.additionalInformationItem}>
                      {info}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
