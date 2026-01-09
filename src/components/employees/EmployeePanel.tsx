import { Employee } from "@/types/employee";
import EmployeeBottomBar from "./EmployeeBottomBar";

interface EmployeePanelProps {
  employee: Employee;
  onLogout: () => void;
  storeOwnerId: string;
  colorTheme?: string | null;
}

const EmployeePanel = ({ employee, onLogout, storeOwnerId, colorTheme }: EmployeePanelProps) => {
  return (
    <EmployeeBottomBar
      employee={employee}
      onLogout={onLogout}
      storeOwnerId={storeOwnerId}
      colorTheme={colorTheme}
    />
  );
};

export default EmployeePanel;
