
import { motion } from "framer-motion";
import FeedbackCard from "./FeedbackCard";
import EmptyFeedback from "./EmptyFeedback";

interface FeedbackItem {
  id: string;
  visitor_name: string;
  type: string;
  description: string;
  created_at: string;
  status: string;
}

interface FeedbackListProps {
  feedback: FeedbackItem[];
  onResolve: (id: string) => Promise<void>;
}

const FeedbackList = ({ feedback, onResolve }: FeedbackListProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (feedback.length === 0) {
    return <EmptyFeedback />;
  }

  return (
    <motion.div 
      className="space-y-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {feedback.map((item) => (
        <FeedbackCard 
          key={item.id} 
          item={item} 
          onResolve={onResolve}
        />
      ))}
    </motion.div>
  );
};

export default FeedbackList;
