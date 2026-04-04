import React, { createContext, useContext, useState } from 'react';

const DocumentChangeContext = createContext();

export const useDocumentChange = () => useContext(DocumentChangeContext);

export const DocumentChangeProvider = ({ children }) => {
  const [hasChanged, setHasChanged] = useState(false);

  const markChanged = () => setHasChanged(true);
  const resetChanged = () => setHasChanged(false);

  return (
    <DocumentChangeContext.Provider value={{ hasChanged, markChanged, resetChanged }}>
      {children}
    </DocumentChangeContext.Provider>
  );
};