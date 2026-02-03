import { SidebarTrigger } from "@/components/ui/sidebar";

export function Header() {
  return (
    <header className="h-16 border-b border-border/50 bg-gradient-card backdrop-blur-sm flex items-center px-6 sticky top-0 z-50 shadow-card">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger className="hover:bg-primary/10 transition-colors" />
        <div className="relative">
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">MPESA-CVM</h1>
          <div className="absolute -inset-2 bg-gradient-primary opacity-10 blur-xl -z-10" />
        </div>
      </div>
    </header>
  );
}
