
/**
 * مكون تذييل الصفحة القانونية
 * محسن للتجاوب مع جميع أحجام الشاشات
 */
const LegalFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="mt-4 sm:mt-6 md:mt-8 text-center text-xs sm:text-sm text-gray-700">
      &copy; {currentYear} متجرك الرقمي. جميع الحقوق محفوظة.
    </div>
  );
};

export default LegalFooter;
