
import { useParams } from "react-router-dom";
import EditProductContainer from "@/components/products/edit/EditProductContainer";

const EditProduct = () => {
  // تأكد من أن معرف المنتج متوفر في الراوتر
  const { productId } = useParams<{ productId: string }>();
  
  return <EditProductContainer />;
};

export default EditProduct;
