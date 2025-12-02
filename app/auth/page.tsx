"use client";

import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, ArrowLeft, Shield, KeyRound, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { PasswordStrength, usePasswordStrength } from "@/components/ui/password-strength";

// Google Icon Component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

type AuthStep = "email" | "login" | "signup" | "otp" | "2fa";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, verify2FA, signup, checkEmail, requestOtp, isAuthenticated, loading: authLoading, googleConfig, googleSignIn, handleGoogleCallback } = useAuth();
  
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [twoFactorOtp, setTwoFactorOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Password strength validation
  const passwordStrength = usePasswordStrength(password);

  // Handle Google OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    if (code && !isAuthenticated) {
      setGoogleLoading(true);
      handleGoogleCallback(code)
        .catch(() => {
          // Error is handled in the context
        })
        .finally(() => {
          setGoogleLoading(false);
          // Clean up the URL
          router.replace('/auth');
        });
    }
  }, [searchParams, handleGoogleCallback, isAuthenticated, router]);

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      toast.error("Your session has expired. Please log in again.");
    }
    
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router, searchParams]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Start resend timer
  const startResendTimer = useCallback(() => {
    setResendTimer(60);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  if (authLoading || isAuthenticated) {
    return null;
  }

  // Show loading state during Google OAuth callback
  if (googleLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Signing in with Google...</p>
        </div>
      </div>
    );
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      const exists = await checkEmail(email);
      if (exists) {
        setStep("login");
      } else {
        setStep("signup");
      }
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.requires2FA) {
        setStep("2fa");
        startResendTimer();
      }
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorOtp || twoFactorOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    
    setLoading(true);
    try {
      await verify2FA(email, twoFactorOtp);
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (!passwordStrength.isValid) {
      toast.error("Please create a stronger password");
      return;
    }
    
    setLoading(true);
    try {
      await requestOtp(email);
      startResendTimer();
      setStep("otp");
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    
    setLoading(true);
    try {
      await signup(email, otp, password);
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "login" || step === "signup") {
      setStep("email");
      setPassword("");
      setConfirmPassword("");
    } else if (step === "otp") {
      setStep("signup");
      setOtp("");
    } else if (step === "2fa") {
      setStep("login");
      setTwoFactorOtp("");
    }
  };

  const getTitle = () => {
    switch (step) {
      case "email": return "Welcome to KillCode";
      case "login": return "Welcome Back";
      case "2fa": return "Verify Identity";
      case "signup": return "Create Account";
      case "otp": return "Verify Email";
    }
  };

  const getDescription = () => {
    switch (step) {
      case "email": return "Secure your files. Enter your email to continue.";
      case "login": return "Enter your password to sign in";
      case "2fa": return `Enter the verification code sent to ${email}`;
      case "signup": return "Set up your account credentials";
      case "otp": return `Enter the code sent to ${email}`;
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              {step !== "email" && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleBack}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" suppressHydrationWarning />
                </Button>
              )}
              <div>
                <CardTitle>{getTitle()}</CardTitle>
                <CardDescription>{getDescription()}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {/* Step 1: Email */}
              {step === "email" && (
                <motion.form
                  key="email-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleEmailSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" suppressHydrationWarning />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={loading || !email}
                  >
                    {loading ? "Checking..." : "Continue"}
                    <ArrowRight className="h-4 w-4" suppressHydrationWarning />
                  </Button>
                  
                  {/* Google Sign In */}
                  {googleConfig && (
                    <>
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full gap-2"
                        onClick={googleSignIn}
                        disabled={loading}
                      >
                        <GoogleIcon className="h-4 w-4" />
                        Sign in with Google
                      </Button>
                    </>
                  )}
                </motion.form>
              )}

              {/* Step 2a: Login (existing user) */}
              {step === "login" && (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email-display">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" suppressHydrationWarning />
                      <Input
                        id="email-display"
                        type="email"
                        value={email}
                        disabled
                        className="pl-10 bg-muted"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" suppressHydrationWarning />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoFocus
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={loading || !password}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                    <ArrowRight className="h-4 w-4" suppressHydrationWarning />
                  </Button>
                </motion.form>
              )}

              {/* Step 2b: Signup (new user) */}
              {step === "signup" && (
                <motion.form
                  key="signup-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignupSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email-display">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" suppressHydrationWarning />
                      <Input
                        id="email-display"
                        type="email"
                        value={email}
                        disabled
                        className="pl-10 bg-muted"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" suppressHydrationWarning />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoFocus
                        className="pl-10"
                      />
                    </div>
                    <PasswordStrength password={password} className="mt-2" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" suppressHydrationWarning />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="pl-10"
                      />
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500">Passwords do not match</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={loading || !password || !confirmPassword || !passwordStrength.isValid || password !== confirmPassword}
                  >
                    {loading ? "Sending code..." : "Create Account"}
                    <ArrowRight className="h-4 w-4" suppressHydrationWarning />
                  </Button>
                </motion.form>
              )}

              {/* Step 3: OTP Verification */}
              {step === "otp" && (
                <motion.form
                  key="otp-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleOtpSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" suppressHydrationWarning />
                      <Input
                        id="otp"
                        type="text"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        required
                        autoFocus
                        maxLength={6}
                        className="pl-10 text-center text-2xl tracking-widest font-mono"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter the 6-digit code sent to your email
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? "Verifying..." : "Verify & Create Account"}
                    <ArrowRight className="h-4 w-4" suppressHydrationWarning />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    disabled={loading || resendTimer > 0}
                    onClick={async () => {
                      setLoading(true);
                      try {
                        await requestOtp(email);
                        startResendTimer();
                        toast.success("Verification code resent!");
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : "Resend Code"}
                  </Button>
                </motion.form>
              )}

              {/* Step: 2FA Verification (for login) */}
              {step === "2fa" && (
                <motion.form
                  key="2fa-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handle2FASubmit}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="2fa-otp">Verification Code</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" suppressHydrationWarning />
                      <Input
                        id="2fa-otp"
                        type="text"
                        placeholder="000000"
                        value={twoFactorOtp}
                        onChange={(e) => setTwoFactorOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        required
                        autoFocus
                        maxLength={6}
                        className="pl-10 text-center text-2xl tracking-widest font-mono"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Two-factor authentication is enabled. Enter the 6-digit code sent to your email.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={loading || twoFactorOtp.length !== 6}
                  >
                    {loading ? "Verifying..." : "Verify & Sign In"}
                    <ArrowRight className="h-4 w-4" suppressHydrationWarning />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    disabled={loading || resendTimer > 0}
                    onClick={async () => {
                      setLoading(true);
                      try {
                        // Re-trigger login to resend 2FA code
                        await login(email, password);
                        startResendTimer();
                        toast.success("Verification code resent!");
                      } catch (error) {
                        // Error handled in context
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : "Resend Code"}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-xs text-center text-muted-foreground">
              <Link href="/" className="hover:underline">
                Back to home
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
