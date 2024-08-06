import Button from '@/components/shared/button/button';
import Radio from '@/components/shared/radio/radio';
import { useState } from 'react';
import styles from './stageThree.module.scss';
import { useFilters } from '../../filters/filters-context';
import { useCabinCategories } from '@/context/cabin-categories';

const CabinCategory = ({ category, handleChange }) => {
  const [showReadMore, setShowReadMore] = useState(false);
  const buttonText = showReadMore ? 'Read less' : 'Read more';
  return (
    <div>
      <Radio
        id={category.name}
        label={category.name}
        handleChange={() => handleChange({ value: category.name })}
      />
      <button onClick={() => setShowReadMore(!showReadMore)}>
        {buttonText}
      </button>
      {showReadMore && <p>{category.description}</p>}
    </div>
  );
};

export default function StageThree({ setStage }) {
  const { cabinCategories } = useCabinCategories();
  const { selectedFilters, setSelectedFilters } = useFilters();

  const handleAddFilter = ({ value }) => {
    const selectedFiltersCopy = Object.assign({}, selectedFilters);
    selectedFiltersCopy.category = value;
    setSelectedFilters(selectedFiltersCopy);
  };
  return (
    <>
      <p>Click the box that most applies</p>
      <form action="#" className={styles.stageThree}>
        {cabinCategories.map(category => (
          <CabinCategory
            key={`checkbox-${category.name}`}
            category={category}
            handleChange={handleAddFilter}
          />
        ))}
        <Radio
          key={`checkbox-none`}
          id="none"
          label="None"
          handleChange={() => {}}
        />

        <Button handleClick={() => setStage(4)}>Continue</Button>
      </form>
    </>
  );
}
