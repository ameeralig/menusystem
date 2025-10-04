
import { Card, CardContent } from "@/components/ui/card";
import UserFilters from "@/components/admin/users/UserFilters";
import UserActionDialog from "@/components/admin/users/UserActionDialog";
import UserCard from "@/components/admin/users/UserCard";
import { useUsers } from "@/components/admin/users/useUsers";
import { Spinner } from "@/components/ui/spinner";

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
    toggleEmployeeSystem
  } = useUsers();

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <UserFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isLoading={isLoading}
            fetchUsers={fetchUsers}
            showPendingOnly={showPendingOnly}
            setShowPendingOnly={setShowPendingOnly}
          />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Spinner className="h-8 w-8" />
            <p className="text-muted-foreground">جاري تحميل المستخدمين...</p>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <p className="text-muted-foreground text-lg">لم يتم العثور على مستخدمين</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              openActionDialog={openActionDialog}
              onToggleEmployeeSystem={toggleEmployeeSystem}
            />
          ))}
        </div>
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
