import Takeover from '@/components/shared/takeover';
import styles from './unitDescriptions.module.scss';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const unitDescriptions = [
  {
    unit: 'Colour Unit',
    description:
      'With cabin names based on the colours of the rainbow, the Colour Unit is close by to the Main Stage, Omni Stage, and the Dining Hall. Cabins in the Colour Unit have washrooms on the porches of the cabin and shared shower facilities nearby!',
    anchor: 'Colour Unit',
  },
  {
    unit: 'Comic Unit',
    description:
      'With cabin names based on comic characters, the Comic Unit is a short walk away from the Amphitheatre stage and the beautiful waterfront. Cabins in the Comic Unit have washrooms on the porches of the cabins and shared shower facilities nearby!',
    anchor: 'Comic Unit',
  },
  {
    unit: 'Zodiac Unit',
    description:
      'With cabin names based on the Astrological Star, the Zodiac Unit is close by to the Amphitheatre Stage and the beautiful waterfront. Shared washhouses, with stalls, sinks, and showers are a short walk away from the cabins in the Zodiac Unit! ',
    anchor: 'Zodiac Unit',
  },
  {
    unit: 'Seeker Unit',
    description:
      'With cabin names not related to the unit name, the Seeker Unit is a short walk away from the Main Stage, Omni Stage, and the Dining Hall. Shared washhouses, with stalls, sinks, and showers are a short walk away from the cabins in the Seeker Unit!',
    anchor: 'Seeker Unit',
  },
];

const UnitsDescriptionTakeover = ({ setShowUnitDescriptions }) => {
  return (
    <Takeover
      handleClose={() => setShowUnitDescriptions(false)}
      queryParam="unitDescriptions"
    >
      <ul className={styles.instructions}>
        {unitDescriptions.map(({ unit, description, anchor }) => {
          return (
            <li key={unit} className={styles.listItem}>
              <p className={styles.unitName}>The {unit}</p>
              <p className={styles.description}>{description}</p>
              <p className={styles.clickHere}>
                <a
                  onClick={() => setShowUnitDescriptions(false)}
                  href={`#${anchor}`}
                  className={styles.anchor}
                >
                  Click here
                </a>{' '}
                to reserve a spot in the {unit}
              </p>
            </li>
          );
        })}
        <li className={styles.listItem}></li>
        <li className={styles.listItem}></li>
        <li className={styles.listItem}></li>
      </ul>
    </Takeover>
  );
};

export default function UnitDescriptions() {
  const [showUnitDescriptions, setShowUnitDescriptions] = useState(false);
  const router = useRouter();
  // Show unit description takeover if unitDescriptions query param is true
  useEffect(() => {
    if (router?.query?.unitDescriptions === 'true') {
      setShowUnitDescriptions(true);
    }
  }, [router, setShowUnitDescriptions]);
  return (
    <>
      {showUnitDescriptions && (
        <UnitsDescriptionTakeover
          setShowUnitDescriptions={setShowUnitDescriptions}
        />
      )}
      <div className={styles.textContainer}>
        <p className={styles.lineOne}>
          Welcome to the Highlands Music Festival Reservation Platform!
        </p>
        <p className={styles.text}>
          At Highlands, the small villages of cabins around camp are called
          Units.
        </p>
        <p className={styles.text}>
          Below you will see available cabins within each unit. Please follow
          the prompts to select the cabin you desire to book, and eventually a
          bed within a cabin!
        </p>
        <p className={styles.text}>
          To read more about each unit,{' '}
          <span
            onClick={() => setShowUnitDescriptions(!showUnitDescriptions)}
            className={styles.anchor}
          >
            click here.
          </span>
        </p>
      </div>
    </>
  );
}
