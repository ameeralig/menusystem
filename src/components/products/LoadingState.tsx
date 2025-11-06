
import { cn } from "@/lib/utils";
import { EyesLoader } from "@/components/ui/eyes-loader";

interface LoadingStateProps {
  className?: string;
}

const LoadingState = ({ className }: LoadingStateProps) => {
  return (
    <div className={cn("container mx-auto py-4 px-3 md:py-8 md:px-6", className)}>
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="text-center space-y-6">
          <EyesLoader size="lg" className="mx-auto" />
          <p className="text-muted-foreground">جاري تحميل المنتجات...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
