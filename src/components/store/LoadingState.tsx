import React from 'react';
import { motion } from 'framer-motion';
import BookLoader from "@/components/ui/book-loader";

interface LoadingStateProps {
  progress?: number;
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  progress, 
  message = "جاري التعرف على المتجر..." 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center max-w-sm mx-auto text-center space-y-6"
      >
        <BookLoader size="md" />
        
        <div className="space-y-3 w-full">
          <h2 className="text-lg font-medium text-foreground">{message}</h2>
          
          {progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-center">
                <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div 
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingState;
