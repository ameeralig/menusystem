
import { FC } from "react";
import { Helmet } from "react-helmet-async";

interface SeoHelmetProps {
  title: string;
  description: string;
  type?: string;
  canonicalUrl?: string;
}

/**
 * مكون لإضافة معلومات SEO للصفحة
 */
const SeoHelmet: FC<SeoHelmetProps> = ({ 
  title, 
  description, 
  type = "website",
  canonicalUrl 
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="theme-color" content="#FFF8F3" />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    </Helmet>
  );
};

export default SeoHelmet;
