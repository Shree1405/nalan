import { Link, useLocation } from "wouter";
import { LayoutDashboard, Stethoscope, Users, Settings, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/triage", label: "New Triage", icon: Stethoscope },
    { href: "/patients", label: "Patients", icon: Users },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r h-screen fixed left-0 top-0 z-30">
      <div className="p-6 border-b flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg leading-tight text-slate-900">AI Smart Patient</h1>
          <p className="text-xs text-muted-foreground font-medium">Medical Triage</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-primary/5 text-primary shadow-sm ring-1 ring-primary/10"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-slate-400")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <Settings className="w-5 h-5 text-slate-400" />
          System Settings
        </button>
      </div>
    </div>
  );
}
