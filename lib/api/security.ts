import { api } from "./client";

export interface SecuritySettings {
  two_factor_enabled: boolean;
  has_password: boolean;
  auth_provider: "password" | "google" | "both";
  email: string;
}

export const securityApi = {
  getSecuritySettings: async (): Promise<SecuritySettings> => {
    const response = await api.get("/settings/security");
    return response.data;
  },

  toggle2FA: async (enabled: boolean): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/settings/security/2fa", { enabled });
    return response.data;
  },

  addPassword: async (password: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/settings/security/add-password", { password });
    return response.data;
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/settings/security/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  requestPasswordReset: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/auth/request-password-reset", { email });
    return response.data;
  },

  resetPassword: async (
    email: string,
    otp: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/auth/reset-password", {
      email,
      otp,
      new_password: newPassword,
    });
    return response.data;
  },

  verify2FA: async (email: string, otp: string) => {
    const response = await api.post("/auth/verify-2fa", { email, otp });
    return response.data;
  },
};
