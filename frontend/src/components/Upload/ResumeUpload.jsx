import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  FaCloudUploadAlt, 
  FaTimes, 
  FaFileAlt,
  FaTrash,
  FaUpload,
  FaSpinner,
  FaFilePdf,
  FaFileWord,
  FaEye
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { uploadResume, getUserResumes, deleteResume, getResumeById } from '../../services/api';
import { SkeletonResumeItem } from '../Common/Skeleton';

const ResumeUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedResumes, setUploadedResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [viewingResume, setViewingResume] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    loadUploadedResumes(true); // initial load with skeleton
  }, []);

  const loadUploadedResumes = async (showSkeleton = false) => {
    if (showSkeleton) setLoadingResumes(true);
    try {
      const resumes = await getUserResumes();
      if (Array.isArray(resumes)) {
        setUploadedResumes(resumes);
      } else {
        setUploadedResumes([]);
        toast.error('Invalid response format');
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
      toast.error('Failed to load uploaded resumes');
      setUploadedResumes([]);
    } finally {
      if (showSkeleton) setLoadingResumes(false);
    }
  };

  const handleViewResume = async (resumeId) => {
    setLoadingContent(true);
    try {
      const resume = await getResumeById(resumeId);
      setViewingResume(resume);
    } catch (error) {
      console.error('Error fetching resume:', error);
      toast.error('Failed to load resume content');
    } finally {
      setLoadingContent(false);
    }
  };

  const getFileIcon = (url) => {
    if (!url) return <FaFileAlt className="text-gray-500 dark:text-gray-400" />;
    const urlLower = url.toLowerCase();
    if (urlLower.includes('.pdf')) return <FaFilePdf className="text-red-500 dark:text-red-400 text-xl" />;
    if (urlLower.includes('.docx')) return <FaFileWord className="text-blue-500 dark:text-blue-400 text-xl" />;
    return <FaFileAlt className="text-gray-500 dark:text-gray-400 text-xl" />;
  };

  const getFilenameFromUrl = (url) => {
    if (!url) return 'Unknown Resume';
    try {
      const parts = url.split('/');
      let filename = parts[parts.length - 1];
      filename = filename.split('?')[0];
      filename = filename.replace(/^\d+-/, '');
      return decodeURIComponent(filename);
    } catch (error) {
      return 'Resume File';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Recent';
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (!validTypes.includes(file.type)) {
      toast.error('Only PDF, DOCX, and TXT files are supported');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      const result = await uploadResume(file, (progress) => {
        setUploadProgress(progress);
      });
      
      // Optimistically add the new resume to the list
      const newResume = {
        _id: result.id || result._id,
        cloudinaryUrl: result.cloudinaryUrl,
        createdAt: result.createdAt || new Date(),
        originalFileName: result.originalFileName || file.name
      };
      setUploadedResumes(prev => [newResume, ...prev]);
      
      setUploadedFile({ name: file.name, id: newResume._id, size: file.size });
      toast.success(`Resume "${file.name}" uploaded successfully!`);
      
      setTimeout(() => setUploadedFile(null), 3000);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const handleDeleteResume = async (id, filename) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"?`)) return;
    
    // Optimistically remove from UI
    const previousResumes = [...uploadedResumes];
    setUploadedResumes(prev => prev.filter(r => (r._id || r.id) !== id));
    setDeleting(id);
    
    try {
      await deleteResume(id);
      toast.success(`Resume deleted successfully`);
    } catch (error) {
      console.error('Delete error:', error);
      // Rollback
      setUploadedResumes(previousResumes);
      toast.error('Failed to delete resume');
    } finally {
      setDeleting(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  return (
    <div className="space-y-6">
      {/* Upload Section (unchanged) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FaCloudUploadAlt className="text-indigo-600 dark:text-indigo-400" />
          <span className="text-gray-800 dark:text-gray-200">Upload Resume</span>
        </h2>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
        >
          <input {...getInputProps()} />
          <FaCloudUploadAlt className={`text-5xl mx-auto mb-4 ${isDragActive ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} />
          {isDragActive ? (
            <p className="text-indigo-600 dark:text-indigo-400 font-medium">Drop your resume here...</p>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-400 mb-2">Drag & drop your resume here, or click to browse</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Supports PDF, DOCX, TXT (Max 10MB)</p>
              <button className="mt-4 btn-primary inline-flex items-center gap-2">
                <FaUpload /> Select File
              </button>
            </>
          )}
        </div>

        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploading...</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {uploadedFile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-green-700 dark:text-green-400 font-medium">{uploadedFile.name}</p>
                <p className="text-xs text-green-600 dark:text-green-500">Upload successful!</p>
              </div>
              <button
                onClick={() => setUploadedFile(null)}
                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
              >
                <FaTimes />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Uploaded Resumes List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FaFileAlt className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-gray-800 dark:text-gray-200">Uploaded Resumes</span>
            <span className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full ml-2">
              {uploadedResumes.length} total
            </span>
          </h2>
          <button
            onClick={() => loadUploadedResumes(true)}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm flex items-center gap-1"
          >
            <FaSpinner className={loadingResumes ? "animate-spin" : ""} size={12} />
            Refresh
          </button>
        </div>

        {loadingResumes ? (
          <div className="grid grid-cols-1 gap-3">
            {[1, 2, 3].map((i) => (
              <SkeletonResumeItem key={i} />
            ))}
          </div>
        ) : uploadedResumes.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FaFileAlt className="text-5xl mx-auto mb-3 opacity-50" />
            <p className="font-medium">No resumes uploaded yet</p>
            <p className="text-sm mt-1">Upload your first resume using the form above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {uploadedResumes.map((resume, index) => {
              const resumeId = resume._id;
              const filename = getFilenameFromUrl(resume.cloudinaryUrl);
              
              return (
                <motion.div
                  key={resumeId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:shadow-md transition-all group border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-2xl">
                        {getFileIcon(resume.cloudinaryUrl)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800 dark:text-gray-200">
                          {filename}
                        </h3>
                        <div className="flex flex-wrap gap-3 mt-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {resumeId.substring(0, 8)}...
                          </p>
                          {resume.createdAt && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {formatDate(resume.createdAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewResume(resumeId)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                        title="View resume"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleDeleteResume(resumeId, filename)}
                        disabled={deleting === resumeId}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg disabled:opacity-50"
                        title="Delete resume"
                      >
                        {deleting === resumeId ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Resume View Modal (unchanged) */}
      {viewingResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[80vh] flex flex-col"
          >
            {/* ... modal content (unchanged) ... */}
          </motion.div>
        </div>
      )}

      {/* Instructions (unchanged) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
      >
        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 How it works:</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
          <li>Upload your resume (PDF, DOCX, or TXT format, max 10MB)</li>
          <li>The system extracts text and creates embeddings for semantic search</li>
          <li>Your resume is stored in Cloudinary, MongoDB, and Qdrant</li>
          <li>Click the 👁️ icon to view resume content and details</li>
          <li>Use the Semantic Search page to find matching resumes</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default ResumeUpload;