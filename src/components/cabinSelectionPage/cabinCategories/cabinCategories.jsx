import Radio from '@/components/shared/radio/radio';
import styles from './cabinCategories.module.scss';
import { useFilters } from '../filters/filters-context';
import { useCabinCategories } from '@/context/cabin-categories';
import clsx from 'clsx';

const CabinCategory = ({
  category,
  handleChange,
  hideRadioButtons,
  fullDescription = false,
}) => {
  const label = category.new ? (
    <>
      {category.name} <span className={styles.new}>New this year!</span>
    </>
  ) : (
    category.name
  );

  const description = fullDescription
    ? category.fullDescription
    : category.shortDescription;

  return (
    <div className={styles.radioContainer}>
      {hideRadioButtons ? (
        <p className={styles.radio}>{label}</p>
      ) : (
        <Radio
          id={category.name}
          label={label}
          handleChange={() => handleChange({ value: category.name })}
          classNames={styles.radio}
          name="cabinCategory"
        />
      )}
      <p
        className={clsx(
          styles.description,
          hideRadioButtons && styles.descriptionNoRadio
        )}
      >
        {description}
      </p>
    </div>
  );
};

export default function CabinCategories({
  setStage,
  hideRadioButtons,
  fullDescription,
  title = '',
}) {
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
      {title && <p className={styles.title}>{title}</p>}
      <form action="#" className={styles.stageThree}>
        {cabinCategories?.map(category => (
          <CabinCategory
            key={`checkbox-${category.name}`}
            category={category}
            handleChange={handleAddFilter}
            hideRadioButtons={hideRadioButtons}
            fullDescription={fullDescription}
          />
        ))}
      </form>
    </>
  );
}
