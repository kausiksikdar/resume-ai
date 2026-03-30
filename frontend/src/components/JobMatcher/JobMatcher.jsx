import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBriefcase, FaSearch, FaSpinner, FaTrash, FaPlus } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getUserResumes } from '../../services/api';
import { getJobs, saveJob, deleteJob, matchJobs } from '../../services/api';
import { SkeletonJobItem } from '../Common/Skeleton';
import toast from 'react-hot-toast';

const JobMatcher = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [matching, setMatching] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', company: '', description: '', url: '', location: '' });

  useEffect(() => {
    loadResumes();
    loadJobs();
  }, []);

  const loadResumes = async () => {
    try {
      const data = await getUserResumes();
      setResumes(data);
    } catch (err) {
      toast.error('Failed to load resumes');
    }
  };

  const loadJobs = async () => {
    setLoadingJobs(true);
    try {
      const data = await getJobs();
      setJobs(data);
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    if (!newJob.title || !newJob.description) {
      toast.error('Title and description are required');
      return;
    }
    try {
      await saveJob(newJob);
      toast.success('Job added, embedding will be generated soon');
      setNewJob({ title: '', company: '', description: '', url: '', location: '' });
      setShowAddForm(false);
      loadJobs();
    } catch (err) {
      toast.error('Failed to add job');
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await deleteJob(id);
      toast.success('Job deleted');
      loadJobs();
    } catch (err) {
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

        {/* Resume selection */}
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

      {/* Add Job Button */}
      <div className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">My Jobs</h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-secondary flex items-center gap-1"
          >
            <FaPlus size={12} /> Add Job
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddJob} className="mb-4 space-y-3 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
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

      {/* Matching Results */}
      {matching && (
        <div className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Matching Jobs</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
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
                {job.url && (
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm mt-2 inline-block">
                    Apply Now →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobMatcher;