
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// استخدام التحميل البطيء للمكون الرئيسي
const EditProductContainer = lazy(() => 
  import("@/components/products/edit/EditProductContainer")
);

const EditProduct = () => {
  return (
    <Suspense fallback={
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-12 w-3/4 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-36" />
            <Skeleton className="h-12" />
          </div>
        </div>
      </div>
    }>
      <EditProductContainer />
    </Suspense>
  );
};

export default EditProduct;
