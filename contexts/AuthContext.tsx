"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { securityApi } from "@/lib/api/security";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  created_at: string;
  profile_picture?: string;
}

interface GoogleConfig {
  client_id: string;
  scopes: string[];
}

interface LoginResult {
  requires2FA: boolean;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  verify2FA: (email: string, otp: string) => Promise<void>;
  signup: (email: string, otp: string, password: string) => Promise<void>;
  checkEmail: (email: string) => Promise<boolean>;
  requestOtp: (email: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  googleConfig: GoogleConfig | null;
  googleSignIn: () => void;
  handleGoogleCallback: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleConfig, setGoogleConfig] = useState<GoogleConfig | null>(null);
  const router = useRouter();

  // Check for existing token on mount and load Google config
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    
    setLoading(false);

    // Load Google OAuth config
    authApi.getGoogleConfig()
      .then(config => setGoogleConfig(config))
      .catch(() => {
        // Google OAuth not configured, that's fine
        console.log("Google OAuth not configured");
      });
  }, []);

  const checkEmail = async (email: string): Promise<boolean> => {
    try {
      const data = await authApi.checkEmail(email);
      return data.exists;
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to check email";
      toast.error(message);
      throw error;
    }
  };

  const requestOtp = async (email: string): Promise<void> => {
    try {
      const data = await authApi.requestOtp(email);
      if (data.success) {
        toast.success("Verification code sent to your email!");
      }
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to send verification code";
      toast.error(message);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const data = await authApi.login(email, password);
      
      // Check if 2FA is required
      if (data.requires_2fa) {
        toast.info("Verification code sent to your email");
        return { requires2FA: true, email: data.email };
      }
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      
      toast.success("Logged in successfully!");
      router.push("/dashboard");
      router.refresh();
      return { requires2FA: false };
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to login";
      toast.error(message);
      throw error;
    }
  };

  const verify2FA = async (email: string, otp: string) => {
    try {
      const data = await securityApi.verify2FA(email, otp);
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      
      toast.success("Logged in successfully!");
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      const message = error.response?.data?.error || "Invalid verification code";
      toast.error(message);
      throw error;
    }
  };

  const signup = async (email: string, otp: string, password: string) => {
    try {
      const data = await authApi.signup(email, otp, password);
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      
      toast.success("Account created successfully!");
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to create account";
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully");
    router.push("/");
    router.refresh();
  };

  const googleSignIn = () => {
    if (!googleConfig) {
      toast.error("Google sign-in is not available");
      return;
    }

    const redirectUri = `${window.location.origin}/auth`;
    const scope = googleConfig.scopes.join(" ");
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    
    authUrl.searchParams.set("client_id", googleConfig.client_id);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", scope);
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");
    
    window.location.href = authUrl.toString();
  };

  const handleGoogleCallback = async (code: string) => {
    try {
      const redirectUri = `${window.location.origin}/auth`;
      const data = await authApi.googleCallback(code, redirectUri);
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      
      if (data.is_new_user) {
        toast.success("Account created successfully!");
      } else {
        toast.success("Logged in successfully!");
      }
      
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      const message = error.response?.data?.error || "Google sign-in failed";
      toast.error(message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        verify2FA,
        signup,
        checkEmail,
        requestOtp,
        logout,
        isAuthenticated: !!user,
        googleConfig,
        googleSignIn,
        handleGoogleCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
