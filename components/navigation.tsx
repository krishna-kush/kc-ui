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

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Binaries", href: "/binaries", icon: FileCode2 },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Licenses", href: "/licenses", icon: Key },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

const settingsItems = [
  { name: "Storage", href: "/settings/storage", icon: HardDrive },
];

import { HardDrive } from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);

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
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 px-3 py-2 mb-4 text-foreground cursor-pointer hover:opacity-80 transition-opacity">
            <Link href="/dashboard" className="flex items-center gap-2">
              <img src="/kc-icon.svg" alt="KillCode Logo" className="h-6 w-6" />
              <GlitchText
                speed={0.5}
                enableShadows={true}
                glitchTimeout={1.5}
                loop={20}
                firstGlitchColor={
                  isDark ? "var(--primary)" : "var(--primary-shade)"
                }
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
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
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

export function NavigationLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    logout();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
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
                      className="rounded-full"
                    >
                      <Avatar className="h-8 w-8">
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
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </header>
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
