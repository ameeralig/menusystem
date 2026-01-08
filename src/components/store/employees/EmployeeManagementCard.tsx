import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, UtensilsCrossed, BarChart3, Plus, Trash2, UserCheck, UserX, TrendingUp, DollarSign, ShoppingBag, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmployees } from "@/hooks/employees/useEmployees";
import { useTables } from "@/hooks/employees/useTables";
import { useEmployeeSales } from "@/hooks/employees/useEmployeeSales";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

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
  const { employees, isLoading: employeesLoading, addEmployee, deleteEmployee, toggleEmployeeStatus } = useEmployees();
  const { tables, isLoading: tablesLoading, addTable, deleteTable } = useTables(storeOwnerId);
  const { stats: salesStats, isLoading: salesLoading } = useEmployeeSales(storeOwnerId);
  
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddTable, setShowAddTable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // تحويل بيانات المبيعات للرسم البياني
  const chartData = useMemo(() => {
    // تجميع المبيعات حسب التاريخ
    const salesByDate: Record<string, { date: string; sales: number; orders: number }> = {};
    
    salesStats.dailySales.forEach(sale => {
      if (!salesByDate[sale.sale_date]) {
        salesByDate[sale.sale_date] = { 
          date: format(new Date(sale.sale_date), 'EEE', { locale: ar }),
          sales: 0,
          orders: 0
        };
      }
      salesByDate[sale.sale_date].sales += Number(sale.total_sales);
      salesByDate[sale.sale_date].orders += sale.total_orders;
    });
    
    return Object.values(salesByDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);
  }, [salesStats.dailySales]);

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
                    <TabsList className="grid w-full grid-cols-3 mb-4 bg-white/10 backdrop-blur p-1 rounded-xl">
                      <TabsTrigger 
                        value="employees"
                        className="rounded-lg text-white text-xs data-[state=active]:bg-white/20 data-[state=active]:text-white"
                      >
                        <Users className="h-3 w-3 ml-1" />
                        الموظفين
                      </TabsTrigger>
                      <TabsTrigger 
                        value="tables"
                        className="rounded-lg text-white text-xs data-[state=active]:bg-white/20 data-[state=active]:text-white"
                      >
                        <UtensilsCrossed className="h-3 w-3 ml-1" />
                        الطاولات
                      </TabsTrigger>
                      <TabsTrigger 
                        value="reports"
                        className="rounded-lg text-white text-xs data-[state=active]:bg-white/20 data-[state=active]:text-white"
                      >
                        <BarChart3 className="h-3 w-3 ml-1" />
                        التقارير
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
                              className="p-3 rounded-xl bg-white/10 backdrop-blur flex items-center justify-between"
                            >
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

                    {/* تبويب التقارير */}
                    <TabsContent value="reports" className="mt-0 max-h-[45vh] overflow-y-auto">
                      {salesLoading ? (
                        <div className="flex justify-center py-8">
                          <Spinner className="h-6 w-6 text-white" />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* بطاقات الإحصائيات */}
                          <div className="grid grid-cols-2 gap-2">
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-3 rounded-xl bg-white/10 backdrop-blur text-center"
                            >
                              <DollarSign className="h-6 w-6 mx-auto mb-1 text-green-300" />
                              <p className="text-lg font-bold">{salesStats.totalSales.toLocaleString()}</p>
                              <p className="text-white/60 text-xs">إجمالي المبيعات</p>
                            </motion.div>
                            
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                              className="p-3 rounded-xl bg-white/10 backdrop-blur text-center"
                            >
                              <ShoppingBag className="h-6 w-6 mx-auto mb-1 text-blue-300" />
                              <p className="text-lg font-bold">{salesStats.totalOrders}</p>
                              <p className="text-white/60 text-xs">إجمالي الطلبات</p>
                            </motion.div>
                          </div>

                          {/* أفضل موظف */}
                          {salesStats.topEmployee && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="p-3 rounded-xl bg-gradient-to-r from-amber-500/30 to-yellow-500/30 backdrop-blur flex items-center gap-3"
                            >
                              <div className="w-10 h-10 rounded-full bg-amber-400/30 flex items-center justify-center">
                                <Trophy className="h-5 w-5 text-amber-300" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">أفضل موظف هذا الأسبوع</p>
                                <p className="text-amber-200 text-xs">{salesStats.topEmployee.name}</p>
                              </div>
                              <div className="text-left">
                                <p className="font-bold text-amber-200">{salesStats.topEmployee.sales.toLocaleString()}</p>
                                <p className="text-white/50 text-xs">د.ع</p>
                              </div>
                            </motion.div>
                          )}

                          {/* الرسم البياني */}
                          {chartData.length > 0 ? (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="p-4 rounded-xl bg-white/10 backdrop-blur"
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="h-4 w-4 text-green-300" />
                                <p className="text-sm font-medium">المبيعات اليومية</p>
                              </div>
                              <div className="h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={chartData}>
                                    <XAxis 
                                      dataKey="date" 
                                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
                                      axisLine={false}
                                      tickLine={false}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                      contentStyle={{
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '12px'
                                      }}
                                      formatter={(value: number) => [`${value.toLocaleString()} د.ع`, 'المبيعات']}
                                    />
                                    <Bar 
                                      dataKey="sales" 
                                      fill="rgba(255,255,255,0.6)" 
                                      radius={[4, 4, 0, 0]}
                                    />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </motion.div>
                          ) : (
                            <div className="text-center py-8 text-white/60">
                              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p>لا توجد بيانات مبيعات بعد</p>
                              <p className="text-xs mt-1">ستظهر البيانات بعد إتمام الطلبات</p>
                            </div>
                          )}
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
