
import EditProductContainer from "@/components/products/edit/EditProductContainer";
import { useEffect } from "react";
import { Helmet } from "react-helmet";

const EditProduct = () => {
  useEffect(() => {
    // التمرير لأعلى الصفحة عند تحميلها
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>تعديل المنتجات</title>
      </Helmet>
      <EditProductContainer />
    </>
  );
};

export default EditProduct;
