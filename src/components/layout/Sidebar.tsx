import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Activity,
  UserPlus,
  Users,
  ArrowRightLeft,
  Store,
  Smartphone,
  Download,
  TrendingDown,
  TrendingUp,
  Wallet,
  CreditCard,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard Overview", path: "/", icon: LayoutDashboard },
  { title: "Active Total", path: "/active-total", icon: Activity },
  { title: "Active New", path: "/active-new", icon: UserPlus },
  { title: "Active Existing", path: "/active-existing", icon: Users },
  { title: "Active Existing Transacting", path: "/active-existing-transacting", icon: ArrowRightLeft },
  { title: "Active New Transacting", path: "/active-new-transacting", icon: ArrowRightLeft },
  { title: "Active Micro Merchants", path: "/active-micro-merchants", icon: Store },
  { title: "Active Unified Merchants", path: "/active-unified-merchants", icon: Store },
  { title: "Active App Users", path: "/active-app-users", icon: Smartphone },
  { title: "App Downloads", path: "/app-downloads", icon: Download },
  { title: "Non-Gross Adds", path: "/non-gross-adds", icon: TrendingDown },
  { title: "Gross Adds", path: "/gross-adds", icon: TrendingUp },
  { title: "Top Up", path: "/top-up", icon: Wallet },
];

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-16 bottom-16 w-64 bg-sidebar border-r border-sidebar-border overflow-y-auto">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className="flex items-center gap-3 px-4 py-3 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              activeClassName="bg-sidebar-accent font-medium"
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{item.title}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
