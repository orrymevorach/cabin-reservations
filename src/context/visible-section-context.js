import React, { createContext, useState } from 'react';

export const VisibleSectionContext = createContext('visibleSection');

export default function VisibleSectionProvider({ children }) {
  const [sectionInViewport, setSectionInViewport] = useState();

  return (
    <VisibleSectionContext.Provider
      value={{ sectionInViewport, setSectionInViewport }}
    >
      {children}
    </VisibleSectionContext.Provider>
  );
}
