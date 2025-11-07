import { cn } from "@/lib/utils";
import BookLoader from "@/components/ui/book-loader";

interface LoadingStateProps {
  className?: string;
}

const LoadingState = ({ className }: LoadingStateProps) => {
  return (
    <div className={cn("container mx-auto py-4 px-3 md:py-8 md:px-6", className)}>
      <div className="flex justify-center items-center min-h-[300px]">
        <BookLoader size="md" />
      </div>
    </div>
  );
};

export default LoadingState;
