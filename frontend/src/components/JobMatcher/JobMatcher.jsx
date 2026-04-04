import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBriefcase, FaSearch, FaSpinner, FaTrash, FaPlus, FaSync } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getUserResumes } from '../../services/api';
import { getJobs, saveJob, deleteJob, matchJobs, fetchExternalJobs, createApplication } from '../../services/api';
import { SkeletonJobItem } from '../Common/Skeleton';
import toast from 'react-hot-toast';

const JobMatcher = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [matching, setMatching] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', company: '', description: '', url: '', location: '' });
  const [searchKeywords, setSearchKeywords] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    loadResumes();
    loadJobs(true);
  }, []);

  const loadResumes = async () => {
    try {
      const data = await getUserResumes();
      setResumes(data);
    } catch (err) {
      toast.error('Failed to load resumes');
    }
  };

  const loadJobs = async (showSkeleton = false) => {
    if (showSkeleton) setLoadingJobs(true);
    try {
      const data = await getJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      if (showSkeleton) setLoadingJobs(false);
    }
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    if (!newJob.title || !newJob.description) {
      toast.error('Title and description are required');
      return;
    }
    const tempId = Date.now().toString();
    const optimisticJob = {
      _id: tempId,
      title: newJob.title,
      company: newJob.company || '',
      description: newJob.description,
      url: newJob.url || '',
      location: newJob.location || '',
      embeddingGenerated: false,
      createdAt: new Date()
    };
    setJobs(prev => [optimisticJob, ...prev]);
    try {
      const result = await saveJob(newJob);
      setJobs(prev => prev.map(job => job._id === tempId ? result : job));
      toast.success('Job added, embedding will be generated soon');
      setNewJob({ title: '', company: '', description: '', url: '', location: '' });
      setShowAddForm(false);
    } catch (err) {
      setJobs(prev => prev.filter(job => job._id !== tempId));
      toast.error('Failed to add job');
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    const previousJobs = [...jobs];
    setJobs(prev => prev.filter(job => job._id !== id));
    try {
      await deleteJob(id);
      toast.success('Job deleted');
    } catch (err) {
      setJobs(previousJobs);
      toast.error('Failed to delete');
    }
  };

  const handleMatch = async () => {
    if (!selectedResumeId) {
      toast.error('Select a resume');
      return;
    }
    setMatching(true);
    try {
      const results = await matchJobs(selectedResumeId);
      setMatches(results);
      if (results.length === 0) toast.info('No matching jobs found');
      else toast.success(`Found ${results.length} matches`);
    } catch (err) {
      toast.error('Matching failed');
    } finally {
      setMatching(false);
    }
  };

  const handleFetchExternalJobs = async () => {
    if (!searchKeywords.trim()) {
      toast.error('Enter job keywords');
      return;
    }
    setIsFetching(true);
    try {
      const response = await fetchExternalJobs(searchKeywords, searchLocation);
      toast.success(response.message);
      loadJobs();
      setSearchKeywords('');
      setSearchLocation('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setIsFetching(false);
    }
  };

 const handleAddToTracker = async (job) => {
  try {
    await createApplication({
      jobTitle: job.title,
      company: job.company,
      jobDescription: job.description,
      url: job.url || '',   
      status: 'Saved',
      notes: `Matched with ${(job.score * 100).toFixed(1)}% similarity`,
    });
    toast.success('Added to Application Tracker');
  } catch (err) {
    console.error('Add to tracker error:', err);
    toast.error(err.response?.data?.message || 'Failed to add to tracker');
  }
};

  return (
    <div className="space-y-6">
      <motion.div className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FaBriefcase className="text-indigo-600 dark:text-indigo-400" />
          <span className="text-gray-800 dark:text-gray-200">Job Matcher</span>
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Add jobs you're interested in. Our system will embed up to 10 jobs per day (Gemini limit) and then match them against your resume.
        </p>

        <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Find New Jobs</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Job title or keywords (e.g., React Developer)"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
              className="input-field flex-1"
            />
            <input
              type="text"
              placeholder="Location (optional, e.g., Bangalore)"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="input-field flex-1"
            />
            <button
              onClick={handleFetchExternalJobs}
              disabled={isFetching}
              className="btn-primary whitespace-nowrap"
            >
              {isFetching ? 'Searching...' : 'Search & Add Jobs'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Powered by JSearch. Free plan: 200 requests/month.</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Resume</label>
          <select
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
            className="input-field bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
          >
            <option value="">-- Choose a resume --</option>
            {resumes.map(r => (
              <option key={r._id} value={r._id}>{r.originalFileName}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleMatch}
          disabled={matching || !selectedResumeId}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {matching ? <FaSpinner className="animate-spin" /> : <FaSearch />}
          {matching ? 'Matching...' : 'Find Matching Jobs'}
        </button>
      </motion.div>

      <div className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">My Jobs</h3>
          <div className="flex gap-2">
            <button
              onClick={() => loadJobs(true)}
              className="btn-secondary flex items-center gap-1 text-sm"
              title="Refresh jobs"
            >
              <FaSync size={12} /> Refresh
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-secondary flex items-center gap-1"
            >
              <FaPlus size={12} /> Add Job
            </button>
          </div>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddJob} className="mb-4 space-y-3 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
            {/* form fields unchanged */}
            <input
              type="text"
              placeholder="Job Title *"
              value={newJob.title}
              onChange={(e) => setNewJob({...newJob, title: e.target.value})}
              className="input-field bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              required
            />
            <input
              type="text"
              placeholder="Company (optional)"
              value={newJob.company}
              onChange={(e) => setNewJob({...newJob, company: e.target.value})}
              className="input-field bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
            <textarea
              placeholder="Job Description *"
              value={newJob.description}
              onChange={(e) => setNewJob({...newJob, description: e.target.value})}
              className="input-field bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              rows={3}
              required
            />
            <input
              type="url"
              placeholder="Application URL (optional)"
              value={newJob.url}
              onChange={(e) => setNewJob({...newJob, url: e.target.value})}
              className="input-field bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Location (optional)"
              value={newJob.location}
              onChange={(e) => setNewJob({...newJob, location: e.target.value})}
              className="input-field bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Save Job</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}

        {loadingJobs ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <SkeletonJobItem key={i} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No jobs added yet. Click "Add Job" to start.</p>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex justify-between items-start bg-white dark:bg-gray-800">
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">{job.title}</h4>
                  {job.company && <p className="text-sm text-gray-600 dark:text-gray-400">{job.company}</p>}
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {job.embeddingGenerated ? '✅ Embedded' : '⏳ Pending embedding'}
                    {job.source === 'jsearch' && <span className="ml-1 text-blue-500">(JSearch)</span>}
                  </p>
                </div>
                <button onClick={() => handleDeleteJob(job._id)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {matching && (
        <div className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Matching Jobs</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
                {/* skeleton content unchanged */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                  <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {matches.length > 0 && !matching && (
        <div className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Matching Jobs</h3>
          <div className="space-y-4">
            {matches.map(job => (
              <div key={job._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">{job.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{job.company}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{job.location}</p>
                  </div>
                  <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-2 py-1 rounded text-sm">
                    {(job.score * 100).toFixed(1)}% match
                  </span>
                </div>
                <p className="mt-2 text-gray-700 dark:text-gray-300 line-clamp-3">{job.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  {job.url && (
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
                      Apply Now →
                    </a>
                  )}
                  <button
                    onClick={() => handleAddToTracker(job)}
                    className="text-sm text-green-600 dark:text-green-400 hover:underline"
                  >
                    Add to Tracker
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobMatcher;