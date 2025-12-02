"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NavigationLayout } from "@/components/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { PageHeader } from "@/components/ui/page-header";
import { HardDrive, Shield, ChevronRight, Settings } from "lucide-react";
import Link from "next/link";

const settingsPages = [
  {
    name: "Storage",
    href: "/settings/storage",
    icon: HardDrive,
    description: "Manage your storage quota, view usage statistics, and clean up unused files.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    name: "Security",
    href: "/settings/security",
    icon: Shield,
    description: "Configure two-factor authentication, manage passwords, and review security settings.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
];

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <NavigationLayout>
        <div className="space-y-6">
          {/* Header */}
          <PageHeader
            title="Settings"
            subtitle="Manage your account settings and preferences"
            leading={
              <div className="p-2 rounded-lg bg-primary/10">
                <Settings className="h-6 w-6 text-primary" />
              </div>
            }
          />

          {/* Settings Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {settingsPages.map((page) => (
              <Link key={page.href} href={page.href}>
                <Card className="group h-full cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className={`p-3 rounded-lg ${page.bgColor}`}>
                      <page.icon className={`h-6 w-6 ${page.color}`} />
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-lg mb-2">{page.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {page.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </NavigationLayout>
    </ProtectedRoute>
  );
}
