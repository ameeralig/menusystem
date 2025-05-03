
export type UserStatus = "active" | "banned" | "pending";

export interface User {
  id: string;
  email: string;
  created_at: string;
  store_name: string | null;
  status: UserStatus;
  role: string;
  lastActivity: string;
  visitsCount: number;
  productsCount: number;
  phone: string | null;
  account_status: string | null;
}
