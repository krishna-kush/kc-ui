export interface Binary {
  id: string;
  binary_id: string;
  user_id: string;
  original_name: string;
  file_hash: string;
  file_size: number;
  original_size: number;
  wrapped_size: number;
  upload_date: string;
  status: string;
  description?: string;
  has_license: boolean;
  is_active: boolean;
  license_count?: number;
  last_verified?: string;
  verification_count?: number;
  grace_period?: number;
  stats: {
    total_executions: number;
    unique_hosts: number;
    last_execution?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface License {
  license_id: string;
  binary_id: string;
  user_id?: string;
  license_type: string;
  created_at: string;
  expires_at?: string;
  max_executions?: number;
  execution_count?: number;
  executions_used: number;
  is_active?: boolean;
  revoked: boolean;
  revoked_at?: string;
  allowed_machines?: string[];
  sync_mode?: boolean;
  check_interval_ms?: number;
  grace_period: number;
  network_failure_kill_count?: number;
  failed_attempts: number;
  kill_method: string;
  last_check_at?: string;
}

export interface VerificationHistory {
  id: string;
  license_id: string;
  binary_id: string;
  verified_at: string;
  machine_id: string;
  ip_address?: string;
  success: boolean;
  failure_reason?: string;
  location?: {
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface DashboardStats {
  total_binaries?: number;
  total_licenses: number;
  active_licenses: number;
  revoked_licenses: number;
  total_verifications: number;
  successful_verifications: number;
  failed_verifications: number;
  verifications_last_24h: number;
  recent_verifications?: VerificationHistory[];
  most_active_licenses?: Array<{
    license_id: string;
    binary_id: string;
    verification_count: number;
  }>;
}

export interface BinaryAnalytics {
  binary_id: string;
  total_verifications: number;
  unique_machines: number;
  success_rate: number;
  recent_activity: VerificationHistory[];
}

export interface UpdateLicenseRequest {
  max_executions?: number;
  expires_at?: string;
  allowed_machines?: string[];
  sync_mode?: boolean;
  check_interval_ms?: number;
  grace_period?: number;
  network_failure_kill_count?: number;
  kill_method?: string;
  revoked?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "error" | "warning" | "progress";
  percentage?: number;
  timestamp: string;
  read: boolean;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: "info" | "success" | "error" | "warning" | "progress";
  percentage?: number;
}

export interface UpdateNotificationRequest {
  title?: string;
  message?: string;
  type?: "info" | "success" | "error" | "warning" | "progress";
  percentage?: number;
  read?: boolean;
}
