
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/components/admin/users/userTypes";
import { filterUsers } from "@/components/admin/users/userUtils";

export const useUsers = () => {
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
    setFilteredUsers(filterUsers(users, searchQuery, showPendingOnly));
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
      setFilteredUsers(filterUsers(enrichedUsers, searchQuery, showPendingOnly));
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
          const response = await supabase.functions.invoke('manage-user', {
            body: { 
              action: 'message',
              userId: selectedUser.id,
              message: message
            }
          });
          
          console.log("استجابة إرسال الإشعار:", response);
          
          if (response.error) {
            throw new Error(response.error);
          }
            
          setMessage("");
          toast({
            title: "تم بنجاح",
            description: "تم إرسال الإشعار إلى المستخدم بنجاح"
          });
          break;

        case "approve":
          console.log("محاولة تفعيل حساب المستخدم:", selectedUser);
          
          // الموافقة على الحساب
          const approveResponse = await supabase.functions.invoke('manage-user', {
            body: { 
              action: 'approve',
              userId: selectedUser.id
            }
          });
          
          console.log("استجابة تفعيل الحساب:", approveResponse);
          
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

  return {
    users,
    filteredUsers,
    isLoading,
    searchQuery,
    setSearchQuery,
    fetchUsers,
    showPendingOnly,
    setShowPendingOnly,
    selectedUser,
    showActionDialog,
    setShowActionDialog,
    dialogAction,
    isAdmin,
    setIsAdmin,
    message,
    setMessage,
    isProcessing,
    handleUserAction,
    openActionDialog
  };
};
