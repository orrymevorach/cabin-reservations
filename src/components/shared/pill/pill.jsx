import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './pill.module.scss';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';

export default function Pill({
  showInfoIcon = false,
  handleClick = () => {},
  children,
  isGold = false,
  classNames = {},
}) {
  const className = clsx({
    [styles.pill]: true,
    [styles.gold]: isGold,
  });
  return (
    <button onClick={handleClick} className={clsx(classNames, className)}>
      {showInfoIcon && (
        <FontAwesomeIcon
          icon={faInfoCircle}
          className={styles.infoIcon}
          color="#2f2f2f"
          size="lg"
        />
      )}
      {children}
    </button>
  );
}
