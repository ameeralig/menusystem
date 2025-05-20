
import React from 'react';
import { motion } from 'framer-motion';

const LoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5DEFF] to-white dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="mt-4 text-lg text-gray-600 dark:text-gray-300">جاري التحميل...</div>
      </motion.div>
    </div>
  );
};

export default LoadingState;
