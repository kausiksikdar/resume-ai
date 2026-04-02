import React, { createContext, useContext, useState } from 'react';

const GenerationContext = createContext();

export const useGeneration = () => useContext(GenerationContext);

export const GenerationProvider = ({ children }) => {
  const [tailoredData, setTailoredData] = useState(null);   // { content, fullResult }
  const [coverLetterData, setCoverLetterData] = useState(null);
  const [interviewData, setInterviewData] = useState(null);
  const [searchData, setSearchData] = useState(null);       // { query, results }

  const clearTailored = () => setTailoredData(null);
  const clearCoverLetter = () => setCoverLetterData(null);
  const clearInterview = () => setInterviewData(null);
  const clearSearch = () => setSearchData(null);

  return (
    <GenerationContext.Provider
      value={{
        tailoredData,
        setTailoredData,
        coverLetterData,
        setCoverLetterData,
        interviewData,
        setInterviewData,
        searchData,
        setSearchData,
        clearTailored,
        clearCoverLetter,
        clearInterview,
        clearSearch,
      }}
    >
      {children}
    </GenerationContext.Provider>
  );
};