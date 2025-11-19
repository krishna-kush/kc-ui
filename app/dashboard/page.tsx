"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NavigationLayout } from "@/components/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { telemetryApi } from "@/lib/api";
import type { DashboardStats } from "@/types";
import { 
  Activity, 
  Key, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Shield,
  RefreshCw,
  Download
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";


export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const data = await telemetryApi.dashboard();
      setStats(data);
      if (!loading) {
        toast.success("Dashboard data refreshed");
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      
      // Use mock data when backend is unavailable
      const mockData: DashboardStats = {
        total_licenses: 0,
        active_licenses: 0,
        revoked_licenses: 0,
        total_verifications: 0,
        successful_verifications: 0,
        failed_verifications: 0,
        verifications_last_24h: 0,
        most_active_licenses: [],
      };
      
      setStats(mockData);
      
      if (!loading) {
        toast.error("Backend API unavailable. Showing empty dashboard.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <NavigationLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="mt-2 h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="mt-2 h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </NavigationLayout>
    );
  }

  const successRate =
    stats && stats.total_verifications > 0
      ? ((stats.successful_verifications / stats.total_verifications) * 100).toFixed(1)
      : "0";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <ProtectedRoute>
      <NavigationLayout>
      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              System-wide overview of your binary protection system
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStats}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          variants={containerVariants}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Licenses</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_licenses || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.active_licenses || 0} active
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Verifications
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" suppressHydrationWarning />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.total_verifications || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.verifications_last_24h || 0} in last 24h
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" suppressHydrationWarning />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{successRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.successful_verifications || 0} successful
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Attempts</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.failed_verifications || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requires attention
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* License Status Breakdown */}
        <motion.div variants={containerVariants} className="grid gap-4 md:grid-cols-3">
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" suppressHydrationWarning />
                  Active Licenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {stats?.active_licenses || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Currently protecting binaries
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  Revoked Licenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {stats?.revoked_licenses || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Manually revoked
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {stats?.verifications_last_24h || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Verifications in last 24h
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Most Active Licenses */}
        {stats?.most_active_licenses && stats.most_active_licenses.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Most Active Licenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.most_active_licenses.map((license, index) => (
                    <motion.div
                      key={license.license_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between border-b pb-3 last:border-0"
                    >
                      <div className="flex-1">
                        <p className="font-mono text-sm font-medium">
                          {license.license_id.substring(0, 24)}...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Binary: {license.binary_id.substring(0, 16)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">
                          {license.verification_count} verifications
                        </Badge>
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-blue-600 transition-all"
                            style={{
                              width: `${Math.min(
                                (license.verification_count / (stats.most_active_licenses?.[0]?.verification_count || 1)) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </NavigationLayout>
    </ProtectedRoute>
  );
}
