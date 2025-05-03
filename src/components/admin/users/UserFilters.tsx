
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface UserFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  fetchUsers: () => void;
  showPendingOnly: boolean;
  setShowPendingOnly: (show: boolean) => void;
}

const UserFilters = ({ 
  searchQuery, 
  setSearchQuery, 
  isLoading, 
  fetchUsers, 
  showPendingOnly, 
  setShowPendingOnly 
}: UserFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <div className="relative w-full md:w-1/2">
        <Search className="absolute top-3 right-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="البحث حسب البريد الإلكتروني أو اسم المتجر أو رقم الهاتف..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="py-2 pl-3 pr-10"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchUsers}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          {isLoading ? <Spinner className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
          تحديث
        </Button>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Label htmlFor="show-pending" className="cursor-pointer flex items-center gap-1">
            عرض المعلقين فقط
          </Label>
          <Switch 
            id="show-pending" 
            checked={showPendingOnly}
            onCheckedChange={setShowPendingOnly}
          />
        </div>
      </div>
    </div>
  );
};

export default UserFilters;
