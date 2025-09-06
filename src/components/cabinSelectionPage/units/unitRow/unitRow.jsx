import styles from './unitRow.module.scss';
import Image from 'next/image';
import CabinList from './cabinList/cabinList';
import { useWindowSize } from '@/context/window-size-context';
import Takeover from '@/components/shared/takeover/takeover';
import { useContext, useEffect, useRef, useState } from 'react';
import Button from '@/components/shared/button/button';
import { VisibleSectionContext } from '@/context/visible-section-context';
import useIsVisible from '@/hooks/useIsVisible';

export default function UnitRow({ unitData }) {
  const [showTakeover, setShowTakeover] = useState(false);
  const [hasAvailability, setHasAvailability] = useState(true);
  const unitName = unitData.name;
  const unitImage =
    unitData.image && unitData.image[0] && unitData.image[0].thumbnails.large;

  const { isDesktop } = useWindowSize();

  const ref = useRef();
  const isVisible = useIsVisible(ref);
  const { setSectionInViewport } = useContext(VisibleSectionContext);

  useEffect(() => {
    if (isVisible) setSectionInViewport(unitData.name);
  }, [isVisible, setSectionInViewport, unitData.name]);

  return (
    <div id={unitName} className={styles.outerContainer} ref={ref}>
      <div className={styles.innerContainer}>
        <div className={styles.unitTitleContainer}>
          <p className={styles.unitName}>{unitName}</p>
          {!isDesktop && (
            <>
              <Button
                classNames={styles.showMapButton}
                handleClick={() => setShowTakeover(true)}
                isInverted
                isSmall
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
              src={unitImage?.url}
              width={unitImage?.width}
              height={unitImage?.height}
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
