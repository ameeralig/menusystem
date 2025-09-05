
import { FC } from "react";
import { Helmet } from "react-helmet-async";

interface SeoHelmetProps {
  title: string;
  description: string;
  type?: string;
  keywords?: string;
  canonicalUrl?: string;
  imageUrl?: string;
}

const SeoHelmet: FC<SeoHelmetProps> = ({ 
  title, 
  description, 
  type = "website",
  keywords,
  canonicalUrl,
  imageUrl = "https://qrmenuc.com/og-image.png"
}) => {
  const fullTitle = title.includes("qrmenuc.com") ? title : `${title} | QR Menu - qrmenuc.com`;
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="QR Menu - qrmenuc.com" />
      <meta property="og:locale" content="ar_SA" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
    </Helmet>
  );
};

export default SeoHelmet;
