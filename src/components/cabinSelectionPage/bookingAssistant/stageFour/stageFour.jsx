import { useCabinCategories } from '@/context/cabin-categories';
import { useRouter } from 'next/router';
import { useFilters } from '../../filters/filters-context';
import Button from '@/components/shared/button/button';
import styles from './stageFour.module.scss';
import { useCabinSelection } from '@/context/cabin-selection-context';

export default function StageFour({ setStage }) {
  const { cabinCategories } = useCabinCategories();
  const { selectedFilters } = useFilters();
  const { Category: category } = selectedFilters;
  const { dispatch, actions } = useCabinSelection();

  return (
    <div>
      <p className={styles.title}>
        A note about <span className={styles.categoryName}>{category}</span>{' '}
        options:
      </p>
      {cabinCategories.map(({ name, fullDescription }) => {
        if (category === name)
          return (
            <p key={`${name}-description`} className={styles.description}>
              {fullDescription}
            </p>
          );
      })}
      <div className={styles.buttonsContainer}>
        <Button handleClick={() => setStage(3)} classNames={styles.button}>
          Back
        </Button>
        <Button
          handleClick={() =>
            dispatch({ type: actions.CLOSE_BOOKING_ASSISTANT })
          }
        >
          Show me <span className={styles.categoryName}>{category}</span>{' '}
          options
        </Button>
      </div>
    </div>
  );
}
