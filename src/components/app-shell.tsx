import {
  Bell,
  ChevronDown,
  Gift,
  Home,
  Moon,
  Settings,
  Sparkles,
  Sun,
  Trophy,
  UserRound,
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
import { type Persona, useAppStore } from "@/store/app-store";

const employeeNavigation = [
  { to: "/me", label: "Home", icon: Home },
  { to: "/me/wallet", label: "Wallet", icon: WalletCards },
  { to: "/me/recognitions", label: "Recognitions", icon: Trophy },
  { to: "/me/tracking", label: "Tracking", icon: Sparkles },
  { to: "/me/redeem", label: "Rewards", icon: Gift },
] as const;

type AppShellProps = { children: React.ReactNode; pathname: string };

export function AppShell({ children, pathname }: AppShellProps) {
  const { persona, setPersona, theme, setTheme } = useAppStore();

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
          <Brand employer={persona === "employee"} />
        </div>
        <nav className="flex-1 space-y-1 p-3" aria-label="Main navigation">
          {employeeNavigation.map((item) => (
            <a
              key={item.to}
              href={item.to}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
                pathname === item.to && "bg-sidebar-accent text-sidebar-primary",
              )}
            >
              <item.icon className="size-5" />
              <span>{item.label}</span>
            </a>
          ))}
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
            <Brand compact employer={persona === "employee"} />
          </div>
          <div className="hidden lg:block">
            <p className="text-xs text-muted-foreground">Radha Krishna Mills</p>
            <p className="text-sm font-semibold">Employee experience</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={persona} onValueChange={(value) => setPersona(value as Persona)}>
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
        {employeeNavigation
          .filter((item) => ["/me", "/me/wallet", "/me/redeem"].includes(item.to))
          .map((item) => (
            <a
              key={item.to}
              href={item.to}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 text-xs text-muted-foreground",
                pathname === item.to && "text-primary",
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
    </div>
  );
}
