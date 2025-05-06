
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ProductFormHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-l from-primary to-primary/70 bg-clip-text text-transparent">
          إضافة منتج جديد
        </h1>
        <p className="text-muted-foreground mt-2">
          أضف منتجًا جديدًا إلى متجرك بسهولة وسرعة
        </p>
      </div>
      
      <Button 
        variant="outline" 
        onClick={() => navigate("/dashboard")} 
        className="flex items-center gap-2"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى لوحة التحكم
      </Button>
    </div>
  );
};

export default ProductFormHeader;
