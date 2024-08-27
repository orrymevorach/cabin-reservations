import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import styles from './button.module.scss';
import Link from 'next/link';
import clsx from 'clsx';

const ButtonContents = ({ isLoading, children }) => {
  return (
    <>
      {isLoading ? (
        <FontAwesomeIcon icon={faSpinner} className={styles.spinnerIcon} />
      ) : (
        children
      )}
    </>
  );
};

export default function Button({
  children,
  isLoading = false,
  isDisabled = false,
  href = null,
  handleClick = null,
  classNames = '',
  isLight = false,
  isAnchor = false,
  isSmall = false,
  isInverted = false,
}) {
  const classnames = clsx(
    styles.button,
    classNames,
    isLight && styles.light,
    isSmall && styles.small,
    isInverted && styles.inverted,
    isDisabled && styles.disabled
  );

  if (isAnchor) {
    return (
      <a href={href} className={classnames}>
        {children}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className={classnames}>
        {children}
      </Link>
    );
  }
  if (handleClick) {
    return (
      <button
        className={classnames}
        disabled={isDisabled}
        onClick={handleClick}
      >
        <ButtonContents isLoading={isLoading}>{children}</ButtonContents>
      </button>
    );
  }
  return (
    <button className={classnames} type="submit" disabled={isDisabled}>
      <ButtonContents isLoading={isLoading}>{children}</ButtonContents>
    </button>
  );
}
