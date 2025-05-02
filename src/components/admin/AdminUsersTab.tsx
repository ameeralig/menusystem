
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  UserCheck, 
  UserX, 
  Trash, 
  RefreshCw, 
  Shield, 
  ShieldX, 
  Send,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";

type UserStatus = "active" | "banned" | "pending";

interface User {
  id: string;
  email: string;
  created_at: string;
  store_name: string | null;
  status: UserStatus;
  role: string;
  lastActivity: string;
  visitsCount: number;
  productsCount: number;
  phone: string | null;
  account_status: string | null;
}

const AdminUsersTab = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<"ban" | "delete" | "role" | "message" | "approve">("ban");
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState("");
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      // أولا، تطبيق فلتر حسب المعلق فقط إذا كان مفعلا
      if (showPendingOnly) {
        setFilteredUsers(users.filter(user => user.account_status === "pending"));
      } else {
        setFilteredUsers(users);
      }
      return;
    }

    const query = searchQuery.toLowerCase();
    let filtered = users.filter((user) => {
      return (
        user.email?.toLowerCase().includes(query) ||
        user.store_name?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query)
      );
    });

    // تطبيق فلتر المعلق إذا كان مفعلا
    if (showPendingOnly) {
      filtered = filtered.filter(user => user.account_status === "pending");
    }

    setFilteredUsers(filtered);
  }, [searchQuery, users, showPendingOnly]);

  const fetchUsers = async () => {
    setIsLoading(true);

    try {
      // جلب المستخدمين من خلال وظيفة Edge
      const { data: userData, error: userError } = await supabase.functions.invoke('get-service-key', {
        body: { action: 'get_users' }
      });
      
      if (userError) {
        console.error("خطأ في جلب بيانات المستخدمين:", userError);
        throw userError;
      }
      
      console.log("بيانات المستخدمين المستلمة:", userData);
      
      // جلب إعدادات المتاجر للمستخدمين
      const { data: storeData, error: storeError } = await supabase
        .from('store_settings')
        .select('user_id, store_name');

      if (storeError) throw storeError;
      
      // جلب عدد المنتجات لكل مستخدم
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('user_id');
      
      if (productsError) throw productsError;

      // تجميع عدد المنتجات حسب المستخدم يدويًا
      let productsByUser: { user_id: string, count: number }[] = [];
      
      if (Array.isArray(productsData)) {
        const productMap = new Map<string, number>();
        
        productsData.forEach(item => {
          const userId = item.user_id;
          const currentCount = productMap.get(userId) || 0;
          productMap.set(userId, currentCount + 1);
        });
        
        productsByUser = Array.from(productMap.entries()).map(([user_id, count]) => ({
          user_id,
          count
        }));
      }
      
      // جلب عدد الزوار لكل مستخدم
      const { data: viewsData, error: viewsError } = await supabase
        .from('page_views')
        .select('user_id, view_count');
      
      if (viewsError) throw viewsError;
      
      // جلب معلومات الأدوار
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
        
      if (rolesError) throw rolesError;
      
      // تحويل البيانات إلى خرائط للوصول السريع
      const storeMap = new Map(storeData ? storeData.map((store: any) => [store.user_id, store.store_name]) : []);
      const productsMap = new Map(productsByUser ? productsByUser.map((product) => [product.user_id, product.count || 0]) : []);
      const viewsMap = new Map(viewsData ? viewsData.map((view: any) => [view.user_id, view.view_count]) : []);
      const rolesMap = new Map(rolesData ? rolesData.map((role: any) => [role.user_id, role.role]) : []);
      
      // دمج البيانات
      const enrichedUsers = userData?.users ? userData.users.map((user: any) => ({
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        store_name: storeMap.get(user.id) || null,
        status: user.banned_until ? "banned" : "active",
        role: rolesMap.get(user.id) || 'user',
        lastActivity: user.last_sign_in_at || user.created_at,
        visitsCount: viewsMap.get(user.id) || 0,
        productsCount: productsMap.get(user.id) || 0,
        phone: user.user_metadata?.phone || null,
        account_status: user.user_metadata?.account_status || 'active'
      })) : [];

      // طباعة بيانات المستخدمين المعالجة للتصحيح
      console.log("بيانات المستخدمين المعالجة:", enrichedUsers);
      
      setUsers(enrichedUsers);
      setFilteredUsers(enrichedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات المستخدمين"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = async (action: string) => {
    if (!selectedUser) return;
    
    setIsProcessing(true);
    setShowActionDialog(false);
    
    try {
      console.log(`معالجة إجراء ${action} للمستخدم ${selectedUser.id}`);
      
      switch (action) {
        case "ban":
          await supabase.functions.invoke('manage-user', {
            body: { 
              action: selectedUser.status === "banned" ? 'unban' : 'ban',
              userId: selectedUser.id
            }
          });
          
          toast({
            title: "تم بنجاح",
            description: selectedUser.status === "banned" 
              ? "تم إلغاء حظر المستخدم بنجاح" 
              : "تم حظر المستخدم بنجاح"
          });
          break;
          
        case "delete":
          await supabase.functions.invoke('manage-user', {
            body: { 
              action: 'delete',
              userId: selectedUser.id
            }
          });
          
          toast({
            title: "تم بنجاح",
            description: "تم حذف حساب المستخدم بنجاح"
          });
          break;
          
        case "role":
          // تحديث دور المستخدم
          if (isAdmin) {
            await supabase.from('user_roles').upsert({
              user_id: selectedUser.id,
              role: 'admin'
            });
          } else {
            await supabase.from('user_roles')
              .delete()
              .eq('user_id', selectedUser.id)
              .eq('role', 'admin');
          }
          
          toast({
            title: "تم بنجاح",
            description: `تم تغيير صلاحية المستخدم إلى ${isAdmin ? 'مسؤول' : 'مستخدم عادي'}`
          });
          break;
          
        case "message":
          // إرسال إشعار للمستخدم
          await supabase.functions.invoke('manage-user', {
            body: { 
              action: 'message',
              userId: selectedUser.id,
              message: message
            }
          });
            
          setMessage("");
          toast({
            title: "تم بنجاح",
            description: "تم إرسال الإشعار إلى المستخدم بنجاح"
          });
          break;

        case "approve":
          console.log("محاولة تفعيل حساب المستخدم:", selectedUser);
          
          // الموافقة على الحساب
          const response = await supabase.functions.invoke('manage-user', {
            body: { 
              action: 'approve',
              userId: selectedUser.id
            }
          });
          
          console.log("استجابة تفعيل الحساب:", response);
          
          toast({
            title: "تم بنجاح",
            description: "تم تفعيل حساب المستخدم بنجاح"
          });
          break;
      }
      
      // إعادة تحميل البيانات بعد التحديث
      await fetchUsers();
    } catch (error: any) {
      console.error("Error processing user action:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء معالجة الطلب: " + (error.message || "خطأ غير متوقع")
      });
    } finally {
      setSelectedUser(null);
      setIsProcessing(false);
    }
  };

  const openActionDialog = (user: User, action: "ban" | "delete" | "role" | "message" | "approve") => {
    setSelectedUser(user);
    setDialogAction(action);
    if (action === "role") {
      setIsAdmin(user.role === "admin");
    }
    setShowActionDialog(true);
  };

  return (
    <Card>
      <CardContent className="pt-6">
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
        
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>اسم المتجر</TableHead>
                <TableHead>رقم الهاتف</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>آخر نشاط</TableHead>
                <TableHead>عدد الزوار</TableHead>
                <TableHead>عدد المنتجات</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <div className="flex justify-center items-center">
                      <Spinner className="h-6 w-6 mr-2" />
                      جاري تحميل البيانات...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    لم يتم العثور على مستخدمين
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.store_name || 'لا يوجد متجر'}</TableCell>
                    <TableCell>{user.phone || 'غير متوفر'}</TableCell>
                    <TableCell>
                      {user.account_status === "pending" ? (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">قيد المراجعة</Badge>
                      ) : user.status === "active" ? (
                        <Badge variant="success" className="bg-green-500">نشط</Badge>
                      ) : user.status === "banned" ? (
                        <Badge variant="destructive">محظور</Badge>
                      ) : (
                        <Badge variant="outline">غير معروف</Badge>
                      )}
                      {user.role === "admin" && (
                        <Badge variant="secondary" className="mr-1">مسؤول</Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(user.lastActivity).toLocaleDateString('ar')}</TableCell>
                    <TableCell>{user.visitsCount}</TableCell>
                    <TableCell>{user.productsCount}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {user.account_status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openActionDialog(user, "approve")}
                            title="الموافقة على الحساب"
                            className="bg-green-100 hover:bg-green-200 border-green-200"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openActionDialog(user, "ban")}
                          title={user.status === "banned" ? "إلغاء الحظر" : "حظر المستخدم"}
                        >
                          {user.status === "banned" ? (
                            <UserCheck className="h-4 w-4" />
                          ) : (
                            <UserX className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openActionDialog(user, "role")}
                          title={user.role === "admin" ? "إزالة صلاحية المسؤول" : "ترقية إلى مسؤول"}
                        >
                          {user.role === "admin" ? (
                            <ShieldX className="h-4 w-4" />
                          ) : (
                            <Shield className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openActionDialog(user, "message")}
                          title="إرسال إشعار"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openActionDialog(user, "delete")}
                          title="حذف الحساب"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* مربعات حوار الإجراءات */}
        <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogAction === "ban" && (selectedUser?.status === "banned" 
                  ? "تأكيد إلغاء حظر المستخدم"
                  : "تأكيد حظر المستخدم"
                )}
                {dialogAction === "delete" && "تأكيد حذف حساب المستخدم"}
                {dialogAction === "role" && (isAdmin 
                  ? "تأكيد ترقية المستخدم إلى مسؤول"
                  : "تأكيد إزالة صلاحية المسؤول"
                )}
                {dialogAction === "message" && "إرسال إشعار للمستخدم"}
                {dialogAction === "approve" && "تأكيد تفعيل الحساب"}
              </DialogTitle>
            </DialogHeader>
            
            {dialogAction === "ban" && (
              <div>
                <p>
                  {selectedUser?.status === "banned" 
                    ? `هل أنت متأكد من إلغاء حظر المستخدم ${selectedUser?.email}؟`
                    : `هل أنت متأكد من حظر المستخدم ${selectedUser?.email}؟`
                  }
                </p>
                
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                    إلغاء
                  </Button>
                  <Button 
                    variant={selectedUser?.status === "banned" ? "default" : "destructive"}
                    onClick={() => handleUserAction("ban")}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Spinner className="h-4 w-4 mr-2" />
                        جاري المعالجة...
                      </>
                    ) : (
                      selectedUser?.status === "banned" ? "إلغاء الحظر" : "حظر المستخدم"
                    )}
                  </Button>
                </DialogFooter>
              </div>
            )}
            
            {dialogAction === "delete" && (
              <div>
                <p className="text-red-500 font-semibold">تحذير: هذا الإجراء لا يمكن التراجع عنه!</p>
                <p className="mt-2">
                  هل أنت متأكد من حذف حساب المستخدم {selectedUser?.email} وجميع بياناته؟
                </p>
                
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                    إلغاء
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleUserAction("delete")}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Spinner className="h-4 w-4 mr-2" />
                        جاري المعالجة...
                      </>
                    ) : (
                      "حذف الحساب نهائياً"
                    )}
                  </Button>
                </DialogFooter>
              </div>
            )}
            
            {dialogAction === "role" && (
              <div>
                <p>
                  {isAdmin 
                    ? `هل أنت متأكد من ترقية المستخدم ${selectedUser?.email} إلى صلاحية مسؤول؟`
                    : `هل أنت متأكد من إزالة صلاحية المسؤول من المستخدم ${selectedUser?.email}؟`
                  }
                </p>
                
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                    إلغاء
                  </Button>
                  <Button 
                    variant={isAdmin ? "default" : "secondary"}
                    onClick={() => handleUserAction("role")}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Spinner className="h-4 w-4 mr-2" />
                        جاري المعالجة...
                      </>
                    ) : (
                      isAdmin ? "ترقية إلى مسؤول" : "إزالة صلاحية المسؤول"
                    )}
                  </Button>
                </DialogFooter>
              </div>
            )}
            
            {dialogAction === "message" && (
              <div>
                <p className="mb-2">
                  إرسال إشعار إلى المستخدم {selectedUser?.email}
                </p>
                
                <div className="space-y-2 my-4">
                  <Label htmlFor="message">نص الإشعار</Label>
                  <Input
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب نص الإشعار هنا..."
                  />
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                    إلغاء
                  </Button>
                  <Button 
                    variant="default"
                    onClick={() => handleUserAction("message")}
                    disabled={!message.trim() || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Spinner className="h-4 w-4 mr-2" />
                        جاري المعالجة...
                      </>
                    ) : (
                      "إرسال الإشعار"
                    )}
                  </Button>
                </DialogFooter>
              </div>
            )}
            
            {dialogAction === "approve" && (
              <div>
                <p>
                  هل أنت متأكد من تفعيل حساب المستخدم {selectedUser?.email}؟
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  سيتمكن المستخدم من تسجيل الدخول واستخدام النظام بعد الموافقة.
                </p>
                
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                    إلغاء
                  </Button>
                  <Button 
                    variant="default"
                    onClick={() => handleUserAction("approve")}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? (
                      <>
                        <Spinner className="h-4 w-4 mr-2" />
                        جاري التفعيل...
                      </>
                    ) : (
                      "تفعيل الحساب"
                    )}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminUsersTab;
