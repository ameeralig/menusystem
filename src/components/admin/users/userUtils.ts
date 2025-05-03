
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ar');
};

export const filterUsers = (users: any[], query: string, showPendingOnly: boolean): any[] => {
  if (query.trim() === "") {
    // أولا، تطبيق فلتر حسب المعلق فقط إذا كان مفعلا
    if (showPendingOnly) {
      return users.filter(user => user.account_status === "pending");
    } else {
      return users;
    }
  }

  const searchQuery = query.toLowerCase();
  let filtered = users.filter((user) => {
    return (
      user.email?.toLowerCase().includes(searchQuery) ||
      user.store_name?.toLowerCase().includes(searchQuery) ||
      user.phone?.toLowerCase().includes(searchQuery)
    );
  });

  // تطبيق فلتر المعلق إذا كان مفعلا
  if (showPendingOnly) {
    filtered = filtered.filter(user => user.account_status === "pending");
  }

  return filtered;
};
