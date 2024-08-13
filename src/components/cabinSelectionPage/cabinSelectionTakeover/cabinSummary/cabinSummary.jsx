import { useState } from 'react';
import styles from './cabinSummary.module.scss';
import CabinCategoryDescriptionTakeover from './cabinCategoryDescriptionTakeover/cabinCategoryDescriptionTakeover';

export default function CabinSummary({
  name,
  additionalInformation = [],
  unit,
  category,
}) {
  const hasAdditionalInformation = additionalInformation?.length > 0;
  const [showCategoryDescription, setShowCategoryDescription] = useState(false);
  const categoryName = category && category.length ? category[0] : null;

  return (
    <div className={styles.summaryContainer}>
      {showCategoryDescription && (
        <CabinCategoryDescriptionTakeover
          currentCategoryName={categoryName}
          setShowCategoryDescription={setShowCategoryDescription}
        />
      )}
      <>
        <p className={styles.name}>Cabin {name}</p>
        <div className={styles.pillsContainer}>
          {categoryName && (
            <div className={styles.categoryContainer}>
              <button
                onClick={() => setShowCategoryDescription(true)}
                className={styles.pill}
              >
                {categoryName}
              </button>
            </div>
          )}
        </div>
        <p className={styles.description}>
          Cabin {name} is located in the{' '}
          <span className={styles.unit}>{unit}</span> unit.
        </p>
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
    </div>
  );
}
