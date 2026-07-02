import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Calendar, ListTodo, Users2, Video,
  KanbanSquare, FileText, AlertOctagon, BarChart3, Settings,
  Search, Bell, ChevronDown, LogOut,
} from "lucide-react";
import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const NAV: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/calendar", label: "Content Calendar", icon: Calendar },
  { to: "/tasks", label: "Tasks", icon: ListTodo },
  { to: "/team", label: "Team", icon: Users2 },
  { to: "/meetings", label: "Meetings", icon: Video },
  { to: "/deals", label: "Deals", icon: KanbanSquare },
  { to: "/proposals", label: "Proposals", icon: FileText },
  { to: "/issues", label: "Client Issues", icon: AlertOctagon },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children, title, subtitle, actions }: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen w-full bg-[oklch(0.985_0.005_255)] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
        <div className="px-6 py-5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary grid place-items-center text-primary-foreground font-bold">S</div>
          <div className="leading-tight">
            <div className="text-base font-semibold tracking-tight text-white">SocialNxt</div>
          </div>
        </div>
        <nav className="px-3 pb-6 flex-1 overflow-y-auto">
          <div className="px-3 pt-4 pb-2 text-[11px] uppercase tracking-wider text-sidebar-muted">Workspace</div>
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 my-0.5 rounded-xl text-sm transition-colors",
                  active
                    ? "bg-sidebar-active/95 text-white shadow-[0_4px_14px_-4px_rgba(37,99,235,0.6)]"
                    : "text-sidebar-foreground/85 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <Link to="/login" className="flex items-center gap-3 text-sm text-sidebar-muted hover:text-white">
            <LogOut className="h-4 w-4" /> Sign out
          </Link>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/85 backdrop-blur border-b border-border">
          <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center gap-4">
            <div className="lg:hidden font-bold text-lg text-foreground">SocialNxt</div>
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients, tasks, proposals..."
                className="pl-9 h-10 bg-muted/60 border-transparent focus-visible:bg-white focus-visible:border-input rounded-xl"
              />
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <button className="relative h-10 w-10 rounded-xl grid place-items-center hover:bg-muted transition-colors">
                <Bell className="h-[18px] w-[18px] text-foreground/80" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
              </button>
              <div className="flex items-center gap-2 pl-2 pr-3 h-10 rounded-xl hover:bg-muted transition-colors cursor-pointer">
                <div className="h-8 w-8 rounded-lg bg-primary grid place-items-center text-primary-foreground text-xs font-semibold">I</div>
                <div className="hidden md:block text-left leading-tight">
                  <div className="text-xs font-semibold">Ishanshu</div>
                  <div className="text-[11px] text-muted-foreground">Account Manager</div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 mb-6 sm:flex sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-2xl sm:text-[28px] font-bold tracking-tight text-foreground">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
