
import { Image } from "lucide-react";

const CoverImagePlaceholder = () => {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center">
      <Image className="h-10 w-10 mx-auto text-gray-400" />
      <p className="mt-2 text-sm text-gray-500">
        قم بإضافة صورة غلاف للمتجر
      </p>
    </div>
  );
};

export default CoverImagePlaceholder;
