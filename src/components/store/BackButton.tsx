
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
  colorTheme?: string | null;
}

const BackButton = ({ onClick, colorTheme }: BackButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed top-2 right-4 z-50 w-12 h-12 bg-white dark:bg-gray-800 shadow-lg rounded-full flex items-center justify-center hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200 dark:border-gray-600"
    >
      <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
    </button>
  );
};

export default BackButton;
