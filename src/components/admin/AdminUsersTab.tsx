
import { Card, CardContent } from "@/components/ui/card";
import UserFilters from "@/components/admin/users/UserFilters";
import UsersTable from "@/components/admin/users/UsersTable";
import UserActionDialog from "@/components/admin/users/UserActionDialog";
import { useUsers } from "@/components/admin/users/useUsers";

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
    openActionDialog
  } = useUsers();

  return (
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
        
        <UsersTable 
          users={filteredUsers} 
          isLoading={isLoading} 
          openActionDialog={openActionDialog} 
        />
        
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
      </CardContent>
    </Card>
  );
};

export default AdminUsersTab;
