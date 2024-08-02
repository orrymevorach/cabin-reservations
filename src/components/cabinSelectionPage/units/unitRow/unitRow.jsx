import styles from './unitRow.module.scss';
import Image from 'next/image';
import Colours from 'public/Colours-NoBkgd.jpg';
import Comics from 'public/Comics-NoBkgd.jpg';
import Zodiacs from 'public/Zodiacs-NoBkgd.jpg';
import Seekers from 'public/Seekers-NoBkgd.jpg';
import CITS from 'public/cits.jpg';
import lteam from 'public/l-team-NoBkgd.jpg';
import CabinList from './cabinList/cabinList';
import { useWindowSize } from '@/context/window-size-context';
import Takeover from '@/components/shared/takeover/takeover';
import { useState } from 'react';
import Button from '@/components/shared/button/button';
import { UNITS } from '@/utils/constants';

const unitImages = {
  [UNITS.COLOURS]: Colours,
  [UNITS.COMICS]: Comics,
  [UNITS.ZODIACS]: Zodiacs,
  [UNITS.SEEKERS]: Seekers,
  [UNITS.CITS]: CITS,
  [UNITS.LTEAM]: lteam,
};

export default function UnitRow({ unitData }) {
  const [showTakeover, setShowTakeover] = useState(false);
  const [hasAvailability, setHasAvailability] = useState(true);
  const [unitName] = unitData;
  const unitImage = unitImages[unitName];
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
                  <Image
                    src={unitImage}
                    alt={`${unitName} unit`}
                    className={styles.takeoverUnitImage}
                  />
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
          {isDesktop && hasAvailability ? (
            <Image
              src={unitImage}
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
