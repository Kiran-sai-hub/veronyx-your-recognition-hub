import {
  BarChart3,
  Bell,
  CheckSquare,
  ClipboardList,
  GitBranch,
  IndianRupee,
  LayoutDashboard,
  ChevronDown,
  Gift,
  Home,
  Moon,
  Plug,
  Settings,
  Sparkles,
  Sun,
  Trophy,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import { useEffect } from "react";

import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AiCopilot } from "@/components/ai-copilot";
import { type Persona, personaHome, useAppStore } from "@/store/app-store";

const employeeNavigation = [
  { to: "/me", label: "Home", icon: Home },
  { to: "/me/wallet", label: "Wallet", icon: WalletCards },
  { to: "/me/recognitions", label: "Recognitions", icon: Trophy },
  { to: "/me/tracking", label: "Tracking", icon: Sparkles },
  { to: "/me/redeem", label: "Rewards", icon: Gift },
] as const;

function adminNavigation(persona: Persona) {
  return [
    { to: personaHome[persona], label: "Dashboard", icon: LayoutDashboard },
    { to: "/boards", label: "Boards", icon: Trophy },
    { to: "/workflows", label: "Workflows", icon: GitBranch },
    { to: "/approvals", label: "Approvals", icon: CheckSquare },
    { to: "/capture", label: "Native capture", icon: ClipboardList },
    { to: "/rewards", label: "Rewards", icon: Gift },
    { to: "/people", label: "People & teams", icon: Users },
    { to: "/connectors", label: "Connectors", icon: Plug },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/budget", label: "Budget & ledger", icon: IndianRupee },
    { to: "/payroll", label: "Payroll export", icon: WalletCards },
  ];
}

function screenFor(pathname: string, persona: Persona): string {
  if (pathname.startsWith("/workflows/")) return "builder";
  if (pathname.startsWith("/workflows")) return "workflows";
  if (pathname.startsWith("/approvals")) return "approvals";
  if (pathname.startsWith("/boards/")) return "board-config";
  if (pathname.startsWith("/boards")) return "boards";
  if (pathname.startsWith("/connectors")) return "connectors";
  if (pathname.startsWith("/budget")) return "budget";
  if (pathname.startsWith("/people")) return "people";
  if (pathname.startsWith("/rewards")) return "rewards-admin";
  if (pathname.startsWith("/capture")) return "capture";
  if (pathname.startsWith("/analytics")) return "analytics";
  if (pathname.startsWith("/payroll")) return "payroll";
  if (pathname.startsWith("/dashboard")) return persona;
  return "default";
}

const personaLabel: Record<Persona, string> = {
  owner: "Owner workspace",
  hr: "HR workspace",
  manager: "Manager workspace",
  employee: "Employee experience",
};

type AppShellProps = { children: React.ReactNode; pathname: string };

export function AppShell({ children, pathname }: AppShellProps) {
  const { persona, setPersona, theme, setTheme, openCopilot } = useAppStore();
  const isEmployee = pathname.startsWith("/me");
  const navigation = isEmployee ? employeeNavigation : adminNavigation(persona);
  const isActive = (to: string) =>
    to === "/me" ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
  const mobileNavigation = isEmployee
    ? employeeNavigation.filter((item) => ["/me", "/me/wallet", "/me/redeem"].includes(item.to))
    : [
        { to: personaHome[persona], label: "Dashboard", icon: LayoutDashboard },
        { to: "/approvals", label: "Approvals", icon: CheckSquare },
        { to: "/me/redeem", label: "Rewards", icon: Gift },
      ];
  const changePersona = (next: Persona) => {
    setPersona(next);
    window.location.assign(personaHome[next]);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
        <div className="border-b border-sidebar-border p-5">
          <Brand employer={isEmployee} />
        </div>
        <nav className="flex-1 space-y-1 p-3" aria-label="Main navigation">
          {navigation.map((item) => (
            <a
              key={item.to}
              href={item.to}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
                isActive(item.to) && "bg-sidebar-accent text-sidebar-primary",
              )}
            >
              <item.icon className="size-5" />
              <span>{item.label}</span>
            </a>
          ))}
          {!isEmployee && (
            <button
              type="button"
              onClick={() => openCopilot()}
              className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Sparkles className="size-5 text-primary" />
              AI Copilot
            </button>
          )}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <a
            href="/me/preferences"
            className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Settings className="size-5" />
            Preferences
          </a>
          <a
            href="/design-system"
            className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Sparkles className="size-5" />
            Design system
          </a>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="lg:hidden">
            <Brand compact employer={isEmployee} />
          </div>
          <div className="hidden lg:block">
            <p className="text-xs text-muted-foreground">Radha Krishna Mills</p>
            <p className="text-sm font-semibold">{personaLabel[persona]}</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={persona} onValueChange={(value) => changePersona(value as Persona)}>
              <SelectTrigger className="h-10 w-[132px]" aria-label="Preview persona">
                <UserRound className="size-4" />
                <SelectValue />
                <ChevronDown className="sr-only" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="hr">HR admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
            <TooltipProvider>
              {!isEmployee && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Open AI Copilot"
                      onClick={() => openCopilot()}
                    >
                      <Sparkles />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>AI Copilot</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={theme === "light" ? "Use dark theme" : "Use light theme"}
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  >
                    {theme === "light" ? <Moon /> : <Sun />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Switch theme</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Notifications">
                    <Bell />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>
        <main
          id="main-content"
          className="mx-auto w-full max-w-[1440px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8"
        >
          {children}
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-background px-2 pb-[env(safe-area-inset-bottom)] lg:hidden"
        aria-label="Mobile navigation"
      >
        {mobileNavigation.map((item) => (
          <a
            key={item.to}
            href={item.to}
            className={cn(
              "flex min-h-16 flex-col items-center justify-center gap-1 text-xs text-muted-foreground",
              isActive(item.to) && "text-primary",
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </a>
        ))}
        <a
          href="/me/preferences"
          className={cn(
            "flex min-h-16 flex-col items-center justify-center gap-1 text-xs text-muted-foreground",
            pathname === "/me/preferences" && "text-primary",
          )}
        >
          <UserRound className="size-5" />
          Profile
        </a>
      </nav>
      <AiCopilot screen={screenFor(pathname, persona)} />
    </div>
  );
}
