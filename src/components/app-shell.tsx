import {
  BarChart3,
  Bell,
  Bot,
  CheckSquare,
  ChevronDown,
  Gift,
  Heart,
  Home,
  IndianRupee,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Palette,
  Plug,
  RotateCcw,
  Settings,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Sun,
  Trophy,
  UserRound,
  Users,
  WalletCards,
  Workflow,
  Eye,
  TrendingUp,
  TimerReset,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { AiCopilot } from "@/components/ai-copilot";
import { Brand } from "@/components/brand";
import {
  OfflineBanner,
  PageSkeleton,
  SessionTimeout,
  showApiError,
} from "@/components/global-states";
import { NotificationsPanel } from "@/components/notifications-panel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePendingApprovals } from "@/hooks/use-pending-approvals";
import { useT } from "@/lib/i18n";
import { go } from "@/lib/navigate";
import {
  accessFor,
  type NavKey,
  otherSurfaces,
  personaUser,
  roleLabel,
  sectionFor,
  visibleNav,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { type Persona, canUseCopilot, personaHome, useAppStore } from "@/store/app-store";
import { useDemoStore } from "@/store/demo-store";
import { useStatusStore } from "@/store/status-store";

const navIcons: Record<NavKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  boards: BarChart3,
  workflows: Workflow,
  approvals: CheckSquare,
  rewards: Gift,
  people: Users,
  connectors: Plug,
  analytics: TrendingUp,
  budget: IndianRupee,
  copilot: Bot,
  settings: Settings,
};

const surfaceIcons: Record<string, LucideIcon> = {
  "/me": Smartphone,
  "/whatsapp": Smartphone,
  "/kiosk": Monitor,
};

function screenFor(pathname: string, persona: Persona): string {
  if (pathname.startsWith("/workflows/")) return "builder";
  if (pathname.startsWith("/boards/")) return "board-config";
  if (pathname.startsWith("/dashboard")) return persona;
  const first = pathname.split("/")[1] ?? "";
  const map: Record<string, string> = { rewards: "rewards-admin" };
  return map[first] ?? (first || "default");
}

type AppShellProps = { children: ReactNode; pathname: string };

export function AppShell({ children, pathname }: AppShellProps) {
  const { persona, setPersona, theme, setTheme, openCopilot, aiAvailable } = useAppStore();
  const isEmployee = pathname.startsWith("/me");
  const [menuOpen, setMenuOpen] = useState(false);
  const access = isEmployee ? "full" : accessFor(pathname, persona);
  const section = sectionFor(pathname);
  const copilotOn = aiAvailable && canUseCopilot(persona) && !isEmployee;
  // Skeleton on page load (checklist §6.2), briefly, while the screen's data "arrives".
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    const t = window.setTimeout(() => setReady(true), 300);
    return () => window.clearTimeout(t);
  }, [pathname]);

  const changePersona = (next: Persona) => {
    setPersona(next);
    go(personaHome[next]);
  };

  const nav = isEmployee ? (
    <EmployeeNav pathname={pathname} />
  ) : (
    <AdminNav pathname={pathname} persona={persona} />
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="border-b border-sidebar-border p-5">
          <Brand employer={isEmployee} />
          {!isEmployee && (
            <p className="mt-3 truncate rounded-md bg-sidebar-accent px-2.5 py-1.5 text-xs font-medium">
              Radha Krishna Mills
            </p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        <div className="flex items-center gap-1 border-t border-sidebar-border p-3">
          <NotificationsPanel persona={persona} align="start" side="top" />
          <ProfileMenu persona={persona} onPersona={changePersona} wide />
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-2 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              className="size-11"
              onClick={() => setMenuOpen(true)}
            >
              <Menu />
            </Button>
            <Brand compact employer={isEmployee} />
          </div>
          <div className="hidden lg:block">
            <p className="text-xs text-muted-foreground">
              {isEmployee ? "Employee app" : "Radha Krishna Mills"}
            </p>
            <p className="text-sm font-semibold">
              {isEmployee ? personaUser.employee.name : `${roleLabel[persona]} workspace`}
            </p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Select value={persona} onValueChange={(value) => changePersona(value as Persona)}>
              <SelectTrigger className="h-10 w-[150px]" aria-label="Demo: view the app as">
                <Eye className="size-4 shrink-0 text-muted-foreground" />
                <span className="sr-only sm:not-sr-only sm:text-xs sm:text-muted-foreground">
                  As
                </span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="hr">HR Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
            <TooltipProvider>
              {copilotOn && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-11"
                      aria-label="Open AI Copilot"
                      onClick={() => openCopilot()}
                    >
                      <Sparkles className="text-primary" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>AI Copilot (this screen)</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden size-11 sm:inline-flex"
                    aria-label={theme === "light" ? "Use dark theme" : "Use light theme"}
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  >
                    {theme === "light" ? <Moon /> : <Sun />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Switch theme</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="lg:hidden">
              <NotificationsPanel persona={persona} align="end" side="bottom" />
            </div>
          </div>
        </header>
        <OfflineBanner />
        <main
          id="main-content"
          className="mx-auto w-full max-w-[1440px] px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-10"
        >
          {!ready ? (
            <PageSkeleton />
          ) : access === "none" ? (
            <PermissionDenied persona={persona} />
          ) : (
            <>
              {access === "view" && section?.viewNote && (
                <div className="mb-5 flex items-start gap-2 rounded-md border border-private/25 bg-private-surface px-4 py-3 text-sm text-private">
                  <Eye className="mt-0.5 size-4 shrink-0" />
                  <span>
                    <strong className="font-semibold">View only.</strong> {section.viewNote}
                  </span>
                </div>
              )}
              {children}
            </>
          )}
        </main>
      </div>

      <MobileBottomNav pathname={pathname} persona={persona} isEmployee={isEmployee} />
      <SessionTimeout />

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-[290px] overflow-y-auto p-0">
          <SheetHeader className="border-b border-border p-5 text-left">
            <SheetTitle asChild>
              <div>
                <Brand employer={isEmployee} />
              </div>
            </SheetTitle>
          </SheetHeader>
          <div onClick={() => setMenuOpen(false)}>{nav}</div>
          <div className="border-t border-border p-3">
            <ProfileMenu persona={persona} onPersona={changePersona} wide />
          </div>
        </SheetContent>
      </Sheet>
      {copilotOn && <AiCopilot screen={screenFor(pathname, persona)} />}
    </div>
  );
}

function NavLink({
  to,
  label,
  icon: Icon,
  active,
  badge,
  sub = false,
}: {
  to: string;
  label: string;
  icon?: LucideIcon | undefined;
  active: boolean;
  badge?: number | undefined;
  sub?: boolean;
}) {
  return (
    <a
      href={to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
        sub && "min-h-9 pl-11 text-[13px] font-normal text-muted-foreground",
        active && !sub && "bg-sidebar-accent text-primary",
        active && sub && "font-semibold text-primary",
      )}
    >
      {Icon && <Icon className="size-5 shrink-0" />}
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className="grid min-w-6 place-items-center rounded-full bg-destructive px-1.5 text-xs font-semibold text-white"
          aria-label={`${badge} pending`}
        >
          {badge}
        </span>
      )}
    </a>
  );
}

