import { motion } from "framer-motion";
import { 
  User, 
  Store, 
  Mail, 
  Phone, 
  Eye, 
  Package, 
  Clock, 
  Shield, 
  Ban, 
  Trash2, 
  MessageCircle, 
  CheckCircle,
  ExternalLink,
  Users,
  UserCheck,
  UserX,
  ShieldX,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { User as UserType } from "./userTypes";
import { formatDate } from "./userUtils";

interface UserCardProps {
  user: UserType;
  openActionDialog: (user: UserType, action: "ban" | "delete" | "role" | "message" | "approve") => void;
  onToggleEmployeeSystem?: (userId: string, currentStatus: boolean) => Promise<void>;
}

const UserCard = ({ user, openActionDialog, onToggleEmployeeSystem }: UserCardProps) => {
  const navigate = useNavigate();

  const getStatusInfo = () => {
    if (user.account_status === "pending") {
      return { label: "قيد المراجعة", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" };
    }
    if (user.status === "banned") {
      return { label: "محظور", color: "bg-red-500/20 text-red-400 border-red-500/30" };
    }
    return { label: "نشط", color: "bg-green-500/20 text-green-400 border-green-500/30" };
  };

  const statusInfo = getStatusInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 group"
    >
      {/* Header Gradient */}
      <div className={`h-1.5 bg-gradient-to-r ${
        user.status === 'banned' 
          ? 'from-red-500 to-rose-600' 
          : user.account_status === 'pending' 
            ? 'from-yellow-500 to-orange-500' 
            : 'from-cyan-400 to-blue-500'
      }`} />

      <div className="p-5">
        {/* User Info Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-cyan-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-bold text-white truncate text-sm">
                {user.store_name || 'بدون اسم متجر'}
              </h3>
              {user.role === "admin" && (
                <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] px-1.5">
                  <Shield className="w-3 h-3 ml-1" />
                  مسؤول
                </Badge>
              )}
            </div>
            <p className="text-white/50 text-xs truncate flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {user.email}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          <Badge className={`${statusInfo.color} border text-xs`}>
            {statusInfo.label}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-2 text-white/50 text-[10px] mb-1">
              <Eye className="w-3 h-3" />
              الزيارات
            </div>
            <p className="text-white font-bold text-lg">{user.visitsCount?.toLocaleString('ar-EG') || 0}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-2 text-white/50 text-[10px] mb-1">
              <Package className="w-3 h-3" />
              المنتجات
            </div>
            <p className="text-white font-bold text-lg">{user.productsCount?.toLocaleString('ar-EG') || 0}</p>
          </div>
        </div>

        {/* Phone if available */}
        {user.phone && (
          <div className="flex items-center gap-2 text-white/50 text-xs mb-3 bg-white/5 rounded-xl p-2.5 border border-white/5">
            <Phone className="w-3 h-3" />
            <span dir="ltr">{user.phone}</span>
          </div>
        )}

        {/* Last Activity */}
        <div className="flex items-center gap-2 text-white/40 text-[10px] mb-4">
          <Clock className="w-3 h-3" />
          آخر نشاط: {formatDate(user.lastActivity)}
        </div>

        {/* Employee System Toggle */}
        {onToggleEmployeeSystem && (
          <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/5 mb-4">
            <div className="flex items-center gap-2 text-white/70 text-xs">
              <Users className="w-4 h-4" />
              نظام الموظفين
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={user.employee_system_enabled || false}
                onCheckedChange={() => onToggleEmployeeSystem?.(user.id, user.employee_system_enabled || false)}
              />
              <span className="text-[10px] text-white/50">
                {user.employee_system_enabled ? 'مفعل' : 'معطل'}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {user.account_status === 'pending' && (
            <Button
              size="sm"
              onClick={() => openActionDialog(user, 'approve')}
              className="flex-1 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-[10px] font-bold px-2"
            >
              <CheckCircle className="w-3 h-3 ml-1" />
              موافقة
            </Button>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openActionDialog(user, 'ban')}
            className="h-8 w-8 p-0 rounded-lg bg-white/5 text-white/70 hover:bg-red-500/20 hover:text-red-400 border border-white/5"
          >
            {user.status === "banned" ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openActionDialog(user, 'role')}
            className="h-8 w-8 p-0 rounded-lg bg-white/5 text-white/70 hover:bg-purple-500/20 hover:text-purple-400 border border-white/5"
          >
            {user.role === "admin" ? <ShieldX className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openActionDialog(user, 'message')}
            className="h-8 w-8 p-0 rounded-lg bg-white/5 text-white/70 hover:bg-blue-500/20 hover:text-blue-400 border border-white/5"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openActionDialog(user, 'delete')}
            className="h-8 w-8 p-0 rounded-lg bg-white/5 text-white/70 hover:bg-red-500/20 hover:text-red-400 border border-white/5"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          
          <Button
            size="sm"
            onClick={() => navigate(`/admin/users/${user.id}`)}
            className="flex-1 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold border border-white/10 px-2"
          >
            <ExternalLink className="w-3 h-3 ml-1" />
            التفاصيل
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default UserCard;
