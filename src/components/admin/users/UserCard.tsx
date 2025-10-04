import { User } from "@/components/admin/users/userTypes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  CheckCircle, 
  Shield, 
  ShieldX, 
  Send, 
  Trash, 
  UserCheck, 
  UserX,
  Store,
  Package,
  Eye,
  Phone,
  Mail,
  Calendar,
  Users,
  ChevronRight
} from "lucide-react";
import { formatDate } from "@/components/admin/users/userUtils";
import { useNavigate } from "react-router-dom";

interface UserCardProps {
  user: User;
  openActionDialog: (user: User, action: "ban" | "delete" | "role" | "message" | "approve") => void;
  onToggleEmployeeSystem?: (userId: string, currentStatus: boolean) => Promise<void>;
}

const UserCard = ({ user, openActionDialog, onToggleEmployeeSystem }: UserCardProps) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/admin/users/${user.id}`);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-lg truncate">{user.email}</h3>
              </div>
              
              {user.store_name && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Store className="h-4 w-4" />
                  <span className="text-sm">{user.store_name}</span>
                </div>
              )}
            </div>

            {/* Status Badges */}
            <div className="flex flex-col gap-2 items-end">
              {user.account_status === "pending" ? (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  قيد المراجعة
                </Badge>
              ) : user.status === "active" ? (
                <Badge className="bg-green-500 hover:bg-green-600">نشط</Badge>
              ) : user.status === "banned" ? (
                <Badge variant="destructive">محظور</Badge>
              ) : (
                <Badge variant="outline">غير معروف</Badge>
              )}
              
              {user.role === "admin" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  مسؤول
                </Badge>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4 py-4 border-y">
            <div className="flex flex-col items-center text-center">
              <Eye className="h-5 w-5 text-primary mb-1" />
              <span className="text-2xl font-bold">{user.visitsCount}</span>
              <span className="text-xs text-muted-foreground">زيارة</span>
            </div>
            
            <div className="flex flex-col items-center text-center border-x">
              <Package className="h-5 w-5 text-primary mb-1" />
              <span className="text-2xl font-bold">{user.productsCount}</span>
              <span className="text-xs text-muted-foreground">منتج</span>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <Users className="h-5 w-5 text-primary mb-1" />
              <span className="text-2xl font-bold">-</span>
              <span className="text-xs text-muted-foreground">موظف</span>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-2 text-sm">
            {user.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{user.phone}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>آخر نشاط: {formatDate(user.lastActivity)}</span>
            </div>
          </div>

          {/* Employee System Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <span className="text-sm font-medium">نظام الموظفين</span>
            <div className="flex items-center gap-2">
              <Switch
                checked={user.employee_system_enabled || false}
                onCheckedChange={() => onToggleEmployeeSystem?.(user.id, user.employee_system_enabled || false)}
                disabled={!onToggleEmployeeSystem}
              />
              <span className="text-xs text-muted-foreground">
                {user.employee_system_enabled ? 'مفعل' : 'معطل'}
              </span>
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex flex-wrap gap-2">
            {user.account_status === "pending" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openActionDialog(user, "approve")}
                className="flex-1 bg-green-50 hover:bg-green-100 border-green-200"
              >
                <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                الموافقة
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => openActionDialog(user, "ban")}
              className="flex-1"
            >
              {user.status === "banned" ? (
                <>
                  <UserCheck className="h-4 w-4 mr-1" />
                  إلغاء الحظر
                </>
              ) : (
                <>
                  <UserX className="h-4 w-4 mr-1" />
                  حظر
                </>
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => openActionDialog(user, "role")}
              className="flex-1"
            >
              {user.role === "admin" ? (
                <>
                  <ShieldX className="h-4 w-4 mr-1" />
                  إزالة الإدارة
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-1" />
                  ترقية
                </>
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => openActionDialog(user, "message")}
            >
              <Send className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="destructive"
              onClick={() => openActionDialog(user, "delete")}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>

          {/* View Details Button */}
          <Button 
            variant="ghost" 
            className="w-full mt-2" 
            onClick={handleViewDetails}
          >
            عرض التفاصيل الكاملة
            <ChevronRight className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
