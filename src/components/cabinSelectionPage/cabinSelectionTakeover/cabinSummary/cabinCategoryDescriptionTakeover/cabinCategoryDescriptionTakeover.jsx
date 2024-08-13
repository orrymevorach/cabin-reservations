import Takeover from '@/components/shared/takeover/takeover';
import CabinCategories from '@/components/cabinSelectionPage/cabinCategories/cabinCategories';
import styles from './cabinCategoryDescriptionTakeover.module.scss';

export default function CabinCategoryDescriptionTakeover({
  setShowCategoryDescription,
}) {
  return (
    <Takeover
      handleClose={() => setShowCategoryDescription(false)}
      modalClassNames={styles.modal}
    >
      <CabinCategories
        hideRadioButtons
        fullDescription
        title="Cabin Categories:"
      />
    </Takeover>
  );
}
