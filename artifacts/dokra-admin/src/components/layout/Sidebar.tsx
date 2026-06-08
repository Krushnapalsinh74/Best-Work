import { Link, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
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
  History,
  Menu,
  ChevronLeft
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
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div 
      className={cn(
        "flex flex-col bg-white text-gray-800 h-full border-r border-gray-200 shadow-sm transition-all duration-300 relative z-20",
        isCollapsed ? "w-20" : "w-64"
      )}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <div className="flex h-20 shrink-0 items-center px-4 border-b border-gray-100 bg-white justify-center">
        <img src={dokraLogo} alt="DOKRA" className={cn("h-10 w-auto transition-all", !isCollapsed && "mr-3")} />
        {!isCollapsed && <span className="font-bold tracking-tight text-gray-900 truncate">Super Admin</span>}
      </div>
      <div 
        className="flex-1 overflow-y-auto py-6 overflow-x-hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .flex-1::-webkit-scrollbar {
            display: none;
          }
        `}} />
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  "group flex items-center py-2.5 text-sm rounded-md transition-colors",
                  isCollapsed ? "justify-center px-2" : "px-3"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600",
                    "flex-shrink-0 transition-colors",
                    isCollapsed ? "h-6 w-6" : "h-5 w-5 mr-3 -ml-1"
                  )}
                  aria-hidden="true"
                />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
