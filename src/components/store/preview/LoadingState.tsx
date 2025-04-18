
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({ message = "جاري التحميل..." }: LoadingStateProps) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
      <div className="text-lg text-gray-600 dark:text-gray-400">{message}</div>
    </div>
  );
};

export default LoadingState;
