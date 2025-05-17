
import { FC } from "react";
import { Helmet } from "react-helmet-async";

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
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
    </Helmet>
  );
};

export default SeoHelmet;
