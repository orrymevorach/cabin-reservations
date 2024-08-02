import styles from './unitRow.module.scss';
import Image from 'next/image';
import CabinList from './cabinList/cabinList';
import { useWindowSize } from '@/context/window-size-context';
import Takeover from '@/components/shared/takeover/takeover';
import { useState } from 'react';
import Button from '@/components/shared/button/button';

export default function UnitRow({ unitData }) {
  const [showTakeover, setShowTakeover] = useState(false);
  const [hasAvailability, setHasAvailability] = useState(true);
  const unitName = unitData.name;
  const unitImage = unitData.image && unitData.image[0];
  const { isDesktop } = useWindowSize();

  return (
    <div id={unitName} className={styles.outerContainer}>
      <div className={styles.innerContainer}>
        <div className={styles.unitTitleContainer}>
          <p className={styles.unitName}>{unitName}</p>
          {!isDesktop && (
            <>
              <Button
                classNames={styles.showMapButton}
                handleClick={() => setShowTakeover(true)}
                isInverted
              >
                Show Map
              </Button>
              {showTakeover && (
                <Takeover handleClose={() => setShowTakeover(false)}>
                  {unitImage && (
                    <Image
                      src={unitImage.url}
                      width={unitImage.width}
                      height={unitImage.height}
                      alt={`${unitName} unit`}
                      className={styles.takeoverUnitImage}
                    />
                  )}
                </Takeover>
              )}
            </>
          )}
        </div>
        <div className={styles.unitContainer}>
          <CabinList
            unitData={unitData}
            setHasAvailability={setHasAvailability}
          />
          {isDesktop && hasAvailability && unitImage ? (
            <Image
              src={unitImage.url}
              width={unitImage.width}
              height={unitImage.height}
              alt={`${unitName} unit`}
              className={styles.unitImage}
            />
          ) : (
            ''
          )}
        </div>
      </div>
    </div>
  );
}
