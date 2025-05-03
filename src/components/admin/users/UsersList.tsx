
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Shield, ShieldX, Send, Trash, UserCheck, UserX } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/components/admin/users/userUtils";
import { User } from "@/components/admin/users/userTypes";

interface UsersListProps {
  users: User[];
  isLoading: boolean;
  openActionDialog: (user: User, action: "ban" | "delete" | "role" | "message" | "approve") => void;
}

const UsersList = ({ users, isLoading, openActionDialog }: UsersListProps) => {
  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={8} className="text-center py-10">
          <div className="flex justify-center items-center">
            <Spinner className="h-6 w-6 mr-2" />
            جاري تحميل البيانات...
          </div>
        </TableCell>
      </TableRow>
    );
  }

  if (users.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={8} className="text-center py-10">
          لم يتم العثور على مستخدمين
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {users.map((user) => (
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
          <TableCell>{formatDate(user.lastActivity)}</TableCell>
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
      ))}
    </>
  );
};

export default UsersList;
