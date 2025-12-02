import { api } from "./client";

interface AuthResponse {
  token: string;
  user: { id: string; email: string; created_at: string; profile_picture?: string };
  is_new_user: boolean;
}

interface CheckEmailResponse {
  exists: boolean;
  email: string;
}

interface RequestOtpResponse {
  success: boolean;
  message: string;
}

interface GoogleConfigResponse {
  client_id: string;
  scopes: string[];
}

export const authApi = {
  // Check if email exists (Step 1)
  checkEmail: async (email: string): Promise<CheckEmailResponse> => {
    const response = await api.post<CheckEmailResponse>("/auth/check-email", { email });
    return response.data;
  },

  // Login for existing users (Step 2a)
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", { email, password });
    return response.data;
  },

  // Request OTP for new users (Step 2b)
  requestOtp: async (email: string): Promise<RequestOtpResponse> => {
    const response = await api.post<RequestOtpResponse>("/auth/request-otp", { email });
    return response.data;
  },

  // Verify OTP and complete signup (Step 3)
  signup: async (email: string, otp: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/signup", { email, otp, password });
    return response.data;
  },

  // Legacy auth endpoint (for backwards compatibility)
  legacyAuth: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth", { email, password });
    return response.data;
  },

  // Google OAuth - Get config (client ID)
  getGoogleConfig: async (): Promise<GoogleConfigResponse> => {
    const response = await api.get<GoogleConfigResponse>("/auth/google/config");
    return response.data;
  },

  // Google OAuth - Exchange code for token
  googleCallback: async (code: string, redirectUri: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/google/callback", {
      code,
      redirect_uri: redirectUri,
    });
    return response.data;
  },
};
