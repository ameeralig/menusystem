import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import EmployeeLoginDialog from "@/components/employees/EmployeeLoginDialog";

interface EmployeeLoginButtonProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
}

const EmployeeLoginButton = ({ onLogin, isLoading }: EmployeeLoginButtonProps) => {
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowLoginDialog(true)}
        className="fixed bottom-6 left-6 z-50 rounded-full shadow-lg hover:shadow-xl transition-all"
        size="lg"
      >
        <UserCircle className="h-5 w-5 ml-2" />
        تسجيل دخول موظف
      </Button>

      <EmployeeLoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onLogin={onLogin}
        isLoading={isLoading}
      />
    </>
  );
};

export default EmployeeLoginButton;
