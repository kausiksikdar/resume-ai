import axios from 'axios';

// Use localhost directly for development
const API_BASE_URL = 'http://localhost:3000';

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true, // Important for cookies!
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response error:', error.message);
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - Cannot connect to server. Make sure backend is running on', API_BASE_URL);
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== Resume Routes ====================
// Based on your resumeRoutes: /resume/upload, /resume/search, /resume/user, /resume/:id

export const uploadResume = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('resume', file);
  
  const response = await api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });
  return response.data;
};

export const semanticSearch = async (query, limit = 10) => {
  try {
    console.log('Sending search request:', { query, limit });
    
    const response = await api.post('/resume/search', { 
      query: query,
      limit: limit 
    });
    
    console.log('Search response:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('Search API error:', error.response?.data || error.message);
    
    // Return empty array on error
    return [];
  }
};

export const getUserResumes = async () => {
  const response = await api.get('/resume/user');
  return response.data;
};

export const getResumeById = async (id) => {
  const response = await api.get(`/resume/${id}`);
  return response.data;
};

export const deleteResume = async (id) => {
  const response = await api.delete(`/resume/${id}`);
  return response.data;
};

// ==================== AI Routes ====================
// Based on your aiRoutes: /ai/resume-tailor, /ai/cover-letter, /ai/interview, /ai/rejection

// Resume Tailoring
export const generateTailoredResume = async (resumeId, jobDescriptionText) => {
  const response = await api.post('/ai/resume-tailor/generate', { resumeId, jobDescriptionText });
  return response.data;
};

export const saveTailoredResume = async (data) => {
  const response = await api.post('/ai/resume-tailor', data);
  return response.data;
};

export const getTailoredResumes = async () => {
  const response = await api.get('/ai/resume-tailor');
  return response.data;
};

export const getTailoredResumeById = async (id) => {
  const response = await api.get(`/ai/resume-tailor/${id}`);
  return response.data;
};

export const deleteTailoredResume = async (id) => {
  const response = await api.delete(`/ai/resume-tailor/${id}`);
  return response.data;
};

// Cover Letter
export const generateCoverLetter = async (resumeId, jobDescriptionText) => {
  const response = await api.post('/ai/cover-letter/generate', { resumeId, jobDescriptionText });
  return response.data;
};

export const saveCoverLetter = async (data) => {
  const response = await api.post('/ai/cover-letter', data);
  return response.data;
};

export const getCoverLetters = async () => {
  const response = await api.get('/ai/cover-letter');
  return response.data;
};

export const getCoverLetterById = async (id) => {
  const response = await api.get(`/ai/cover-letter/${id}`);
  return response.data;
};

export const deleteCoverLetter = async (id) => {
  const response = await api.delete(`/ai/cover-letter/${id}`);
  return response.data;
};

// Interview Insights
export const generateInterviewInsights = async (resumeId, jobDescriptionText) => {
  const response = await api.post('/ai/interview/generate', { resumeId, jobDescriptionText });
  return response.data;
};

export const saveInterview = async (data) => {
  const response = await api.post('/ai/interview', data);
  return response.data;
};

export const getInterviews = async () => {
  const response = await api.get('/ai/interview');
  return response.data;
};

export const getInterviewById = async (id) => {
  const response = await api.get(`/ai/interview/${id}`);
  return response.data;
};

export const deleteInterview = async (id) => {
  const response = await api.delete(`/ai/interview/${id}`);
  return response.data;
};

export const getJobs = async () => {
  const response = await api.get('/jobs');
  return response.data;
};

export const saveJob = async (jobData) => {
  const response = await api.post('/jobs', jobData);
  return response.data;
};

export const deleteJob = async (id) => {
  const response = await api.delete(`/jobs/${id}`);
  return response.data;
};

export const matchJobs = async (resumeId) => {
  const response = await api.post('/jobs/match', { resumeId });
  return response.data;
};

// ==================== Helper Functions ====================

export const testConnection = async () => {
  try {
    const response = await api.get('/auth/me');
    console.log('API connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('API connection failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Alias for getResumes to match component expectations
export const getResumes = getUserResumes;

// Alias for deleteDocument to handle different types
export const deleteDocument = async (type, id) => {
  switch (type) {
    case 'tailored':
      return deleteTailoredResume(id);
    case 'coverLetters':
      return deleteCoverLetter(id);
    case 'insights':
      return deleteInterview(id);
    case 'analyses':
      return deleteRejection(id);
    default:
      throw new Error('Invalid document type');
  }
};

export default api;