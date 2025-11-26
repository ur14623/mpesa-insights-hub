import { User } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border shadow-sm z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">MPESA-CVM</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="font-medium">Efrem | Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
