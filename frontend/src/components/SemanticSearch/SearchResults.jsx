import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEye, FaCheckCircle, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getResumeById } from '../../services/api';

const SearchResults = ({ results, onSelectResume, selectedId }) => {
  const [viewingResume, setViewingResume] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    if (score >= 0.6) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
  };

  const handleViewResume = async (result) => {
    setLoadingContent(true);
    try {
      const resumeId = result._id || result.id;
      console.log('Fetching resume:', resumeId);
      const resume = await getResumeById(resumeId);
      setViewingResume(resume);
    } catch (error) {
      console.error('Error fetching resume:', error);
      toast.error('Failed to load resume content');
    } finally {
      setLoadingContent(false);
    }
  };

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <>
      <motion.div className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          Search Results ({results.length})
        </h3>
        
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4 text-sm">
          <p className="text-blue-700 dark:text-blue-300">
            📊 Found {results.length} matching resume{results.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="space-y-4">
          {results.map((result, index) => (
            <motion.div
              key={result._id || result.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`border rounded-lg p-4 transition-all ${
                selectedId === (result._id || result.id) 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                  : 'border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                      {result.originalFileName || result.filename || 'Untitled Resume'}
                    </h4>
                    {result.score && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(result.score)}`}>
                        {(result.score * 100).toFixed(1)}% Match
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">
                    {result.extractedText?.substring(0, 250) || result.content?.substring(0, 250) || 'No content preview available'}
                  </p>
                  {result.createdAt && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      Uploaded: {new Date(result.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 mt-3">
                {onSelectResume && (
                  <button
                    onClick={() => onSelectResume({
                      ...result, 
                      id: result._id || result.id,
                      filename: result.originalFileName || result.filename,
                      content: result.extractedText || result.content
                    })}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                      selectedId === (result._id || result.id)
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {selectedId === (result._id || result.id) ? (
                      <>
                        <FaCheckCircle /> Selected
                      </>
                    ) : (
                      'Select Resume'
                    )}
                  </button>
                )}
                <button
                  onClick={() => handleViewResume(result)}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center gap-2 transition-all"
                >
                  <FaEye /> Quick View
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
        {results.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>💡 Tip: Select a resume to use it for tailoring, cover letters, or analysis</p>
          </div>
        )}
      </motion.div>

      {/* View Modal */}
      {viewingResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[80vh] flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {viewingResume.originalFileName || 'Resume Details'}
              </h3>
              <button
                onClick={() => setViewingResume(null)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loadingContent ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300">
                  {viewingResume.extractedText || 'No content available'}
                </pre>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default SearchResults;