import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaFileAlt, 
  FaSearch, 
  FaMagic, 
  FaEnvelope, 
  FaLightbulb, 
  FaBriefcase,
  FaArrowRight,
  FaStar,
  FaUsers,
  FaRocket
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    { icon: FaFileAlt, title: 'Upload Resume', desc: 'Upload your resume in PDF, DOCX, or TXT format', color: 'from-blue-500 to-cyan-500' },
    { icon: FaSearch, title: 'Semantic Search', desc: 'Find matching resumes using natural language', color: 'from-green-500 to-emerald-500' },
    { icon: FaMagic, title: 'Resume Tailoring', desc: 'Tailor your resume to any job description with AI', color: 'from-purple-500 to-pink-500' },
    { icon: FaEnvelope, title: 'Cover Letter', desc: 'Generate personalized cover letters instantly', color: 'from-yellow-500 to-orange-500' },
    { icon: FaLightbulb, title: 'Interview Insights', desc: 'Get AI‑generated interview questions', color: 'from-red-500 to-pink-500' },
    { icon: FaBriefcase, title: 'Job Matcher', desc: 'Match your resume with real‑time job listings', color: 'from-indigo-500 to-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 pt-20 pb-16 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-4 px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
              🚀 AI-Powered Career Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              ResumeAI
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Your AI‑powered career companion. Upload, tailor, and match resumes with cutting‑edge semantic search and job recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg font-semibold text-lg flex items-center gap-2 justify-center"
              >
                Get Started <FaArrowRight />
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-white text-gray-700 rounded-full border border-gray-300 hover:bg-gray-50 transition-all transform hover:scale-105 shadow-md font-semibold text-lg"
              >
                Create Free Account
              </button>
            </div>
          </motion.div>

          {/* Simple mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              <div className="bg-gray-100 px-4 py-3 border-b flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="ml-2 text-sm text-gray-500">ResumeAI Dashboard</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <FaFileAlt className="text-indigo-600 text-xl" />
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-48"></div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-indigo-700">Tailored Resume</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">92% match</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className="w-[92%] h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <p className="text-xs text-gray-500">Optimized for Senior Frontend Developer</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-green-700">Cover Letter</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Ready</span>
                    </div>
                    <p className="text-xs text-gray-500">Generated based on your resume and job description</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-indigo-600">5000+</div>
            <p className="text-gray-600 mt-1">Resumes Processed</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-indigo-600">1000+</div>
            <p className="text-gray-600 mt-1">Jobs Matched</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-indigo-600">98%</div>
            <p className="text-gray-600 mt-1">User Satisfaction</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-indigo-600">24/7</div>
            <p className="text-gray-600 mt-1">AI Availability</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Powerful Features</h2>
          <p className="text-gray-600 mt-2 text-lg">Everything you need to succeed</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-5 shadow-md`}>
                <feature.icon className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 bg-gray-50 rounded-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">How It Works</h2>
          <p className="text-gray-600 mt-2 text-lg">Simple steps to supercharge your job search</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: FaFileAlt, title: 'Upload Resume', desc: 'Upload your resume in any format' },
            { icon: FaSearch, title: 'Search Jobs', desc: 'Find relevant job descriptions' },
            { icon: FaMagic, title: 'AI Tailoring', desc: 'Get personalized resume & cover letter' },
            { icon: FaRocket, title: 'Apply & Succeed', desc: 'Land your dream job faster' },
          ].map((step, idx) => (
            <div key={idx} className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <step.icon className="text-indigo-600 text-2xl" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{step.title}</h3>
              <p className="text-sm text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">What Users Say</h2>
          <p className="text-gray-600 mt-2 text-lg">Trusted by job seekers worldwide</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Sarah Chen', role: 'Product Manager', text: 'ResumeAI helped me tailor my resume for a senior role. Landed interviews at top tech companies!' },
            { name: 'Michael Rodriguez', role: 'Software Engineer', text: 'The semantic search is incredible. Found job matches I would have never discovered otherwise.' },
            { name: 'Priya Patel', role: 'Marketing Specialist', text: 'Cover letter generator saved me hours. The AI suggestions were spot on.' },
          ].map((testimonial, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex text-yellow-400 mb-3">
                {[...Array(5)].map((_, i) => <FaStar key={i} size={14} className="fill-current" />)}
              </div>
              <p className="text-gray-600 italic mb-4">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-bold">{testimonial.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{testimonial.name}</p>
                  <p className="text-xs text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to transform your job search?</h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of successful job seekers who found their dream roles with ResumeAI.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-white text-indigo-600 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg font-semibold text-lg inline-flex items-center gap-2"
          >
            Get Started for Free <FaArrowRight />
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;