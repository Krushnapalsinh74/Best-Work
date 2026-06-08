import { useGetMe, useLogout } from "@workspace/api-client-react";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useLocation } from "wouter";

export function Header({ title }: { title: string }) {
  const { data: user } = useGetMe({ query: { staleTime: Infinity } });
  const logoutMutation = useLogout();
  const { setToken } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        setToken(null);
        setLocation("/login");
      }
    });
  };

  return (
    <header className="flex h-20 items-center justify-between px-8 bg-white border-b border-gray-200 shadow-sm z-10">
      <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-secondary/20 flex items-center justify-center text-secondary border border-secondary/30">
            <User className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 leading-none">{user?.name || "Admin"}</span>
            <span className="text-xs text-gray-500 mt-1">{user?.email}</span>
          </div>
        </div>
        
        <div className="h-8 w-px bg-gray-200" />
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="text-gray-500 hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </header>
  );
}
