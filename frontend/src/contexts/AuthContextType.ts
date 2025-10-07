import { createContext } from "react";

export interface User {
  email: string;
  name: string;
  createdAt?: Date | string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithOpenID: () => Promise<void>;
  logout: () => void;
  setAuthData: (token: string, user: User) => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
