import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  FaHome, 
  FaSearch, 
  FaFileAlt, 
  FaEnvelope, 
  FaLightbulb, 
  FaSignOutAlt,
  FaBell,
  FaBars,
  FaUpload,
  FaBriefcase,
  FaKey,
  FaMoon,
  FaSun
} from 'react-icons/fa';
import NotificationCenter from '../Notifications/NotificationCenter';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: FaHome },
    { path: '/upload', name: 'Upload', icon: FaUpload },
    { path: '/semantic-search', name: 'Search', icon: FaSearch },
    { path: '/resume-tailoring', name: 'Tailoring', icon: FaFileAlt },
    { path: '/cover-letter', name: 'Cover Letter', icon: FaEnvelope },
    { path: '/interview-insights', name: 'Insights', icon: FaLightbulb },
    { path: '/job-matcher', name: 'Job Matcher', icon: FaBriefcase },
  ];

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-2 md:px-4">
        <div className="flex justify-between items-center h-12 md:h-14">
          {/* Logo - compact */}
          <Link to="/dashboard" className="flex items-center space-x-1 shrink-0">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-1 rounded-md">
              <FaFileAlt className="text-white text-sm md:text-base" />
            </div>
            <span className="text-sm md:text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ResumeAI
            </span>
          </Link>

          {/* Desktop Navigation - fits all in one line */}
          <div className="hidden md:flex items-center space-x-0.5 lg:space-x-1 xl:space-x-1.5">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-1.5 lg:px-2 py-1 rounded-md transition-all text-xs lg:text-sm whitespace-nowrap ${
                  isActive(item.path)
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon size={12} className="lg:text-sm" />
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Right Section - compact */}
          <div className="flex items-center space-x-1 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-1 text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition-colors"
            >
              {darkMode ? <FaSun size={14} className="md:text-base" /> : <FaMoon size={14} className="md:text-base" />}
            </button>

            {/* Desktop User Actions (compact) */}
            <div className="hidden lg:flex items-center space-x-1">
              <div className="text-right">
                <p className="text-xs text-gray-700 dark:text-gray-200">Hi, {user.name.split(' ')[0]}</p>
              </div>
              <Link
                to="/change-password"
                className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Change Password"
              >
                <FaKey size={12} className="md:text-sm" />
              </Link>
              <button
                onClick={logout}
                className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <FaSignOutAlt size={12} className="md:text-sm" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1 text-gray-600 dark:text-gray-300"
            >
              <FaBars size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Menu (unchanged, but compact) */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t dark:border-gray-700">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${
                  isActive(item.path)
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </Link>
            ))}
            <div className="px-3 py-3 border-t dark:border-gray-700 mt-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Welcome, {user.name}!</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              
              <button
                onClick={toggleDarkMode}
                className="flex items-center space-x-2 px-3 py-2 mt-2 w-full rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {darkMode ? <FaSun size={16} /> : <FaMoon size={16} />}
                <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              <Link
                to="/change-password"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 mt-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaKey size={16} />
                <span>Change Password</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 px-3 py-2 w-full text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg mt-2"
              >
                <FaSignOutAlt size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notification Panel */}
      {notificationsOpen && (
        <div className="absolute right-2 top-12 z-50">
          <NotificationCenter onClose={() => setNotificationsOpen(false)} />
        </div>
      )}
    </nav>
  );
};

export default Navbar;