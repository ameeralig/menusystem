
interface StoreRedirectMessageProps {
  storeSlug: string;
}

export const StoreRedirectMessage = ({ storeSlug }: StoreRedirectMessageProps) => {
  const storefrontUrl = `${window.location.protocol}//${storeSlug}.qrmenuc.com`;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Alert className="max-w-lg mx-auto mb-4">
        <AlertDescription className="flex flex-col space-y-2">
          <div>هذا المتجر متاح عبر النطاق الفرعي الخاص به:</div>
          <a 
            href={storefrontUrl} 
            className="text-blue-500 hover:text-blue-700 font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            {storeSlug}.qrmenuc.com
          </a>
          <p className="text-sm text-gray-500 mt-2">
            يرجى استخدام الرابط أعلاه للوصول إلى المتجر.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default StoreRedirectMessage;
