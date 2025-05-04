
import EditProductContainer from "@/components/products/edit/EditProductContainer";
import { useEffect } from "react";

const EditProduct = () => {
  useEffect(() => {
    // التمرير لأعلى الصفحة عند تحميلها
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <title>تعديل المنتجات</title>
      <EditProductContainer />
    </>
  );
};

export default EditProduct;
