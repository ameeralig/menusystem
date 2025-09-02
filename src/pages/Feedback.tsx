
import { AnimatedBackground } from "@/components/auth/AnimatedBackground";
import LoadingState from "@/components/store/LoadingState";
import FeedbackContainer from "@/components/feedback/FeedbackContainer";
import FeedbackHeader from "@/components/feedback/FeedbackHeader";
import FeedbackList from "@/components/feedback/FeedbackList";
import { Button } from "@/components/ui/button";
import { useFeedback } from "@/hooks/feedback/useFeedback";

const Feedback = () => {
  const { feedback, isLoading, markAsResolved, deleteResolvedFeedback } = useFeedback();
  const resolvedCount = feedback.filter(item => item.status === 'resolved').length;

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen w-full overflow-hidden relative flex items-center justify-center">
      {/* خلفية متحركة */}
      <AnimatedBackground />
      
      <FeedbackContainer>
        <FeedbackHeader />
        
        {/* إضافة زر حذف الملاحظات المحلولة */}
        {resolvedCount > 0 && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  إدارة الملاحظات المحلولة
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  لديك {resolvedCount} ملاحظة محلولة. يمكنك حذفها لتنظيف القائمة.
                </p>
              </div>
              <Button
                onClick={deleteResolvedFeedback}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                حذف الملاحظات المحلولة
              </Button>
            </div>
          </div>
        )}
        
        <FeedbackList 
          feedback={feedback}
          onResolve={markAsResolved}
        />
      </FeedbackContainer>
    </div>
  );
};

export default Feedback;
