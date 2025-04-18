
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ErrorStateProps {
  error: string;
}

export const ErrorState = ({ error }: ErrorStateProps) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Alert variant="destructive" className="max-w-lg mx-auto">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </div>
  );
};

export default ErrorState;
