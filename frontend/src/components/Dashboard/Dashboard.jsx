import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaFileAlt, 
  FaEnvelope, 
  FaLightbulb, 
  FaChartLine,
  FaEye,
  FaTrash,
  FaSpinner
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  getTailoredResumes, 
  getCoverLetters, 
  getInterviews, 
  deleteTailoredResume,
  deleteCoverLetter,
  deleteInterview,
} from '../../services/api';
import ScoreCard from '../Common/ScoreCard';
import Modal from '../Common/Modal';
import { SkeletonDocumentCard } from '../Common/Skeleton';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('tailored');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [stats, setStats] = useState({
    tailored: 0,
    coverLetters: 0,
    insights: 0,
  });

  const tabs = [
    { id: 'tailored', name: 'Resume Tailoring', icon: FaFileAlt, color: 'indigo' },
    { id: 'coverLetters', name: 'Cover Letters', icon: FaEnvelope, color: 'green' },
    { id: 'insights', name: 'Interview Insights', icon: FaLightbulb, color: 'yellow' },
  ];

  useEffect(() => {
    loadDocuments();
    loadAllStats();
  }, [activeTab]);

  const extractArray = (response) => {
    if (Array.isArray(response)) return response;
    if (response && Array.isArray(response.data)) return response.data;
    return [];
  };

  const loadAllStats = async () => {
    try {
      const [tailored, coverLettersRes, insights] = await Promise.all([
        getTailoredResumes().catch(() => []),
        getCoverLetters().catch(() => []),
        getInterviews().catch(() => []),
      ]);
      
      const tailoredCount = extractArray(tailored).length;
      const coverLettersCount = extractArray(coverLettersRes).length;
      const insightsCount = extractArray(insights).length;
      
      setStats({
        tailored: tailoredCount,
        coverLetters: coverLettersCount,
        insights: insightsCount,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadDocuments = async () => {
    setLoading(true);
    try {
      let response;
      switch (activeTab) {
        case 'tailored':
          response = await getTailoredResumes();
          break;
        case 'coverLetters':
          response = await getCoverLetters();
          break;
        case 'insights':
          response = await getInterviews();
          break;
        default:
          response = [];
      }
      const documentsArray = extractArray(response);
      console.log(`Loaded ${documentsArray.length} documents for tab ${activeTab}`);
      setDocuments(documentsArray);
    } catch (error) {
      console.error('Error loading documents:', error);
      showNotification('Failed to load documents', 'error');
      toast.error('Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      switch (activeTab) {
        case 'tailored':
          await deleteTailoredResume(id);
          break;
        case 'coverLetters':
          await deleteCoverLetter(id);
          break;
        case 'insights':
          await deleteInterview(id);
          break;
      }
      showNotification('Document deleted successfully', 'success');
      toast.success('Document deleted');
      loadDocuments();
      loadAllStats();
    } catch (error) {
      console.error('Error deleting document:', error);
      showNotification('Failed to delete document', 'error');
      toast.error('Failed to delete');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  };

  const getDisplayTitle = (doc) => {
    if (!doc) return 'Document Details';
    if ((activeTab === 'tailored' || activeTab === 'coverLetters' || activeTab === 'insights') && doc.name) {
      return doc.name;
    }
    return doc.jobTitle || doc.position || 'Untitled';
  };

  const getDisplayDescription = (doc) => {
    if (!doc) return '';
    if ((activeTab === 'tailored' || activeTab === 'coverLetters' || activeTab === 'insights') && doc.description) {
      return doc.description;
    }
    if (activeTab === 'insights' && doc.questions) {
      return `${doc.questions.length} interview questions`;
    }
    return doc.jobDescription?.substring(0, 200) || 'No description';
  };

  const getQuestionTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'technical': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'behavioral': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'system_design': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner (kept as is – gradient works in both modes) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white"
      >
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="text-indigo-100">
          Here's an overview of your AI-powered career documents
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tabs.map((tab) => (
          <motion.div
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            className="card p-4 cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            onClick={() => setActiveTab(tab.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{tab.name}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats[tab.id]}</p>
              </div>
              <div className={`bg-${tab.color}-100 dark:bg-${tab.color}-900/30 p-3 rounded-lg`}>
                <tab.icon className={`text-${tab.color}-600 dark:text-${tab.color}-400 text-xl`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Documents List Card */}
      <div className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            {tabs.find(t => t.id === activeTab)?.name}
          </h2>
          <button onClick={loadDocuments} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonDocumentCard key={i} />
            ))}
          </div>
        ) : !Array.isArray(documents) ? (
          <div className="text-center py-12 text-red-500">
            <p>Error: Invalid data format</p>
            <p className="text-sm mt-2">Expected array but got {typeof documents}</p>
            <button onClick={loadDocuments} className="mt-4 btn-secondary">
              Try Again
            </button>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>No documents found</p>
            <p className="text-sm mt-2">
              Generate your first {tabs.find(t => t.id === activeTab)?.name.toLowerCase()}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc, index) => (
              <motion.div
                key={doc._id || doc.id || index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border rounded-lg p-4 hover:shadow-md transition-all bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">{getDisplayTitle(doc)}</h3>
                      {doc.matchScore && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(doc.matchScore)} dark:opacity-90`}>
                          Match Score: {doc.matchScore}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{getDisplayDescription(doc)}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      Created: {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Recent'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleDelete(doc._id || doc.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal – dark mode classes added */}
      <Modal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc ? getDisplayTitle(selectedDoc) : 'Document Details'}
      >
        {selectedDoc && (
          <div className="space-y-4 text-gray-800 dark:text-gray-200">
            {selectedDoc.matchScore && <ScoreCard score={selectedDoc.matchScore} />}
            
            {selectedDoc.description && (
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Note</h4>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedDoc.description}</p>
              </div>
            )}

            {selectedDoc.jobDescriptionText && (
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Job Description</h4>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedDoc.jobDescriptionText}</p>
              </div>
            )}

            {(selectedDoc.keyChanges?.length > 0 || selectedDoc.suggestions?.length > 0 || selectedDoc.missingSkills?.length > 0) && (
              <div className="border-t dark:border-gray-700 pt-4 mt-2">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Tailoring Analysis</h4>
                {selectedDoc.keyChanges?.length > 0 && (
                  <div className="mb-3">
                    <strong className="text-sm text-gray-700 dark:text-gray-300">Key Changes:</strong>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 ml-2 mt-1">
                      {selectedDoc.keyChanges.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                )}
                {selectedDoc.suggestions?.length > 0 && (
                  <div className="mb-3">
                    <strong className="text-sm text-gray-700 dark:text-gray-300">Suggestions for Improvement:</strong>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 ml-2 mt-1">
                      {selectedDoc.suggestions.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                )}
                {selectedDoc.missingSkills?.length > 0 && (
                  <div>
                    <strong className="text-sm text-gray-700 dark:text-gray-300">Missing Skills:</strong>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 ml-2 mt-1">
                      {selectedDoc.missingSkills.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {selectedDoc.questions && selectedDoc.questions.length > 0 && (
              <div className="border-t dark:border-gray-700 pt-4 mt-2">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Interview Questions</h4>
                <div className="space-y-3">
                  {selectedDoc.questions.map((q, idx) => (
                    <div key={idx} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getQuestionTypeColor(q.type)}`}>
                          {q.type?.toUpperCase() || 'QUESTION'}
                        </span>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200">{q.question}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!selectedDoc.questions && (
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Generated Content</h4>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg whitespace-pre-wrap max-h-96 overflow-auto">
                  {selectedDoc.tailoredResume || 
                   selectedDoc.coverLetter || 
                   selectedDoc.content || 
                   JSON.stringify(selectedDoc.insights || selectedDoc.analysis, null, 2)}
                </div>
              </div>
            )}

            {selectedDoc.insights && (
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Key Insights</h4>
                <ul className="list-disc list-inside space-y-1">
                  {Array.isArray(selectedDoc.insights.strengths) && selectedDoc.insights.strengths.map((insight, i) => (
                    <li key={i} className="text-gray-600 dark:text-gray-400">{insight}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;