import api from "@/hooks/api"; 

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  position?: string;
  status: boolean;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
}

export const fetchAllUsers = async (): Promise<User[]> => {
  try {
    const { data } = await api.get('/auth/admin/users/')
    return data
  } catch (err) {
    console.error('Error fetching users:', err);
    return [];
  }
}

export const updateUser = async (userId: number, updates: Partial<User>): Promise<User | null> => {
  try {
    const { data } = await api.patch(`/auth/admin/users/${userId}/`, updates)
    return data
  } catch (err) {
    console.error('Error updating user:', err);
    return null;
  }
}

export const deleteUser = async (userId: number): Promise<void> => {
  try {
    await api.delete(`/auth/admin/users/${userId}/`)
  } catch (err) {
    console.error('Error deleting user:', err);
    throw err;
  }
}