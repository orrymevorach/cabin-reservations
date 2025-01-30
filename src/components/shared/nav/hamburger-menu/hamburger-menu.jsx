import styles from './hamburger-menu.module.scss';
import clsx from 'clsx';

export default function HamburgerMenu({
  isOpen = false,
  setIsOpen,
  hamburgerMenuColor = 'black',
}) {
  const backgroundColor = isOpen ? 'black' : hamburgerMenuColor || 'black';

  return (
    <button
      className={clsx(styles.hamburgerMenu, isOpen ? styles.open : '')}
      onClick={() => setIsOpen(!isOpen)}
    >
      <span style={{ backgroundColor }}></span>
      <span style={{ backgroundColor }}></span>
      <span style={{ backgroundColor }}></span>
      <span style={{ backgroundColor }}></span>
    </button>
  );
}
