
interface EmptyCategoryMessageProps {
  searchQuery?: string;
  selectedCategory?: string | null;
}

const EmptyCategoryMessage = ({ searchQuery, selectedCategory }: EmptyCategoryMessageProps) => {
  if (searchQuery) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          لم يتم العثور على منتجات تطابق "{searchQuery}"
        </p>
      </div>
    );
  }

  if (selectedCategory) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          لا توجد منتجات في تصنيف "{selectedCategory}"
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-10">
      <p className="text-lg text-gray-600 dark:text-gray-400">
        لا توجد منتجات متاحة
      </p>
    </div>
  );
};

export default EmptyCategoryMessage;
