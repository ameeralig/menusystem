
interface BackButtonProps {
  onClick: () => void;
  colorTheme?: string | null;
}

const BackButton = ({ onClick, colorTheme }: BackButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
    >
      <span>← رجوع إلى التصنيفات</span>
    </button>
  );
};

export default BackButton;
