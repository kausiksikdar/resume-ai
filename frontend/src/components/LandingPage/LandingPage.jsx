import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFileAlt, FaSearch, FaMagic, FaEnvelope, FaLightbulb, FaBriefcase } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    { icon: FaFileAlt, title: 'Upload Resume', desc: 'Upload your resume in PDF, DOCX, or TXT format' },
    { icon: FaSearch, title: 'Semantic Search', desc: 'Find matching resumes using natural language' },
    { icon: FaMagic, title: 'Resume Tailoring', desc: 'Tailor your resume to any job description with AI' },
    { icon: FaEnvelope, title: 'Cover Letter', desc: 'Generate personalized cover letters instantly' },
    { icon: FaLightbulb, title: 'Interview Insights', desc: 'Get AI‑generated interview questions' },
    { icon: FaBriefcase, title: 'Job Matcher', desc: 'Match your resume with real‑time job listings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            ResumeAI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Your AI‑powered career companion. Upload, tailor, and match resumes with cutting‑edge semantic search and job recommendations.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started →
          </button>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800">How It Works</h2>
          <p className="text-gray-600 mt-2">A complete suite of AI tools to boost your job search</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="text-indigo-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-indigo-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to supercharge your job search?</h2>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg font-semibold"
          >
            Get Started for Free
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;