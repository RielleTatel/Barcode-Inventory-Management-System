export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dateJoined: string;
  isActive: boolean;
  isSuperuser: boolean;
  isStaff: boolean;
}

export interface PendingUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dateRequested: string;
  reason?: string;
}

export type UserStatus = "approved" | "pending" | "rejected";
