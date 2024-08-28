import React, { useState, useContext, useEffect } from 'react';
import styles from './sidebar.module.scss';
import { VisibleSectionContext } from '@/context/visible-section-context';
import clsx from 'clsx';
import { useCabinAndUnitData } from '@/context/cabin-and-unit-data-context';
import Filters from '../filters/filters';
import { FILTERS, useFilters } from '../filters/filters-context';
import { sortAndFilterUnits } from '../units/units';
import Button from '@/components/shared/button/button';

function useShowSidebar({ mainSectionRef, setIsSidebarShowing }) {
  useEffect(() => {
    const bottomOfMainSection = mainSectionRef?.current?.clientHeight;
    const handleScroll = () => {
      const hasScrolledPassedMainSection =
        window.scrollY > bottomOfMainSection - 1;
      if (!bottomOfMainSection || hasScrolledPassedMainSection) {
        setIsSidebarShowing(true);
      } else {
        setIsSidebarShowing(false);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mainSectionRef, setIsSidebarShowing]);
}

export default function Sidebar({ mainSectionRef }) {
  const [isSidebarShowing, setIsSidebarShowing] = useState(false);
  const { sectionInViewport } = useContext(VisibleSectionContext);
  useShowSidebar({ mainSectionRef, setIsSidebarShowing });
  const { units } = useCabinAndUnitData();

  const { selectedFilters } = useFilters();
  const { UNIT } = FILTERS;
  const unitFilter = selectedFilters[UNIT];
  const sortedUnits = sortAndFilterUnits({
    unitData: units,
    unitFilter,
    selectedFilters,
  });

  const scrollToTop = () => window.scrollTo(0, 0);

  return (
    <>
      {isSidebarShowing && (
        <nav className={clsx(styles.sidebar, styles.slideIn)}>
          <ul className={styles.sectionsList}>
            <p className={styles.unitTitle}>Go to Unit:</p>
            {sortedUnits.map(({ name }) => {
              return (
                <li key={`sidebar-${name}`}>
                  <a
                    className={clsx(
                      styles['list-item'],
                      sectionInViewport === name ? styles.active : ''
                    )}
                    href={`#${name}`}
                  >
                    {name}
                  </a>
                </li>
              );
            })}
          </ul>
          <Filters isColumn classNames={styles.filters} hideUnitFilter />
          <Button handleClick={scrollToTop} classNames={styles.backToTop}>
            Back to top
          </Button>
        </nav>
      )}
    </>
  );
}
