import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaMagic, FaSpinner, FaSearch, FaSave, FaDownload, FaFilePdf } from 'react-icons/fa';
import { useNotifications } from '../../context/NotificationContext';
import { semanticSearch, generateTailoredResume, saveTailoredResume } from '../../services/api';
import SearchResults from '../SemanticSearch/SearchResults';
import { SkeletonSearchResult } from '../Common/Skeleton';
import toast from 'react-hot-toast';
import { exportToPDF } from '../../utils/exportToPDF';

const ResumeTailoring = () => {
  const { showNotification } = useNotifications();
  const [jobDescription, setJobDescription] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [tailoredContent, setTailoredContent] = useState(null);
  const [fullAiResult, setFullAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [saved, setSaved] = useState(false);
  const [customName, setCustomName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    console.log('Tailored content state changed:', tailoredContent);
  }, [tailoredContent]);

  const handleSearch = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }
    setSearching(true);
    try {
      const results = await semanticSearch(jobDescription, 5);
      setSearchResults(results);
      if (results.length === 0) {
        toast('No matching resumes found', { icon: '🔍' });
      } else {
        toast.success(`Found ${results.length} matching resumes`);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search resumes');
    } finally {
      setSearching(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedResume) {
      toast.error('Please select a resume first');
      return;
    }
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }
    setLoading(true);
    setSaved(false);
    setFullAiResult(null);
    setCustomName('');
    setDescription('');
    try {
      const result = await generateTailoredResume(selectedResume.id, jobDescription);
      console.log('Full AI result:', result);
      setFullAiResult(result);
      const tailoredText = result.tailoredResume || result;
      setTailoredContent(tailoredText);
      toast.success('Tailored resume generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate tailored resume');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!tailoredContent) {
      toast.error('No tailored resume to save. Please generate first.');
      return;
    }
    if (!selectedResume) {
      toast.error('No resume selected');
      return;
    }
    setSaving(true);
    try {
      await saveTailoredResume({
        resumeId: selectedResume.id,
        jobDescriptionText: jobDescription,
        tailoredData: {
          tailoredResume: tailoredContent,
          matchScore: fullAiResult?.matchScore,
          keyChanges: fullAiResult?.keyChanges || [],
          suggestions: fullAiResult?.suggestions || [],
          missingSkills: fullAiResult?.missingSkills || []
        },
        customName: customName.trim() || null,
        description: description.trim()
      });
      setSaved(true);
      showNotification('Resume tailored and saved successfully!', 'success');
      toast.success('Resume saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save tailored resume');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (tailoredContent) {
      navigator.clipboard.writeText(tailoredContent);
      toast.success('Copied to clipboard!');
    }
  };

  const handleExportPDF = () => {
    if (tailoredContent) {
      exportToPDF('tailored-resume-content', 'tailored-resume.pdf');
    } else {
      toast.error('No content to export');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FaMagic className="text-indigo-600 dark:text-indigo-400" />
          <span className="text-gray-800 dark:text-gray-200">Resume Tailoring</span>
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              className="input-field bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              placeholder="Paste the job description here..."
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || !jobDescription.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {searching ? <FaSpinner className="animate-spin" /> : <FaSearch />}
            Find Matching Resumes
          </button>
        </div>
      </motion.div>

      {/* Show skeleton while searching */}
      {searching && searchResults.length === 0 && (
        <div className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Searching for matching resumes...</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonSearchResult key={i} />
            ))}
          </div>
        </div>
      )}

      {searchResults.length > 0 && (
        <SearchResults
          results={searchResults}
          onSelectResume={setSelectedResume}
          selectedId={selectedResume?.id}
        />
      )}

      {selectedResume && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Selected Resume</h3>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-4">
            <p className="font-medium text-gray-800 dark:text-gray-200">{selectedResume.filename}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
              {selectedResume.content?.substring(0, 200)}...
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaMagic />}
            {loading ? 'Generating...' : 'Generate Tailored Resume'}
          </button>
        </motion.div>
      )}

      {/* Show skeleton while generating */}
      {loading && !tailoredContent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4 animate-pulse"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4 animate-pulse"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
        </motion.div>
      )}

      {tailoredContent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Tailored Resume</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopyToClipboard}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-1 text-sm"
              >
                <FaDownload size={12} /> Copy
              </button>
              <button
                onClick={handleExportPDF}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-1 text-sm"
              >
                <FaFilePdf size={12} /> PDF
              </button>
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className={`px-3 py-1 rounded-lg flex items-center gap-1 text-sm ${
                  saved
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 cursor-default'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:hover:bg-indigo-500'
                }`}
              >
                {saving ? <FaSpinner className="animate-spin" size={12} /> : saved ? 'Saved ✓' : <><FaSave size={12} /> Save</>}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Save as (name for dashboard)
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="input-field bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              placeholder="e.g., Software Engineer - Google"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Short Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="input-field bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              placeholder="e.g., Tailored for Senior Frontend position at Amazon"
            />
          </div>

          {/* AI Analysis Section */}
          {fullAiResult && (
            <div className="mb-4 space-y-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Tailoring Analysis</h4>
              {fullAiResult.matchScore !== undefined && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Match Score:</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-sm ${getScoreColor(fullAiResult.matchScore)}`}>
                    {fullAiResult.matchScore}%
                  </span>
                </div>
              )}
              {fullAiResult.keyChanges?.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 dark:text-gray-300">Key Changes Made</h5>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-1">
                    {fullAiResult.keyChanges.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
              )}
              {fullAiResult.suggestions?.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 dark:text-gray-300">Suggestions for Improvement</h5>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-1">
                    {fullAiResult.suggestions.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
              )}
              {fullAiResult.missingSkills?.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 dark:text-gray-300">Missing Skills</h5>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-1">
                    {fullAiResult.missingSkills.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Content to export */}
          <div id="tailored-resume-content" className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg whitespace-pre-wrap font-mono text-sm max-h-96 overflow-auto text-gray-800 dark:text-gray-200">
            {tailoredContent}
          </div>

          {saved && (
            <div className="mt-3 text-sm text-green-600 dark:text-green-400 text-center">
              ✓ Resume saved to your dashboard
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ResumeTailoring;