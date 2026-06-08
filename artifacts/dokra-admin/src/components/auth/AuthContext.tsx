import { ReactNode, useEffect, useState, createContext, useContext } from "react";
import { useLocation } from "wouter";
import { useGetMe } from "@workspace/api-client-react";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(localStorage.getItem("dokra_admin_token"));

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("dokra_admin_token", newToken);
    } else {
      localStorage.removeItem("dokra_admin_token");
    }
    setTokenState(newToken);
  };

  return (
    <AuthContext.Provider value={{ token, setToken, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const [, setLocation] = useLocation();

  const { data: user, isLoading, isError } = useGetMe({
    query: {
      enabled: !!token,
      retry: false
    }
  });

  useEffect(() => {
    if (!isAuthenticated || isError) {
      setLocation("/login");
    }
  }, [isAuthenticated, isError, setLocation]);

  if (!isAuthenticated || isError) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Loading command center...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
