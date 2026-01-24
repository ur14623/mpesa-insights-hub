import { SidebarTrigger } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-border/50 bg-gradient-card backdrop-blur-sm flex items-center px-6 sticky top-0 z-50 shadow-card">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger className="hover:bg-primary/10 transition-colors" />
        <div className="relative">
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">MPESA-CVM</h1>
          <div className="absolute -inset-2 bg-gradient-primary opacity-10 blur-xl -z-10" />
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="text-sm hover:text-primary transition-colors cursor-pointer outline-none px-3 py-2 rounded-lg hover:bg-primary/5 border border-transparent hover:border-primary/20">
          <span className="font-semibold text-foreground">{user?.full_name || 'User'}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-card border-border/50 shadow-card">
          <DropdownMenuItem 
            className="cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/20"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
