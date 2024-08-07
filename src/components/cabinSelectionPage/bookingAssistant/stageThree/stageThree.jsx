import Button from '@/components/shared/button/button';
import Radio from '@/components/shared/radio/radio';
import styles from './stageThree.module.scss';
import { useFilters } from '../../filters/filters-context';
import { useCabinCategories } from '@/context/cabin-categories';

const CabinCategory = ({ category, handleChange }) => {
  const label = category.new ? (
    <>
      {category.name} <span className={styles.new}>New this year!</span>
    </>
  ) : (
    category.name
  );
  return (
    <div className={styles.radioContainer}>
      <Radio
        id={category.name}
        label={label}
        handleChange={() => handleChange({ value: category.name })}
        classNames={styles.radio}
        name="cabinCategory"
      />
      <p className={styles.description}>{category.shortDescription}</p>
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
    setStage(4);
  };
  return (
    <>
      <p className={styles.title}>I want to live in a cabin that is...</p>
      <form action="#" className={styles.stageThree}>
        {cabinCategories.map(category => (
          <CabinCategory
            key={`checkbox-${category.name}`}
            category={category}
            handleChange={handleAddFilter}
          />
        ))}
      </form>
    </>
  );
}
