import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEmployees } from "@/hooks/employees/useEmployees";
import EmployeesList from "./EmployeesList";
import AddEmployeeDialog from "./AddEmployeeDialog";

const EmployeesTab = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { employees, isLoading, addEmployee, updateEmployee, deleteEmployee, toggleEmployeeStatus } = useEmployees();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>إدارة الموظفين</CardTitle>
            <CardDescription>
              قم بإضافة وإدارة موظفي المتجر الخاص بك
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة موظف
          </Button>
        </CardHeader>
        <CardContent>
          <EmployeesList
            employees={employees}
            isLoading={isLoading}
            onToggleStatus={toggleEmployeeStatus}
            onDelete={deleteEmployee}
          />
        </CardContent>
      </Card>

      <AddEmployeeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={addEmployee}
      />
    </div>
  );
};

export default EmployeesTab;
