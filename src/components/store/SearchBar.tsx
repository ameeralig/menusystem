
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  query?: string;
  searchQuery?: string;
  onQueryChange?: (query: string) => void;
  setSearchQuery?: (query: string) => void;
  onToggleSearch?: () => void;
  showSearch?: boolean;
}

const SearchBar = ({ 
  query,
  searchQuery, 
  onQueryChange,
  setSearchQuery,
  onToggleSearch,
  showSearch
}: SearchBarProps) => {
  // يتم استخدام كلاً من query/onQueryChange أو searchQuery/setSearchQuery حسب المكون الأب
  const currentQuery = query || searchQuery || "";
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onQueryChange) onQueryChange(e.target.value);
    if (setSearchQuery) setSearchQuery(e.target.value);
  };

  return (
    <div className="relative max-w-md mx-auto mb-8">
      <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder="ابحث عن طبق..."
        className="w-full pl-4 pr-10 py-2 text-right"
        value={currentQuery}
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchBar;
