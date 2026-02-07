import { motion } from "framer-motion";
import { Search, RefreshCw, Filter, Users, PowerOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import UserActionDialog from "@/components/admin/users/UserActionDialog";
import UserCard from "@/components/admin/users/UserCard";
import { useUsers } from "@/components/admin/users/useUsers";
import { Spinner } from "@/components/ui/spinner";
import GlassCard from "./GlassCard";
import StatCard from "./StatCard";

const AdminUsersTab = () => {
  const {
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
    openActionDialog,
    toggleEmployeeSystem,
    toggleUserSuspension
  } = useUsers();

  const totalUsers = filteredUsers.length;
  const activeUsers = filteredUsers.filter(u => u.status === 'active').length;
  const suspendedUsers = filteredUsers.filter(u => u.status === 'suspended').length;
  const pendingUsers = filteredUsers.filter(u => u.account_status === 'pending_approval').length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي المستخدمين"
          value={totalUsers}
          icon={Users}
          color="from-cyan-400 to-blue-500"
          delay={0}
        />
        <StatCard
          title="المستخدمين النشطين"
          value={activeUsers}
          icon={Users}
          color="from-green-400 to-emerald-500"
          delay={0.1}
        />
        <StatCard
          title="الموقوفين مؤقتاً"
          value={suspendedUsers}
          icon={PowerOff}
          color="from-orange-400 to-amber-500"
          delay={0.15}
        />
        <StatCard
          title="بانتظار الموافقة"
          value={pendingUsers}
          icon={Users}
          color="from-yellow-400 to-orange-500"
          delay={0.2}
        />
      </div>

      {/* Filters */}
      <GlassCard className="p-5" delay={0.3}>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              placeholder="بحث عن مستخدم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl focus:border-cyan-400/50 focus:ring-cyan-400/20"
            />
          </div>

          {/* Pending Filter */}
          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2 border border-white/10">
            <Switch
              id="pending-only"
              checked={showPendingOnly}
              onCheckedChange={setShowPendingOnly}
            />
            <Label htmlFor="pending-only" className="text-white/70 text-sm font-bold cursor-pointer">
              المعلقين فقط
            </Label>
          </div>

          {/* Refresh */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={fetchUsers}
              disabled={isLoading}
              className="h-11 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold shadow-lg shadow-cyan-500/20"
            >
              {isLoading ? (
                <Spinner className="w-5 h-5" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              <span className="mr-2 hidden sm:inline">تحديث</span>
            </Button>
          </motion.div>
        </div>
      </GlassCard>

      {/* Users Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Spinner className="h-10 w-10 text-cyan-400" />
            <p className="text-white/60 font-bold">جاري تحميل المستخدمين...</p>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <GlassCard className="py-20 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <Users className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-white/60 text-lg font-bold">لم يتم العثور على مستخدمين</p>
          </div>
        </GlassCard>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredUsers.map((user, index) => (
            <UserCard
              key={user.id}
              user={user}
              openActionDialog={openActionDialog}
              onToggleEmployeeSystem={toggleEmployeeSystem}
              onToggleSuspension={toggleUserSuspension}
            />
          ))}
        </motion.div>
      )}
      
      <UserActionDialog
        showActionDialog={showActionDialog}
        setShowActionDialog={setShowActionDialog}
        selectedUser={selectedUser}
        dialogAction={dialogAction}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        message={message}
        setMessage={setMessage}
        isProcessing={isProcessing}
        handleUserAction={handleUserAction}
      />
    </div>
  );
};

export default AdminUsersTab;
