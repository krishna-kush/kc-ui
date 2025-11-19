// Core data types matching the server API

export interface Binary {
  binary_id: string;
  original_name: string;
  original_size: number;
  wrapped_size: number;
  status: string;
  description?: string;
  is_active: boolean;
  grace_period?: number;
  stats: {
    total_executions: number;
    unique_hosts: number;
    last_execution?: string;
  };
  license_count: number;
  created_at: string;
  updated_at: string;
}

export interface License {
  license_id: string;
  binary_id: string;
  license_type: string;
  sync_mode?: boolean;
  check_interval_ms?: number;
  created_at: string;
  expires_at?: string;
  max_executions?: number;
  executions_used: number;
  revoked: boolean;
  grace_period: number;
  network_failure_kill_count?: number;
  failed_attempts: number;
  kill_method?: string;
  last_check_at?: string;
  allowed_machines?: string[];
}

export interface VerificationAttempt {
  timestamp: string;
  success: boolean;
  machine_fingerprint: string;
  ip_address: string;
  error_message?: string;
  failed_attempts: number;
  within_grace_period: boolean;
}

export interface VerificationHistory {
  license_id: string;
  total_attempts: number;
  successful_attempts: number;
  failed_attempts: number;
  last_verified_at?: string;
  attempts: VerificationAttempt[];
}

export interface DashboardStats {
  total_licenses: number;
  active_licenses: number;
  revoked_licenses: number;
  total_verifications: number;
  successful_verifications: number;
  failed_verifications: number;
  verifications_last_24h: number;
  most_active_licenses?: Array<{
    license_id: string;
    binary_id: string;
    verification_count: number;
  }>;
}

export interface BinaryAnalytics {
  binary_id: string;
  licenses: {
    total: number;
    active: number;
    revoked: number;
  };
  verifications: {
    total: number;
    successful: number;
    failed: number;
    success_rate: number;
  };
  machines: {
    unique_count: number;
    top_machines: Array<{
      machine_fingerprint: string;
      verification_count: number;
      last_verified_at: string;
    }>;
  };
}

export interface UploadBinaryRequest {
  file: File;
  headers: {
    "X-Filename": string;
    "X-User-ID": string;
    "X-Check-Interval-Ms"?: number;
    "X-Grace-Period"?: number;
  };
}

export interface UpdateLicenseRequest {
  expires_at?: string;
  expires_in_seconds?: number;
  max_executions?: number;
  check_interval_ms?: number;
  kill_method?: string;
  allowed_machines?: string[];
  revoked?: boolean;
}
