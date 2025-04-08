
import { Button } from "@/components/ui/button";

interface StoreSettingsFormProps {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  children: React.ReactNode;
}

const StoreSettingsForm = ({
  isEditing,
  setIsEditing,
  handleSubmit,
  isLoading,
  children
}: StoreSettingsFormProps) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {children}
      
      {isEditing && (
        <Button 
          type="submit" 
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={isLoading}
        >
          {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      )}
    </form>
  );
};

export default StoreSettingsForm;
