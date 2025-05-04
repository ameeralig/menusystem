
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  className?: string;
  message?: string; // إضافة خاصية الرسالة
}

const LoadingState = ({ className, message = "جاري التحميل..." }: LoadingStateProps) => {
  return (
    <div className={cn("container mx-auto py-4 px-3 md:py-8 md:px-6", className)}>
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="text-center space-y-4">
          <div className="animate-pulse bg-gray-200 h-6 w-48 rounded mx-auto"></div>
          <div className="animate-pulse bg-gray-200 h-4 w-32 rounded mx-auto"></div>
          {message && <p className="text-muted-foreground mt-4">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
