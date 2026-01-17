export interface User {
  user_id: number;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (token: string) => void;
  logout: () => void;
  isInitialized: boolean; 
}