
import { AnimatedBackground } from "@/components/auth/AnimatedBackground";
import LoadingState from "@/components/store/LoadingState";
import FeedbackContainer from "@/components/feedback/FeedbackContainer";
import FeedbackHeader from "@/components/feedback/FeedbackHeader";
import FeedbackList from "@/components/feedback/FeedbackList";
import { useFeedback } from "@/hooks/feedback/useFeedback";

const Feedback = () => {
  const { feedback, isLoading, markAsResolved } = useFeedback();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen w-full overflow-hidden relative flex items-center justify-center">
      {/* خلفية متحركة */}
      <AnimatedBackground />
      
      <FeedbackContainer>
        <FeedbackHeader />
        <FeedbackList 
          feedback={feedback}
          onResolve={markAsResolved}
        />
      </FeedbackContainer>
    </div>
  );
};

export default Feedback;
