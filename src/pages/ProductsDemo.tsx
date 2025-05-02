
import DemoContainer from "@/components/demo/DemoContainer";
import DemoProductsDisplay from "@/components/demo/DemoProductsDisplay";
import DemoSocialIcons from "@/components/demo/DemoSocialIcons";
import { sampleProducts } from "@/components/demo/SampleProductsData";

const ProductsDemo = () => {
  const socialLinks = {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    telegram: "https://t.me"
  };

  return (
    <DemoContainer>
      <DemoProductsDisplay 
        products={sampleProducts} 
        storeName="مطعم نموذجي" 
        colorTheme="default" 
      />
      <DemoSocialIcons socialLinks={socialLinks} />
    </DemoContainer>
  );
};

export default ProductsDemo;
