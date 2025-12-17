import { Skeleton } from "@/components/ui/skeleton";

interface ProductSkeletonProps {
  count?: number;
}

const ProductSkeleton = ({ count = 6 }: ProductSkeletonProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <div 
          key={i} 
          className="flex flex-col gap-3 p-3 rounded-xl bg-card border border-border overflow-hidden"
        >
          <Skeleton className="w-full aspect-square rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;