function AdminNav({ pathname, persona }: { pathname: string; persona: Persona }) {
  const pending = usePendingApprovals(persona).length;
  const [path, query] = pathname.split("?");
  const items = visibleNav(persona);
  return (
    <nav className="space-y-0.5 p-3" aria-label="Main navigation">
      {items.map((item) => {
        const to = item.key === "dashboard" ? personaHome[persona] : item.to;
        const active = sectionFor(pathname)?.key === item.key;
        const children =
          item.key === "dashboard" && persona !== "manager"
            ? [
                { to: personaHome[persona], label: "Organisation" },
                { to: "/dashboard/manager", label: "Team view" },
              ]
            : item.children;
        return (
          <div key={item.key}>
            <NavLink
              to={to}
              label={item.label}
              icon={navIcons[item.key]}
              active={active}
              badge={item.key === "approvals" ? pending : undefined}
            />
            {active && children && children.length > 1 && (
              <div className="mb-1 mt-0.5 space-y-0.5">
                {children.map((child) => {
                  const [childPath, childQuery] = child.to.split("?");
                  const childActive = childQuery
                    ? path === childPath &&
                      (query === childQuery || (!query && childQuery === "tab=org"))
                    : path === childPath;
                  return (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      label={child.label}
                      active={childActive}
                      sub
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {(persona === "owner" || persona === "hr") && (
        <div className="pt-4">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Other surfaces
          </p>
          {otherSurfaces.map((s) => (
            <NavLink
              key={s.to}
              to={s.to}
              label={s.label}
              icon={surfaceIcons[s.to]}
              active={pathname === s.to}
            />
          ))}
        </div>
      )}
    </nav>
  );
}

function EmployeeNav({ pathname }: { pathname: string }) {
  const t = useT();
  const items = [
    { to: "/me", label: t("nav.home"), icon: Home },
    { to: "/me/wallet", label: t("nav.wallet"), icon: WalletCards },
    { to: "/me/recognitions", label: t("nav.recognitions"), icon: Trophy },
    { to: "/me/tracking", label: t("nav.tracking"), icon: Sparkles },
    { to: "/me/redeem", label: t("nav.redeem"), icon: Gift },
    { to: "/me/shoutout", label: t("nav.shoutout"), icon: Heart },
    { to: "/me/preferences", label: t("nav.preferences"), icon: SlidersHorizontal },
  ];
  return (
    <nav className="space-y-0.5 p-3" aria-label="Main navigation">
      {items.map((item) => (
        <NavLink key={item.to} {...item} active={pathname === item.to} />
      ))}
    </nav>
  );
}

function MobileBottomNav({
  pathname,
  persona,
  isEmployee,
}: {
  pathname: string;
  persona: Persona;
  isEmployee: boolean;
}) {
  const t = useT();
  const pending = usePendingApprovals(persona).length;
  // Checklist §8.2: Dashboard, Approvals, Rewards, Profile.
  const items = isEmployee
    ? [
        { to: "/me", label: t("nav.home"), icon: Home },
        { to: "/me/wallet", label: t("nav.wallet"), icon: WalletCards },
        { to: "/me/redeem", label: t("nav.redeem"), icon: Gift },
        { to: "/me/preferences", label: t("nav.profile"), icon: UserRound },
      ]
    : [
        { to: personaHome[persona], label: "Dashboard", icon: LayoutDashboard },
        { to: "/approvals", label: "Approvals", icon: CheckSquare, badge: pending },
        { to: "/rewards", label: "Rewards", icon: Gift },
        { to: "/me/preferences", label: "Profile", icon: UserRound },
      ];
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-background px-2 pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Mobile navigation"
    >
      {items.map((item) => (
        <a
          key={item.to}
          href={item.to}
          aria-current={pathname === item.to ? "page" : undefined}
          className={cn(
            "relative flex min-h-16 flex-col items-center justify-center gap-1 text-xs text-muted-foreground",
            pathname === item.to && "font-semibold text-primary",
          )}
        >
          <item.icon className="size-5" />
          {item.label}
          {"badge" in item && item.badge ? (
            <span className="absolute right-[22%] top-2 grid min-w-5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
              {item.badge}
            </span>
          ) : null}
        </a>
      ))}
    </nav>
  );
}

function ProfileMenu({
  persona,
  onPersona,
  wide = false,
}: {
  persona: Persona;
  onPersona: (p: Persona) => void;
  wide?: boolean;
}) {
  const user = personaUser[persona];
  const { emptyOrg, setEmptyOrg, reset } = useDemoStore();
  const { aiAvailable, setAiAvailable } = useAppStore();
  const { simulatedOffline, setSimulatedOffline, setSessionWarning } = useStatusStore();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex min-h-11 items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-sidebar-accent",
            wide && "flex-1",
          )}
          aria-label="Profile and demo settings"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {user.initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{user.name}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {roleLabel[persona]}
            </span>
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-64">
        <DropdownMenuLabel>
          <p>{user.name}</p>
          <p className="text-xs font-normal text-muted-foreground">{user.detail}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => go("/me/preferences")}>
          <SlidersHorizontal /> My preferences & language
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => go("/me")}>
          <Smartphone /> My employee app
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Demo: view as
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={persona} onValueChange={(v) => onPersona(v as Persona)}>
          <DropdownMenuRadioItem value="owner">Owner / MD</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="hr">HR Admin</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="manager">Team Manager</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="employee">Employee</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="justify-between">
          <label htmlFor="demo-empty" className="cursor-pointer">
            New organisation (empty states)
          </label>
          <Switch id="demo-empty" checked={emptyOrg} onCheckedChange={setEmptyOrg} />
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="justify-between">
          <label htmlFor="demo-ai" className="cursor-pointer">
            AI available
          </label>
          <Switch id="demo-ai" checked={aiAvailable} onCheckedChange={setAiAvailable} />
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="justify-between">
          <label htmlFor="demo-offline" className="cursor-pointer">
            Simulate offline
          </label>
          <Switch
            id="demo-offline"
            checked={simulatedOffline}
            onCheckedChange={setSimulatedOffline}
          />
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => showApiError(() => toast.success("Retried — everything loaded."))}
        >
          <TriangleAlert /> Simulate an API error
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setSessionWarning(true)}>
          <TimerReset /> Simulate session timeout
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => reset()}>
          <RotateCcw /> Reset demo data
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => go("/design-system")}>
          <Palette /> Design system
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => go("/login")}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PermissionDenied({ persona }: { persona: Persona }) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-private-surface text-private">
        <LockKeyhole className="size-7" />
      </div>
      <h1 className="mt-5 text-2xl font-bold">You don't have permission to view this</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The {roleLabel[persona]} role can't open this screen. Ask your HR Admin or the Owner if you
        need access.
      </p>
      <Button className="mt-6" asChild>
        <a href={personaHome[persona]}>Go to my dashboard</a>
      </Button>
    </div>
  );
}
