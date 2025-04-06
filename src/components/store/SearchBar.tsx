
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormEvent, useState } from "react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar = ({ searchQuery, setSearchQuery }: SearchBarProps) => {
  const [inputValue, setInputValue] = useState(searchQuery);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSearchQuery(inputValue);
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-md mx-auto mb-8">
      <div className="flex items-center">
        <Input
          type="text"
          placeholder="ابحث عن طبق..."
          className="w-full pl-4 pr-10 py-2 text-right rounded-r-md rounded-l-none border-l-0"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <Button 
          type="submit" 
          variant="default" 
          size="icon"
          className="rounded-l-md rounded-r-none h-10 w-10 flex items-center justify-center"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
