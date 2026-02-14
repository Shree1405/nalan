import { Bell, Search, UserCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TopNav() {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b sticky top-0 z-20 px-6 flex items-center justify-between">
      <div className="w-full max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search for patients, MRN, or symptoms..." 
            className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-primary">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full border border-white"></span>
        </Button>
        <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900">Dr. Sarah Jenkins</p>
            <p className="text-xs text-muted-foreground">Emergency Dept.</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <UserCircle className="h-8 w-8 text-slate-400" />
          </Button>
        </div>
      </div>
    </header>
  );
}
