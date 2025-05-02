
import { useState } from "react";
import DemoContainer from "@/components/demo/DemoContainer";
import DemoProductsDisplay from "@/components/demo/DemoProductsDisplay";
import DemoSocialIcons from "@/components/demo/DemoSocialIcons";
import { sampleProducts } from "@/components/demo/SampleProductsData";
import { ThemeProvider } from "@/components/store/ThemeProvider";
import { ThemeToggle } from "@/components/store/ThemeToggle";
import { ThemeMode } from "@/components/store/ThemeProvider";

const ProductsDemo = () => {
  const [theme, setTheme] = useState<ThemeMode>("system");
  const socialLinks = {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    telegram: "https://t.me"
  };

  return (
    <ThemeProvider defaultTheme={theme}>
      <div className="fixed top-4 left-4 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md p-2">
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>
      <DemoContainer>
        <DemoProductsDisplay 
          products={sampleProducts} 
          storeName="مطعم نموذجي" 
          colorTheme="default" 
        />
        <DemoSocialIcons socialLinks={socialLinks} />
      </DemoContainer>
    </ThemeProvider>
  );
};

export default ProductsDemo;
