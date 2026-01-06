import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, UtensilsCrossed, Plus, Trash2, UserCheck, UserX, Settings, Package, Edit, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmployees } from "@/hooks/employees/useEmployees";
import { useTables } from "@/hooks/employees/useTables";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Employee } from "@/types/employee";

interface EmployeeManagementCardProps {
  isOpen: boolean;
  onClose: () => void;
  colorTheme?: string | null;
  storeOwnerId: string;
}

const EmployeeManagementCard: React.FC<EmployeeManagementCardProps> = ({
  isOpen,
  onClose,
  colorTheme,
  storeOwnerId,
}) => {
  const { employees, isLoading: employeesLoading, addEmployee, deleteEmployee, toggleEmployeeStatus, updateEmployee } = useEmployees();
  const { tables, isLoading: tablesLoading, addTable, deleteTable } = useTables(storeOwnerId);
  
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddTable, setShowAddTable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmployeeForPermissions, setSelectedEmployeeForPermissions] = useState<Employee | null>(null);
  
  // بيانات الموظف الجديد
  const [employeeForm, setEmployeeForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: ""
  });
  
  // بيانات الطاولة الجديدة
  const [tableForm, setTableForm] = useState({
    table_number: "",
    capacity: "4"
  });

  const getThemeColor = () => {
    if (colorTheme?.startsWith('#')) return colorTheme;
    const themeColors: { [key: string]: string } = {
      coral: '#fb923c',
      purple: '#a855f7',
      blue: '#3b82f6',
      green: '#22c55e',
      red: '#ef4444',
    };
    return themeColors[colorTheme || ''] || '#3b82f6';
  };

  const themeColor = getThemeColor();

  const handleAddEmployee = async () => {
    if (!employeeForm.full_name || !employeeForm.email || !employeeForm.password) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    
    setIsSubmitting(true);
    const success = await addEmployee({
      ...employeeForm,
      is_active: true
    });
    setIsSubmitting(false);
    
    if (success) {
      setEmployeeForm({ full_name: "", email: "", phone: "", password: "" });
      setShowAddEmployee(false);
    }
  };

  const handleAddTable = async () => {
    if (!tableForm.table_number) {
      toast.error("يرجى إدخال رقم الطاولة");
      return;
    }
    
    setIsSubmitting(true);
    const success = await addTable({
      table_number: tableForm.table_number,
      capacity: parseInt(tableForm.capacity) || 4
    });
    setIsSubmitting(false);
    
    if (success) {
      setTableForm({ table_number: "", capacity: "4" });
      setShowAddTable(false);
    }
  };

  const handlePermissionChange = async (emp: Employee, permission: 'can_add_products' | 'can_edit_products' | 'can_delete_products', value: boolean) => {
    await updateEmployee(emp.id, { [permission]: value });
  };

  if (!isOpen) return null;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* الخلفية الضبابية */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 backdrop-blur-md bg-black/40"
          />

          {/* البطاقة العائمة */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-lg max-h-[85vh] overflow-hidden">
              {/* زر الإغلاق */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center text-white shadow-lg"
              >
                <X className="w-5 h-5" />
              </motion.button>

              {/* البطاقة الزجاجية */}
              <div 
                className="rounded-3xl overflow-hidden shadow-2xl border border-white/20"
                style={{
                  background: `linear-gradient(135deg, ${themeColor}ee, ${themeColor}cc)`,
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* تأثير الإضاءة العلوي */}
                <div 
                  className="absolute top-0 left-0 right-0 h-32 opacity-30 pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
                  }}
                />

                {/* محتوى البطاقة */}
                <div className="relative p-6 text-white">
                  {/* العنوان */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6"
                  >
                    <div className="mx-auto mb-3 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold">إدارة الموظفين والطاولات</h2>
                    <p className="text-white/70 text-sm mt-1">
                      {employees.length} موظف • {tables.length} طاولة
                    </p>
                  </motion.div>

                  {/* التبويبات */}
                  <Tabs defaultValue="employees" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 bg-white/10 backdrop-blur p-1 rounded-xl">
                      <TabsTrigger 
                        value="employees"
                        className="rounded-lg text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
                      >
                        <Users className="h-4 w-4 ml-2" />
                        الموظفين
                      </TabsTrigger>
                      <TabsTrigger 
                        value="tables"
                        className="rounded-lg text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
                      >
                        <UtensilsCrossed className="h-4 w-4 ml-2" />
                        الطاولات
                      </TabsTrigger>
                    </TabsList>

                    {/* تبويب الموظفين */}
                    <TabsContent value="employees" className="mt-0 max-h-[45vh] overflow-y-auto">
                      {/* زر إضافة موظف */}
                      <Button
                        onClick={() => setShowAddEmployee(!showAddEmployee)}
                        className="w-full mb-4 bg-white/20 hover:bg-white/30 text-white border-0"
                      >
                        <Plus className="h-4 w-4 ml-2" />
                        إضافة موظف جديد
                      </Button>

                      {/* نموذج إضافة موظف */}
                      <AnimatePresence>
                        {showAddEmployee && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 p-4 rounded-xl bg-white/10 backdrop-blur space-y-3"
                          >
                            <div>
                              <Label className="text-white/80 text-sm">الاسم الكامل *</Label>
                              <Input
                                value={employeeForm.full_name}
                                onChange={(e) => setEmployeeForm({ ...employeeForm, full_name: e.target.value })}
                                className="mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/50"
                                placeholder="اسم الموظف"
                              />
                            </div>
                            <div>
                              <Label className="text-white/80 text-sm">البريد الإلكتروني *</Label>
                              <Input
                                type="email"
                                value={employeeForm.email}
                                onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                                className="mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/50"
                                placeholder="email@example.com"
                                dir="ltr"
                              />
                            </div>
                            <div>
                              <Label className="text-white/80 text-sm">رقم الهاتف</Label>
                              <Input
                                value={employeeForm.phone}
                                onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                                className="mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/50"
                                placeholder="07xx xxx xxxx"
                                dir="ltr"
                              />
                            </div>
                            <div>
                              <Label className="text-white/80 text-sm">كلمة المرور *</Label>
                              <Input
                                type="password"
                                value={employeeForm.password}
                                onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                                className="mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/50"
                                placeholder="********"
                              />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button
                                onClick={handleAddEmployee}
                                disabled={isSubmitting}
                                className="flex-1 bg-green-500 hover:bg-green-600"
                              >
                                {isSubmitting ? <Spinner className="h-4 w-4" /> : "إضافة"}
                              </Button>
                              <Button
                                onClick={() => setShowAddEmployee(false)}
                                variant="outline"
                                className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20"
                              >
                                إلغاء
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* قائمة الموظفين */}
                      {employeesLoading ? (
                        <div className="flex justify-center py-8">
                          <Spinner className="h-6 w-6 text-white" />
                        </div>
                      ) : employees.length === 0 ? (
                        <div className="text-center py-8 text-white/60">
                          <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>لا يوجد موظفين بعد</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {employees.map((emp) => (
                            <motion.div
                              key={emp.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="rounded-xl bg-white/10 backdrop-blur overflow-hidden"
                            >
                              <div className="p-3 flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{emp.full_name}</span>
                                    <Badge 
                                      variant={emp.is_active ? "default" : "secondary"}
                                      className={emp.is_active ? "bg-green-500/80" : "bg-gray-500/50"}
                                    >
                                      {emp.is_active ? "نشط" : "غير نشط"}
                                    </Badge>
                                  </div>
                                  <p className="text-white/60 text-xs mt-1">{emp.email}</p>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedEmployeeForPermissions(
                                      selectedEmployeeForPermissions?.id === emp.id ? null : emp
                                    )}
                                    className="h-8 w-8 text-white hover:bg-white/20"
                                    title="الصلاحيات"
                                  >
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleEmployeeStatus(emp.id, emp.is_active || false)}
                                    className="h-8 w-8 text-white hover:bg-white/20"
                                  >
                                    {emp.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteEmployee(emp.id)}
                                    className="h-8 w-8 text-red-300 hover:bg-red-500/20 hover:text-red-200"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              {/* قسم الصلاحيات */}
                              <AnimatePresence>
                                {selectedEmployeeForPermissions?.id === emp.id && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="px-3 pb-3 border-t border-white/10"
                                  >
                                    <p className="text-white/80 text-xs font-medium py-2">صلاحيات المنتجات:</p>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <Package className="h-3.5 w-3.5 text-green-300" />
                                          <span className="text-xs">إضافة منتجات</span>
                                        </div>
                                        <Switch
                                          checked={emp.can_add_products || false}
                                          onCheckedChange={(checked) => handlePermissionChange(emp, 'can_add_products', checked)}
                                          className="scale-75"
                                        />
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <Edit className="h-3.5 w-3.5 text-blue-300" />
                                          <span className="text-xs">تعديل منتجات</span>
                                        </div>
                                        <Switch
                                          checked={emp.can_edit_products || false}
                                          onCheckedChange={(checked) => handlePermissionChange(emp, 'can_edit_products', checked)}
                                          className="scale-75"
                                        />
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <Trash2 className="h-3.5 w-3.5 text-red-300" />
                                          <span className="text-xs">حذف منتجات</span>
                                        </div>
                                        <Switch
                                          checked={emp.can_delete_products || false}
                                          onCheckedChange={(checked) => handlePermissionChange(emp, 'can_delete_products', checked)}
                                          className="scale-75"
                                        />
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    {/* تبويب الطاولات */}
                    <TabsContent value="tables" className="mt-0 max-h-[45vh] overflow-y-auto">
                      {/* زر إضافة طاولة */}
                      <Button
                        onClick={() => setShowAddTable(!showAddTable)}
                        className="w-full mb-4 bg-white/20 hover:bg-white/30 text-white border-0"
                      >
                        <Plus className="h-4 w-4 ml-2" />
                        إضافة طاولة جديدة
                      </Button>

                      {/* نموذج إضافة طاولة */}
                      <AnimatePresence>
                        {showAddTable && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 p-4 rounded-xl bg-white/10 backdrop-blur space-y-3"
                          >
                            <div>
                              <Label className="text-white/80 text-sm">رقم الطاولة *</Label>
                              <Input
                                value={tableForm.table_number}
                                onChange={(e) => setTableForm({ ...tableForm, table_number: e.target.value })}
                                className="mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/50"
                                placeholder="مثال: A1"
                              />
                            </div>
                            <div>
                              <Label className="text-white/80 text-sm">السعة</Label>
                              <Input
                                type="number"
                                min="1"
                                value={tableForm.capacity}
                                onChange={(e) => setTableForm({ ...tableForm, capacity: e.target.value })}
                                className="mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/50"
                                placeholder="4"
                              />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button
                                onClick={handleAddTable}
                                disabled={isSubmitting}
                                className="flex-1 bg-green-500 hover:bg-green-600"
                              >
                                {isSubmitting ? <Spinner className="h-4 w-4" /> : "إضافة"}
                              </Button>
                              <Button
                                onClick={() => setShowAddTable(false)}
                                variant="outline"
                                className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20"
                              >
                                إلغاء
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* قائمة الطاولات */}
                      {tablesLoading ? (
                        <div className="flex justify-center py-8">
                          <Spinner className="h-6 w-6 text-white" />
                        </div>
                      ) : tables.length === 0 ? (
                        <div className="text-center py-8 text-white/60">
                          <UtensilsCrossed className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>لا يوجد طاولات بعد</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {tables.map((table) => (
                            <motion.div
                              key={table.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="p-3 rounded-xl bg-white/10 backdrop-blur"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-lg">#{table.table_number}</span>
                                <Badge 
                                  variant={table.is_occupied ? "destructive" : "default"}
                                  className={table.is_occupied ? "bg-red-500/80" : "bg-green-500/80"}
                                >
                                  {table.is_occupied ? "مشغولة" : "فارغة"}
                                </Badge>
                              </div>
                              <p className="text-white/60 text-xs mb-2">السعة: {table.capacity} أشخاص</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTable(table.id)}
                                disabled={table.is_occupied}
                                className="w-full h-7 text-xs text-red-300 hover:bg-red-500/20 hover:text-red-200 disabled:opacity-50"
                              >
                                <Trash2 className="h-3 w-3 ml-1" />
                                حذف
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

export default EmployeeManagementCard;
