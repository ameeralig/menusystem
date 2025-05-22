
import { motion } from "framer-motion";
import { PropsWithChildren } from "react";

const FeedbackContainer = ({ children }: PropsWithChildren) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      className="w-full max-w-4xl z-10 px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        whileHover={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)" }}
      >
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FeedbackContainer;
