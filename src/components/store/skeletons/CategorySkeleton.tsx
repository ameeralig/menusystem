import { Skeleton } from "@/components/ui/skeleton";

const CategorySkeleton = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div 
          key={i} 
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border"
        >
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
};

export default CategorySkeleton;
