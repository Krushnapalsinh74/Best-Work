import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import dokraLogo from "@assets/05cda95c-1026-4fcb-b9e5-5346e9f86cee-removebg-preview_1780898448646.png";
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  Target, 
  Calendar, 
  Award, 
  Trophy, 
  Bell, 
  AlertTriangle, 
  Settings, 
  History 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Activities", href: "/activities", icon: Activity },
  { name: "Challenges", href: "/challenges", icon: Target },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Badges", href: "/badges", icon: Award },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Reports", href: "/reports", icon: AlertTriangle },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Audit Logs", href: "/audit-logs", icon: History },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex flex-col w-64 bg-sidebar text-sidebar-foreground h-full border-r border-sidebar-border shadow-xl">
      <div className="flex h-20 shrink-0 items-center px-6 border-b border-sidebar-border bg-sidebar/50">
        <img src={dokraLogo} alt="DOKRA" className="h-10 w-auto mr-3 drop-shadow-md" />
        <span className="font-bold tracking-tight text-white">Super Admin</span>
      </div>
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="flex-1 space-y-1 px-4">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  "group flex items-center px-3 py-2.5 text-sm rounded-md transition-colors"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground",
                    "flex-shrink-0 -ml-1 mr-3 h-5 w-5 transition-colors"
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
