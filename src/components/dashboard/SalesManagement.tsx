import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UtensilsCrossed, BarChart3 } from "lucide-react";
import EmployeesTab from "@/components/employees/EmployeesTab";
import TablesTab from "@/components/employees/TablesTab";
import EmployeeSalesReport from "./EmployeeSalesReport";

const SalesManagement = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">إدارة المبيعات</h2>
        <p className="text-sm text-muted-foreground">إدارة شاملة للموظفين والطاولات وسجلات المبيعات</p>
      </div>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger 
            value="employees"
            className="rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            <Users className="h-4 w-4 ml-2" />
            الموظفين
          </TabsTrigger>
          <TabsTrigger 
            value="tables"
            className="rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            <UtensilsCrossed className="h-4 w-4 ml-2" />
            الطاولات
          </TabsTrigger>
          <TabsTrigger 
            value="sales"
            className="rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            <BarChart3 className="h-4 w-4 ml-2" />
            سجل المبيعات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="mt-0">
          <EmployeesTab />
        </TabsContent>

        <TabsContent value="tables" className="mt-0">
          <TablesTab />
        </TabsContent>

        <TabsContent value="sales" className="mt-0">
          <EmployeeSalesReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesManagement;
