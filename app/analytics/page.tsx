"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { NavigationLayout } from "@/components/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { telemetryApi, type AnalyticsData } from "@/lib/api";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  MapPin,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const data = await telemetryApi.analytics();
      setAnalyticsData(data);
      toast.success("Analytics refreshed");
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to fetch analytics data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <NavigationLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading analytics...</p>
            </div>
          </div>
        </NavigationLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <NavigationLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
              <p className="text-muted-foreground">
                Detailed insights and metrics for your binary licenses
              </p>
            </div>
            <Button
              onClick={fetchAnalytics}
              variant="outline"
              size="sm"
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Verifications</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" suppressHydrationWarning />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.key_metrics.total_verifications.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData?.key_metrics.growth_rate !== undefined && (
                    <>
                      {analyticsData.key_metrics.growth_rate >= 0 ? (
                        <TrendingUp className="inline h-3 w-3 text-green-500" suppressHydrationWarning />
                      ) : (
                        <TrendingDown className="inline h-3 w-3 text-red-500" suppressHydrationWarning />
                      )}{" "}
                      {analyticsData.key_metrics.growth_rate >= 0 ? "+" : ""}
                      {analyticsData.key_metrics.growth_rate.toFixed(1)}% from last week
                    </>
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" suppressHydrationWarning />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.key_metrics.success_rate.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Verification success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Machines</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" suppressHydrationWarning />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.key_metrics.unique_machines.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Distinct machine fingerprints
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" suppressHydrationWarning />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.key_metrics.avg_response_time_ms.toFixed(0) || 0}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Average verification latency
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row - Verifications Over Time and License Status */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Verifications Over Time (24h) */}
            <Card>
              <CardHeader>
                <CardTitle>Verifications Over Time (24h)</CardTitle>
                <CardDescription>
                  Real-time verification activity breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData?.hourly_activity || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="hour" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.6}
                      name="Verifications"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* License Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>License Status Distribution</CardTitle>
                <CardDescription>
                  Current status breakdown of all licenses
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Active", value: analyticsData?.license_status.active || 0, color: "#22c55e" },
                        { name: "Revoked", value: analyticsData?.license_status.revoked || 0, color: "#ef4444" },
                        { name: "Expired", value: analyticsData?.license_status.expired || 0, color: "#64748b" },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#22c55e" />
                      <Cell fill="#ef4444" />
                      <Cell fill="#64748b" />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Verification Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Trends</CardTitle>
              <CardDescription>
                Monthly verification activity over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData?.time_series.monthly || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="successes"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Successful"
                  />
                  <Area
                    type="monotone"
                    dataKey="failures"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                    name="Failed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Hourly Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Hourly Activity</CardTitle>
                <CardDescription>
                  Verification patterns throughout the day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analyticsData?.hourly_activity || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="hour" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Binaries */}
            <Card>
              <CardHeader>
                <CardTitle>Top Binaries</CardTitle>
                <CardDescription>
                  Most frequently executed binaries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData?.top_binaries.length ? (
                    analyticsData.top_binaries.map((binary, index) => {
                      const colors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];
                      const maxExecutions = analyticsData.top_binaries[0]?.executions || 1;
                      return (
                        <div key={binary.binary_id} className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-8 text-center font-bold text-muted-foreground">
                            #{index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium truncate" title={binary.name}>
                                {binary.name}
                              </span>
                              <span className="text-sm text-muted-foreground ml-2">
                                {binary.executions.toLocaleString()}
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full transition-all"
                                style={{
                                  width: `${(binary.executions / maxExecutions) * 100}%`,
                                  backgroundColor: colors[index % colors.length],
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No binary execution data available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>
                  Top countries/regions by verification count
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData?.geographic_distribution.length ? (
                    analyticsData.geographic_distribution.map((country, index) => {
                      const maxCount = analyticsData.geographic_distribution[0]?.count || 1;
                      return (
                        <div key={country.country} className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-6 text-center text-sm text-muted-foreground">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{country.country}</span>
                              <span className="text-sm text-muted-foreground">
                                {country.count.toLocaleString()}
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{
                                  width: `${(country.count / maxCount) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {country.percentage.toFixed(1)}%
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No geographic data available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </NavigationLayout>
    </ProtectedRoute>
  );
}
