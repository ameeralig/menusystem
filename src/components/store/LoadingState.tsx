import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  progress?: number;
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  progress, 
  message = "جاري تحميل المتجر..." 
}) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm">{message}</p>
        
        {progress !== undefined && progress > 0 && (
          <div className="w-48 bg-muted rounded-full h-1.5 overflow-hidden">
            <motion.div 
              className="bg-primary h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LoadingState;
