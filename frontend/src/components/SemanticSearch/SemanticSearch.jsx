import React, { useState, useEffect } from 'react';
import { FaSearch, FaSpinner, FaDatabase, FaExclamationTriangle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { semanticSearch, getUserResumes } from '../../services/api';
import SearchResults from './SearchResults';
import { SkeletonSearchResult } from '../Common/Skeleton';
import { useGeneration } from '../../context/GenerationContext';
import toast from 'react-hot-toast';

const SemanticSearch = () => {
  const { searchData, setSearchData, clearSearch } = useGeneration();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resumeCount, setResumeCount] = useState(0);

  // Restore from context on mount
  useEffect(() => {
    if (searchData) {
      setQuery(searchData.query);
      setResults(searchData.results);
    }
  }, [searchData]);

  useEffect(() => {
    checkResumeCount();
  }, []);

  const checkResumeCount = async () => {
    try {
      const resumes = await getUserResumes();
      setResumeCount(resumes.length);
      if (resumes.length === 0) {
        toast('No resumes uploaded yet. Please upload some resumes first!', {
          icon: '📄',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error checking resumes:', error);
      toast.error('Cannot connect to backend. Please check if server is running');
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    if (resumeCount === 0) {
      toast.error('No resumes available. Please upload resumes first!');
      return;
    }

    setLoading(true);
    setResults([]);
    try {
      console.log('Searching with query:', query);
      const data = await semanticSearch(query, 10);
      console.log('Search results received:', data);
      
      if (Array.isArray(data)) {
        setResults(data);
        // Save to context (overwrites previous search)
        setSearchData({ query, results: data });
        if (data.length === 0) {
          toast('No matching resumes found. Try a different query.', {
            icon: '🔍',
            duration: 5000,
          });
        } else {
          toast.success(`Found ${data.length} matching resumes`);
        }
      } else {
        console.error('Expected array but got:', typeof data);
        setResults([]);
        toast.error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Search error details:', error);
      setResults([]);
      toast.error('Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
        <div className="flex items-center gap-2">
          <FaDatabase className="text-blue-500 dark:text-blue-400" />
          <span className="text-blue-700 dark:text-blue-300">
            {resumeCount} resume(s) available for search
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FaSearch className="text-indigo-600 dark:text-indigo-400" />
          <span className="text-gray-800 dark:text-gray-200">Resume Search</span>
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Describe the ideal candidate
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={4}
              className="input-field bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              placeholder="Example: Looking for a senior software engineer with 5+ years of Python experience, strong background in machine learning, and leadership skills..."
            />
          </div>
          
          <button
            onClick={handleSearch}
            disabled={loading || resumeCount === 0}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaSearch />
            )}
            {loading ? 'Searching...' : 'Search Resumes'}
          </button>
        </div>
      </motion.div>

      {/* Show skeleton while loading and no results yet */}
      {loading && results.length === 0 && (
        <div className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Searching...</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonSearchResult key={i} />
            ))}
          </div>
        </div>
      )}

      {results.length > 0 && <SearchResults results={results} />}

      {results.length === 0 && !loading && query && (
        <div className="card p-12 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <FaSearch className="text-5xl text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Results Found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try using different keywords or upload more resumes to get better matches.
          </p>
        </div>
      )}
    </div>
  );
};

export default SemanticSearch;