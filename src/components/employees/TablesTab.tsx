import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTables } from "@/hooks/employees/useTables";
import TablesList from "./TablesList";
import AddTableDialog from "./AddTableDialog";

const TablesTab = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { tables, isLoading, addTable, updateTable, deleteTable } = useTables();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>إدارة الطاولات</CardTitle>
            <CardDescription>
              قم بإضافة وإدارة طاولات المطعم الخاص بك
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة طاولة
          </Button>
        </CardHeader>
        <CardContent>
          <TablesList
            tables={tables}
            isLoading={isLoading}
            onDelete={deleteTable}
          />
        </CardContent>
      </Card>

      <AddTableDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={addTable}
      />
    </div>
  );
};

export default TablesTab;
