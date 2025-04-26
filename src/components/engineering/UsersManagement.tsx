
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) throw userError;

      // جلب معلومات المتاجر للمستخدمين
      const { data: storeData, error: storeError } = await supabase
        .from('store_settings')
        .select('user_id, store_name');

      if (storeError) throw storeError;

      const storeMap = new Map(storeData.map(store => [store.user_id, store.store_name]));

      const enrichedUsers = userData.users.map(user => ({
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        banned_until: user.banned_until,
        store_name: storeMap.get(user.id) || null
      }));

      setUsers(enrichedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات المستخدمين"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: isBanned ? null : '876000h' // حظر لمدة 100 سنة أو إلغاء الحظر
      });

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: isBanned ? "تم إلغاء حظر المستخدم" : "تم حظر المستخدم"
      });

      await fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة المستخدم"
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      // حذف المتجر أولاً (سيتم حذف كل البيانات المرتبطة تلقائياً)
      const { error: storeError } = await supabase
        .from('store_settings')
        .delete()
        .eq('user_id', selectedUser.id);

      if (storeError) throw storeError;

      // حذف حساب المستخدم
      const { error: userError } = await supabase.auth.admin.deleteUser(selectedUser.id);

      if (userError) throw userError;

      toast({
        title: "تم بنجاح",
        description: "تم حذف حساب المستخدم وجميع بياناته"
      });

      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المستخدم"
      });
    } finally {
      setSelectedUser(null);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return <div className="text-center">جاري تحميل بيانات المستخدمين...</div>;
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
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
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
                        onClick={() => handleBanUser(user.id, !!user.banned_until)}
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
              ))}
            </TableBody>
          </Table>
        </div>

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
      </CardContent>
    </Card>
  );
};

export default UsersManagement;
