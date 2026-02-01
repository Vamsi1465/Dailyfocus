import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Target, 
  Settings, 
  LogOut,
  TrendingUp
} from 'lucide-react';
import { Button } from './ui/button';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    {
      title: "Daily Focus",
      icon: LayoutDashboard,
      path: "/",
      color: "text-sky-500"
    },
    {
      title: "Weekly Goals",
      icon: TrendingUp,
      path: "/weekly",
      color: "text-violet-500"
    },
    {
      title: "Monthly Vision",
      icon: Target,
      path: "/monthly",
      color: "text-pink-500"
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/settings",
      color: "text-slate-500"
    }
  ];

  return (
    <div className={cn("pb-12 min-h-screen w-64 bg-card border-r border-border flex flex-col", className)}>
      <div className="space-y-4 py-8">
        <div className="px-6 py-2">
          <h2 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            FocusFlow
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Master your time</p>
        </div>
        <div className="px-3 py-2">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={location.pathname === item.path ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 relative overflow-hidden group transition-all duration-300",
                    location.pathname === item.path ? "bg-secondary/50 font-medium" : "hover:bg-secondary/20"
                  )}
                >
                  {location.pathname === item.path && (
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary animate-fade-in" />
                  )}
                  <item.icon className={cn("h-5 w-5 transition-colors", item.color, 
                    location.pathname === item.path ? item.color : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  {item.title}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-auto px-6 py-8 space-y-2">
         {/* Auth removed per user request */}
      </div>
    </div>
  );
}
