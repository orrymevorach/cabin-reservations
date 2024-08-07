import Button from '@/components/shared/button/button';
import Radio from '@/components/shared/radio/radio';
import styles from './stageThree.module.scss';
import { useFilters } from '../../filters/filters-context';
import { useCabinCategories } from '@/context/cabin-categories';

const CabinCategory = ({ category, handleChange }) => {
  return (
    <div className={styles.radioContainer}>
      <Radio
        id={category.name}
        label={category.name}
        handleChange={() => handleChange({ value: category.name })}
        classNames={styles.radio}
        name="cabinCategory"
      />
      <p className={styles.description}>- {category.shortDescription}</p>
    </div>
  );
};

export default function StageThree({ setStage }) {
  const { cabinCategories } = useCabinCategories();
  const { selectedFilters, setSelectedFilters } = useFilters();

  const handleAddFilter = ({ value }) => {
    const selectedFiltersCopy = Object.assign({}, selectedFilters);
    selectedFiltersCopy.Category = value;
    setSelectedFilters(selectedFiltersCopy);
  };
  return (
    <>
      <p>Select the box that most applies</p>
      <form action="#" className={styles.stageThree}>
        {cabinCategories.map(category => (
          <CabinCategory
            key={`checkbox-${category.name}`}
            category={category}
            handleChange={handleAddFilter}
          />
        ))}

        <Button handleClick={() => setStage(4)}>Continue</Button>
      </form>
    </>
  );
}
