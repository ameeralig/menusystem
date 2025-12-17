import { Skeleton } from "@/components/ui/skeleton";
import CategorySkeleton from "./CategorySkeleton";

const StoreSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Banner Skeleton */}
      <Skeleton className="w-full h-48 md:h-64 rounded-none" />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Store Name Skeleton */}
        <div className="flex justify-center mb-6">
          <Skeleton className="h-8 w-48" />
        </div>
        
        {/* Contact Info Skeleton */}
        <div className="flex justify-center gap-4 mb-8">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        
        {/* Categories Skeleton */}
        <CategorySkeleton />
      </div>
    </div>
  );
};

export default StoreSkeleton;
