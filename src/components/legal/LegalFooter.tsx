
/**
 * مكون تذييل الصفحة القانونية
 */
const LegalFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="mt-6 sm:mt-8 text-center text-sm text-gray-700">
      &copy; {currentYear} متجرك الرقمي. جميع الحقوق محفوظة.
    </div>
  );
};

export default LegalFooter;
