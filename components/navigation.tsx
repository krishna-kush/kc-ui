"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Home,
  LayoutDashboard,
  FileCode2,
  Upload,
  Key,
  BarChart3,
  LogOut,
  User,
  Settings,
  ChevronDown,
  ChevronRight,
  HardDrive,
  Shield,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from "@/components/notification-dropdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";

import GlitchText from "@/components/GlitchText";
import { FolderOpen } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Files", href: "/files", icon: FolderOpen },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Licenses", href: "/licenses", icon: Key },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

const settingsItems = [
  { name: "Storage", href: "/settings/storage", icon: HardDrive },
  { name: "Security", href: "/settings/security", icon: Shield },
];

function SidebarLogo({ isDark, showExpandIcon }: { isDark: boolean; showExpandIcon: boolean }) {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  // In collapsed mode, show expand icon when hovering anywhere on sidebar
  if (isCollapsed) {
    return (
      <div 
        className="flex items-center justify-center cursor-pointer"
        onClick={toggleSidebar}
      >
        {showExpandIcon ? (
          <PanelLeftOpen className="h-6 w-6 text-foreground" />
        ) : (
          <img src="/kc-icon.svg" alt="KillCode Logo" className="h-6 w-6 shrink-0" />
        )}
      </div>
    );
  }

  // In expanded mode, show full logo linking to dashboard
  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      <img src="/kc-icon.svg" alt="KillCode Logo" className="h-6 w-6 shrink-0" />
      <GlitchText
        speed={0.5}
        enableShadows={true}
        glitchTimeout={1.5}
        loop={20}
        firstGlitchColor={isDark ? "var(--primary)" : "var(--primary-shade)"}
        secondGlitchColor={"var(--secondary)"}
        keepFirstGlitch={true}
        keepSecondGlitch={false}
        size={"1.5rem"}
        glitchIntensity={3}
        textColor="var(--foreground)"
        className="inline-block align-baseline !opacity-100"
      >
        killcode
      </GlitchText>
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (pathname?.startsWith("/settings")) {
      setIsSettingsOpen(true);
    }
  }, [pathname]);

  const isDark = mounted ? resolvedTheme === "dark" || theme === "dark" : true;

  const handleSignOut = () => {
    logout();
  };

  return (
    <Sidebar 
      collapsible="icon"
      onMouseEnter={() => setIsSidebarHovered(true)}
      onMouseLeave={() => setIsSidebarHovered(false)}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 px-3 py-2 mb-4 text-foreground cursor-pointer hover:opacity-80 transition-opacity group-data-[collapsible=icon]:!opacity-100 group-data-[collapsible=icon]:!mt-0 group-data-[collapsible=icon]:justify-center">
            <SidebarLogo isDark={isDark} showExpandIcon={isSidebarHovered} />
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      className={cn(
                        "py-2 px-3 h-9 transition-all",
                        !isActive && "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span className="ml-2 text-sm font-medium">
                          {item.name}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Settings Accordion */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  isActive={pathname?.startsWith("/settings")}
                  tooltip="Settings"
                  className={cn(
                    "py-2 px-3 h-9 w-full justify-between group transition-all",
                    !pathname?.startsWith("/settings") &&
                      "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex items-center">
                    <Settings className="h-4 w-4" />
                    <span className="ml-2 text-sm font-medium">Settings</span>
                  </div>
                  {isSettingsOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                  )}
                </SidebarMenuButton>
                
                <AnimatePresence initial={false}>
                  {isSettingsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1 space-y-0.5">
                        {settingsItems.map((item) => {
                          const isActive = pathname === item.href;
                          return (
                            <SidebarMenuButton
                              key={item.name}
                              asChild
                              isActive={isActive}
                              tooltip={item.name}
                              className={cn(
                                "py-2 px-3 pl-8 h-9 transition-all",
                                !isActive &&
                                  "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <Link href={item.href}>
                                <item.icon className="h-4 w-4" />
                                <span className="ml-2 text-sm font-medium">
                                  {item.name}
                                </span>
                              </Link>
                            </SidebarMenuButton>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function HeaderContent() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleSignOut = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
      {/* Only show SidebarTrigger when sidebar is expanded */}
      {!isCollapsed && <SidebarTrigger />}
      <div className="flex-1" />
      {user && (
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <NotificationDropdown />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user.profile_picture} 
                    alt={user.email}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback>
                    {user.email[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {user.email.split("@")[0]}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2" asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="gap-2 text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  );
}

export function NavigationLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1">
          <HeaderContent />
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
