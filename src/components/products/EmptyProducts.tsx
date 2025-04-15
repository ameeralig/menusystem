
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const EmptyProducts = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="text-center py-4 md:py-6">
      <p className="text-muted-foreground text-sm md:text-base">لا توجد منتجات متاحة للتعديل</p>
      <Button 
        onClick={() => navigate("/add-product")} 
        className="mt-3 md:mt-4"
        size={isMobile ? "sm" : "default"}
      >
        إضافة منتج جديد
      </Button>
    </div>
  );
};

export default EmptyProducts;
