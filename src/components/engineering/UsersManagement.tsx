
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Ban, Trash, UserX } from "lucide-react";
import { Input } from "@/components/ui/input";

type User = {
  id: string;
  email: string;
  created_at: string;
  banned_until: string | null;
  store_name: string | null;
};

const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userMessage, setUserMessage] = useState("");
  const { toast } = useToast();

  // التحقق من صلاحيات المستخدم وجلب قائمة المستخدمين
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      console.log("جلب بيانات المستخدمين...");
      
      // جلب معلومات جميع المستخدمين
      const { data: usersData, error: usersError } = await supabase.functions.invoke('get-service-key', {
        body: { action: 'get_users' }
      });
      
      if (usersError) {
        console.error("خطأ في جلب بيانات المستخدمين:", usersError);
        throw usersError;
      }
      
      console.log("تم جلب المستخدمين:", usersData);
      
      if (!usersData || !usersData.users) {
        throw new Error('فشل في جلب بيانات المستخدمين');
      }

      // جلب معلومات المتاجر للمستخدمين
      const { data: storeData, error: storeError } = await supabase
        .from('store_settings')
        .select('user_id, store_name');

      if (storeError) {
        console.error("خطأ في جلب بيانات المتاجر:", storeError);
        throw storeError;
      }
      
      console.log("تم جلب بيانات المتاجر:", storeData);

      const storeMap = new Map();
      if (storeData && Array.isArray(storeData)) {
        storeData.forEach((store: any) => {
          storeMap.set(store.user_id, store.store_name);
        });
      }

      const enrichedUsers = usersData.users.map((user: any) => ({
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        banned_until: user.banned_until,
        store_name: storeMap.get(user.id) || null
      }));
      
      console.log("تم معالجة بيانات المستخدمين:", enrichedUsers);

      setUsers(enrichedUsers);
    } catch (error: any) {
      console.error('خطأ في جلب المستخدمين:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات المستخدمين: " + (error.message || error)
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // حظر أو إلغاء حظر مستخدم
  const handleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      console.log(`محاولة ${isBanned ? 'إلغاء حظر' : 'حظر'} المستخدم ${userId}`);
      
      const response = await supabase.functions.invoke('manage-user', {
        body: { 
          action: isBanned ? 'unban' : 'ban',
          userId
        }
      });
      
      console.log("استجابة الخادم:", response);
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "تم بنجاح",
        description: isBanned ? "تم إلغاء حظر المستخدم" : "تم حظر المستخدم"
      });

      await fetchUsers();
    } catch (error: any) {
      console.error('خطأ في تحديث حالة المستخدم:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة المستخدم: " + (error.message || error)
      });
    } finally {
      setBanDialogOpen(false);
      setSelectedUser(null);
    }
  };

  // حذف مستخدم
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      console.log(`محاولة حذف المستخدم ${selectedUser.id}`);
      
      const response = await supabase.functions.invoke('manage-user', {
        body: { 
          action: 'delete',
          userId: selectedUser.id
        }
      });
      
      console.log("استجابة الخادم:", response);
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "تم بنجاح",
        description: "تم حذف حساب المستخدم وجميع بياناته"
      });

      await fetchUsers();
    } catch (error: any) {
      console.error('خطأ في حذف المستخدم:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المستخدم: " + (error.message || error)
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };
  
  // إرسال رسالة للمستخدم
  const handleSendMessage = async () => {
    if (!selectedUser || !userMessage.trim()) return;

    try {
      console.log(`محاولة إرسال رسالة للمستخدم ${selectedUser.id}:`, userMessage);
      
      const response = await supabase.functions.invoke('manage-user', {
        body: { 
          action: 'message',
          userId: selectedUser.id,
          message: userMessage
        }
      });
      
      console.log("استجابة الخادم:", response);
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "تم بنجاح",
        description: "تم إرسال الرسالة إلى المستخدم"
      });

      setUserMessage("");
    } catch (error: any) {
      console.error('خطأ في إرسال الرسالة:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الرسالة: " + (error.message || error)
      });
    } finally {
      setMessageDialogOpen(false);
      setSelectedUser(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري تحميل بيانات المستخدمين...</div>;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>إدارة المستخدمين</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>اسم المتجر</TableHead>
                <TableHead>تاريخ التسجيل</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.store_name || 'لا يوجد متجر'}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      {user.banned_until ? (
                        <span className="text-red-500">محظور</span>
                      ) : (
                        <span className="text-green-500">نشط</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setBanDialogOpen(true);
                          }}
                        >
                          {user.banned_until ? (
                            <>
                              <Ban className="w-4 h-4 ml-2" />
                              إلغاء الحظر
                            </>
                          ) : (
                            <>
                              <UserX className="w-4 h-4 ml-2" />
                              حظر
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setMessageDialogOpen(true);
                          }}
                        >
                          إرسال إشعار
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="w-4 h-4 ml-2" />
                          حذف
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    لا توجد بيانات للعرض
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* مربع حوار تأكيد الحذف */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد من حذف هذا الحساب؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف حساب المستخدم وجميع بياناته بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={handleDeleteUser}
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* مربع حوار تأكيد الحظر/إلغاء الحظر */}
        <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {selectedUser?.banned_until
                  ? "هل أنت متأكد من إلغاء حظر هذا الحساب؟"
                  : "هل أنت متأكد من حظر هذا الحساب؟"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {selectedUser?.banned_until
                  ? "سيتم السماح للمستخدم بالوصول إلى حسابه مرة أخرى."
                  : "سيتم منع المستخدم من الوصول إلى حسابه."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                className={selectedUser?.banned_until ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}
                onClick={() => selectedUser && handleBanUser(selectedUser.id, !!selectedUser.banned_until)}
              >
                {selectedUser?.banned_until ? "إلغاء الحظر" : "حظر"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* مربع حوار إرسال رسالة */}
        <AlertDialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>إرسال إشعار للمستخدم</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم إرسال هذا الإشعار إلى المستخدم {selectedUser?.email}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Input
                placeholder="اكتب نص الإشعار هنا..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUserMessage("")}>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSendMessage}
                disabled={!userMessage.trim()}
              >
                إرسال
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default UsersManagement;
