
import React from 'react';
import { motion } from 'framer-motion';

interface LoadingStateProps {
  progress?: number;
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  progress, 
  message = "جاري التحميل..." 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5DEFF] to-white dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center max-w-md mx-auto text-center space-y-4"
      >
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary/40 rounded-full animate-ping"></div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{message}</h2>
          {progress !== undefined && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
              <motion.div 
                className="bg-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{Math.round(progress)}%</p>
            </div>
          )}
          <p className="text-gray-600 dark:text-gray-400">يرجى الانتظار بينما نحضر المحتوى لك</p>
        </div>
        
        <div className="flex space-x-1 justify-center" dir="ltr">
          <motion.div 
            className="w-2 h-2 bg-primary rounded-full"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          />
          <motion.div 
            className="w-2 h-2 bg-primary rounded-full"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div 
            className="w-2 h-2 bg-primary rounded-full"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingState;
