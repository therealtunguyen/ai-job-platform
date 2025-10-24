/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (userData: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (updateUserData: Partial<User>) => void;
  checkAuthStatus: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("key"); // Xóa cả key để tương thích với axiosInstance
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/";
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      console.log("Checking auth status:", {
        token: !!token,
        userStr: !!userStr,
      }); // Debug log

      if (token && userStr) {
        const userData = JSON.parse(userStr);
        console.log("Setting user as authenticated:", userData); // Debug log
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.log("No token or user data found, staying unauthenticated"); // Debug log
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]); // logout is in the dependency array

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]); // checkAuthStatus is in the dependency array

  const login = useCallback(
    (userData: User, token: string, refreshToken?: string) => {
      console.log("Login function called with:", {
        userData,
        token,
        refreshToken,
      }); // Debug log

      localStorage.setItem("token", token);
      localStorage.setItem("key", token); // Để tương thích với axiosInstance
      localStorage.setItem("user", JSON.stringify(userData));

      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      console.log("LocalStorage updated, setting state..."); // Debug log
      setUser(userData);
      setIsAuthenticated(true);

      console.log("Login completed, user should be authenticated"); // Debug log
    },
    [],
  ); // No dependencies needed since setUser and setIsAuthenticated are stable from useState

  const updateUser = useCallback(
    (updateUserData: Partial<User>) => {
      if (!user) return;
      const newUserData = { ...user, ...updateUserData };
      localStorage.setItem("user", JSON.stringify(newUserData));
      setUser(newUserData);
    },
    [user],
  ); // Only depends on user

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Required for React Fast Refresh to work with contexts that export both components and hooks
export default AuthProvider;
