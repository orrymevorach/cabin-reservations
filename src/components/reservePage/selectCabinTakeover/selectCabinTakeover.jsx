import Button from '@/components/shared/button/button';
import Takeover from '@/components/shared/takeover/takeover';
import { ROUTES } from '@/utils/constants';
import styles from './selectCabinTakeover.module.scss';

export default function SelectCabinTakeover() {
  return (
    <Takeover hideCloseButton>
      <p className={styles.text}>
        Please select a cabin in order to complete your reservation.
      </p>

      <Button href={ROUTES.CABIN_SELECTION}>Go to Cabin Selection</Button>
    </Takeover>
  );
}
