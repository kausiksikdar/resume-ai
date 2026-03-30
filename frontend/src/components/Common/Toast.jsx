import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ message, type = 'success', onClose }) => {
  const types = {
    success: { icon: FaCheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    error: { icon: FaExclamationCircle, color: 'text-red-500', bg: 'bg-red-50' },
    info: { icon: FaInfoCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
  };
  
  const Icon = types[type].icon;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-4 right-4 z-50 ${types[type].bg} rounded-lg shadow-lg p-4 max-w-md`}
      >
        <div className="flex items-start gap-3">
          <Icon className={`${types[type].color} text-xl mt-0.5`} />
          <div className="flex-1">
            <p className="text-gray-800">{message}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;