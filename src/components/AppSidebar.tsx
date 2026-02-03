import { LayoutDashboard, ChevronRight, Database, FileCode2, Table2, ListTodo, Users, TrendingUp, Wallet, Moon, Lock, Activity, Calendar } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

const cvmItems = [
  { title: "GA Flow Up", url: "/cvm/ga-flow-up", icon: TrendingUp },
  { title: "Daily Dropper Tracking", url: "/cvm/daily-dropper", icon: Activity },
  { title: "30-Day Dropper Tracking", url: "/cvm/30d-dropper", icon: Calendar },
  { title: "Unutilized Balance", url: "/cvm/unutilized-balance", icon: Wallet },
  { title: "Dormant Activation", url: "/cvm/dormant-activation", icon: Moon },
  { title: "PIN Unlock", url: "/cvm/pin-unlock", icon: Lock },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar className={!open ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border shadow-elegant overflow-hidden">
        {/* Header Section */}
        {open && (
          <div className="px-4 py-3 border-b border-sidebar-border/50">
            <div className="relative inline-block">
              <h2 className="text-base font-bold bg-gradient-primary bg-clip-text text-transparent">
                CVM Metrics
              </h2>
              <div className="absolute -inset-2 bg-gradient-primary opacity-20 blur-xl -z-10" />
            </div>
            <p className="text-xs text-sidebar-foreground/60 mt-0.5">Real-time analytics</p>
          </div>
        )}

        {/* Navigation Section */}
        <SidebarGroup className={open ? "px-3 py-2" : "px-1 py-2"}>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {/* Dashboard Overview */}
              <SidebarMenuItem className="animate-fade-in">
                <SidebarMenuButton asChild className={`group relative overflow-hidden rounded-lg hover:bg-sidebar-accent/80 transition-all duration-300 ${!open ? "justify-center" : ""}`}>
                  <NavLink 
                    to="/" 
                    end
                    className="relative z-10"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-2 border-sidebar-primary"
                  >
                    <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity" />
                    <LayoutDashboard className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:text-sidebar-primary" />
                    {open && <span className="text-sm transition-colors">Dashboard Overview</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Base Preparation */}
              <SidebarMenuItem className="animate-fade-in">
                <SidebarMenuButton asChild className={`group relative overflow-hidden rounded-lg hover:bg-sidebar-accent/80 transition-all duration-300 ${!open ? "justify-center" : ""}`}>
                  <NavLink 
                    to="/base-preparation" 
                    end
                    className="relative z-10"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-2 border-sidebar-primary"
                  >
                    <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity" />
                    <Database className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:text-sidebar-primary" />
                    {open && <span className="text-sm transition-colors">Base Preparation</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>


              {/* My Schema */}
              <SidebarMenuItem className="animate-fade-in">
                <SidebarMenuButton asChild className={`group relative overflow-hidden rounded-lg hover:bg-sidebar-accent/80 transition-all duration-300 ${!open ? "justify-center" : ""}`}>
                  <NavLink 
                    to="/tables/saved" 
                    end
                    className="relative z-10"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-2 border-sidebar-primary"
                  >
                    <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity" />
                    <Table2 className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:text-sidebar-primary" />
                    {open && <span className="text-sm transition-colors">My Schema</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* SQL Query Library */}
              <SidebarMenuItem className="animate-fade-in">
                <SidebarMenuButton asChild className={`group relative overflow-hidden rounded-lg hover:bg-sidebar-accent/80 transition-all duration-300 ${!open ? "justify-center" : ""}`}>
                  <NavLink 
                    to="/sql-query-library" 
                    end
                    className="relative z-10"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-2 border-sidebar-primary"
                  >
                    <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity" />
                    <FileCode2 className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:text-sidebar-primary" />
                    {open && <span className="text-sm transition-colors">SQL Query Library</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* CVM - Collapsible */}
              {open ? (
                <Collapsible className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="group relative overflow-hidden rounded-lg hover:bg-sidebar-accent/80 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity" />
                        <Users className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:text-sidebar-primary" />
                        <span className="text-sm transition-colors">CVM</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {cvmItems.map((item, idx) => (
                          <SidebarMenuSubItem key={item.title} className="animate-fade-in" style={{ animationDelay: `${idx * 15}ms` }}>
                            <SidebarMenuSubButton asChild className="group relative overflow-hidden hover:bg-sidebar-accent/80 transition-all duration-300">
                              <NavLink to={item.url} className="relative z-10" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                                <item.icon className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                                <span className="text-xs">{item.title}</span>
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem className="animate-fade-in">
                  <SidebarMenuButton className="group relative overflow-hidden rounded-lg hover:bg-sidebar-accent/80 transition-all duration-300 justify-center">
                    <Users className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:text-sidebar-primary" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Task Manager */}
              <SidebarMenuItem className="animate-fade-in">
                <SidebarMenuButton asChild className={`group relative overflow-hidden rounded-lg hover:bg-sidebar-accent/80 transition-all duration-300 ${!open ? "justify-center" : ""}`}>
                  <NavLink 
                    to="/task-manager" 
                    end
                    className="relative z-10"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-2 border-sidebar-primary"
                  >
                    <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity" />
                    <ListTodo className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:text-sidebar-primary" />
                    {open && <span className="text-sm transition-colors">Task Manager</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
