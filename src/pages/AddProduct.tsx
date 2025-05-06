
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductFormContainer from "@/components/products/add/ProductFormContainer";
import ProductFormHeader from "@/components/products/add/ProductFormHeader";

const AddProduct = () => {
  const [activeTab, setActiveTab] = useState<"category" | "product">("category");
  
  const handleContinueToProduct = () => {
    setActiveTab("product");
  };
  
  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <ProductFormHeader />
        
        <Card className="p-6 mt-6 shadow-lg border-t-4 border-primary">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "category" | "product")}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="category" disabled={activeTab === "product"}>
                1. اختيار التصنيف
              </TabsTrigger>
              <TabsTrigger value="product" disabled={activeTab === "category"}>
                2. تفاصيل المنتج
              </TabsTrigger>
            </TabsList>
            
            <ProductFormContainer 
              activeTab={activeTab} 
              onContinueToProduct={handleContinueToProduct} 
            />
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AddProduct;
