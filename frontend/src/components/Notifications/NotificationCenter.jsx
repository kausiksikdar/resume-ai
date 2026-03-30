import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import { useNotifications } from '../../context/NotificationContext';

const NotificationCenter = ({ onClose }) => {
  const { notifications, removeNotification } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-500" />;
      case 'error':
        return <FaExclamationCircle className="text-red-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-96 bg-white rounded-lg shadow-xl border border-gray-200"
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-semibold text-gray-800">Notifications</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <FaTimes />
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-4 border-b hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                {getIcon(notification.type)}
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default NotificationCenter;