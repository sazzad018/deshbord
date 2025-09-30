import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import Login from "@/pages/Login";

interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  email?: string | null;
}

interface AuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  logout: () => void;
  refetchSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { data: admin, isLoading, refetch } = useQuery<AdminUser>({
    queryKey: ["/api/auth/session"],
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (admin) {
      setIsAuthenticated(true);
    } else if (!isLoading) {
      setIsAuthenticated(false);
    }
  }, [admin, isLoading]);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setIsAuthenticated(false);
      refetch();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLoginSuccess = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-lg font-medium text-purple-700">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !admin) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <AuthContext.Provider value={{ admin, isLoading, logout, refetchSession: refetch }}>
      {children}
    </AuthContext.Provider>
  );
}
