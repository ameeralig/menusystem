
import { FC } from "react";
import { Helmet } from "react-helmet";

interface SeoHelmetProps {
  title: string;
  description: string;
  type?: string;
}

const SeoHelmet: FC<SeoHelmetProps> = ({ title, description, type = "website" }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
    </Helmet>
  );
};

export default SeoHelmet;
