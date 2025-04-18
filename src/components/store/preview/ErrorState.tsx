
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

interface ErrorStateProps {
  error: string;
  showHomeButton?: boolean;
}

export const ErrorState = ({ error, showHomeButton = true }: ErrorStateProps) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Alert variant="destructive" className="max-w-lg mx-auto">
        <AlertTitle className="text-right mb-2">خطأ</AlertTitle>
        <AlertDescription className="text-right">{error}</AlertDescription>
        
        {showHomeButton && (
          <div className="mt-4 flex justify-center">
            <Link to="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                العودة للصفحة الرئيسية
              </Button>
            </Link>
          </div>
        )}
      </Alert>
    </div>
  );
};

export default ErrorState;
