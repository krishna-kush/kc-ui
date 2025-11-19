import { api } from "./client";
import type { DashboardStats } from "./types";

export interface AnalyticsData {
  key_metrics: {
    total_verifications: number;
    success_rate: number;
    unique_machines: number;
    avg_response_time_ms: number;
    growth_rate: number;
  };
  time_series: {
    daily: Array<{
      date: string;
      verifications: number;
      successes: number;
      failures: number;
    }>;
    monthly: Array<{
      date: string;
      verifications: number;
      successes: number;
      failures: number;
    }>;
  };
  hourly_activity: Array<{
    hour: string;
    count: number;
  }>;
  license_status: {
    active: number;
    revoked: number;
    expired: number;
    total: number;
  };
  top_binaries: Array<{
    binary_id: string;
    name: string;
    executions: number;
    unique_machines: number;
  }>;
  geographic_distribution: Array<{
    country: string;
    count: number;
    percentage: number;
  }>;
  recent_activity: {
    verifications_last_24h: number;
    verifications_last_7d: number;
    verifications_last_30d: number;
  };
}

export const statsApi = {
  dashboard: async () => {
    const response = await api.get<DashboardStats>("/telemetry/dashboard");
    return response.data;
  },

  analytics: async () => {
    const response = await api.get<AnalyticsData>("/analytics");
    return response.data;
  },

  verifications: async () => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await fetch(`${baseURL}/stats/verifications`);
    if (!response.ok) {
      throw new Error('Failed to fetch verification stats');
    }
    return response.json();
  },
};

// Alias for backward compatibility
export const telemetryApi = statsApi;
