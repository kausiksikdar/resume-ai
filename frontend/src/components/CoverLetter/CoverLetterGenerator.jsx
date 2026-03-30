import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaSpinner, FaSearch, FaSave, FaDownload } from 'react-icons/fa';
import { useNotifications } from '../../context/NotificationContext';
import { semanticSearch, generateCoverLetter, saveCoverLetter } from '../../services/api';
import SearchResults from '../SemanticSearch/SearchResults';
import { SkeletonSearchResult } from '../Common/Skeleton';
import toast from 'react-hot-toast';

const CoverLetterGenerator = () => {
  const { showNotification } = useNotifications();
  const [jobDescription, setJobDescription] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [saved, setSaved] = useState(false);
  const [customName, setCustomName] = useState('');
  const [description, setDescription] = useState('');

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
    setCustomName('');
    setDescription('');
    try {
      const result = await generateCoverLetter(selectedResume.id, jobDescription);
      const letterText = result.coverLetter || result;
      setCoverLetter(letterText);
      toast.success('Cover letter generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!coverLetter) {
      toast.error('No cover letter to save. Please generate first.');
      return;
    }
    if (!selectedResume) {
      toast.error('No resume selected');
      return;
    }

    setSaving(true);
    try {
      await saveCoverLetter({
        resumeId: selectedResume.id,
        jobDescriptionText: jobDescription,
        coverLetter: coverLetter,
        customName: customName.trim() || null,
        description: description.trim()
      });
      setSaved(true);
      showNotification('Cover letter saved successfully!', 'success');
      toast.success('Cover letter saved!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save cover letter');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter);
      toast.success('Copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FaEnvelope className="text-indigo-600 dark:text-indigo-400" />
          <span className="text-gray-800 dark:text-gray-200">Cover Letter Generator</span>
        </h2>

        <div className="space-y-4">
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
            className="input-field bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            placeholder="Paste the job description to generate a personalized cover letter..."
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {searching ? <FaSpinner className="animate-spin" /> : <FaSearch />}
            Find Matching Resumes
          </button>
        </div>
      </motion.div>

      {/* Skeleton while searching */}
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

      {/* Actual search results */}
      {searchResults.length > 0 && (
        <SearchResults
          results={searchResults}
          onSelectResume={setSelectedResume}
          selectedId={selectedResume?.id}
        />
      )}

      {selectedResume && (
        <motion.div className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
            {loading ? <FaSpinner className="animate-spin" /> : <FaEnvelope />}
            {loading ? 'Generating...' : 'Generate Cover Letter'}
          </button>
        </motion.div>
      )}

      {/* Skeleton while generating */}
      {loading && !coverLetter && (
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

      {coverLetter && (
        <motion.div className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Generated Cover Letter</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopyToClipboard}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-1 text-sm"
              >
                <FaDownload size={12} /> Copy
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
              placeholder="e.g., Cover Letter - Google"
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
              placeholder="e.g., For Senior Frontend position"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg whitespace-pre-wrap max-h-96 overflow-auto text-gray-800 dark:text-gray-200">
            {coverLetter}
          </div>

          {saved && (
            <div className="mt-3 text-sm text-green-600 dark:text-green-400 text-center">
              ✓ Cover letter saved to your dashboard
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default CoverLetterGenerator;