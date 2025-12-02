"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Shield,
  Lock,
  KeyRound,
  Mail,
  AlertTriangle,
  Check,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { securityApi, SecuritySettings } from "@/lib/api/security";
import { toast } from "sonner";
import { NavigationLayout } from "@/components/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { PageHeader } from "@/components/ui/page-header";
import { PasswordStrength, usePasswordStrength } from "@/components/ui/password-strength";
import { Separator } from "@/components/ui/separator";

export default function SecuritySettingsPage() {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling2FA, setToggling2FA] = useState(false);
  
  // Add password dialog state
  const [addPasswordOpen, setAddPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [addingPassword, setAddingPassword] = useState(false);
  const passwordStrength = usePasswordStrength(newPassword);
  
  // Change password dialog state
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [changeNewPassword, setChangeNewPassword] = useState("");
  const [confirmChangePassword, setConfirmChangePassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const changePasswordStrength = usePasswordStrength(changeNewPassword);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await securityApi.getSecuritySettings();
      setSettings(data);
    } catch (error) {
      toast.error("Failed to load security settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    if (!settings) return;
    
    setToggling2FA(true);
    try {
      await securityApi.toggle2FA(enabled);
      setSettings({ ...settings, two_factor_enabled: enabled });
      toast.success(enabled ? "2FA enabled successfully" : "2FA disabled successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update 2FA settings");
    } finally {
      setToggling2FA(false);
    }
  };

  const handleAddPassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (!passwordStrength.isValid) {
      toast.error("Please create a stronger password");
      return;
    }
    
    setAddingPassword(true);
    try {
      await securityApi.addPassword(newPassword);
      toast.success("Password added successfully");
      setAddPasswordOpen(false);
      setNewPassword("");
      setConfirmNewPassword("");
      loadSettings();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add password");
    } finally {
      setAddingPassword(false);
    }
  };

  const handleChangePassword = async () => {
    if (changeNewPassword !== confirmChangePassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (!changePasswordStrength.isValid) {
      toast.error("Please create a stronger password");
      return;
    }
    
    setChangingPassword(true);
    try {
      await securityApi.changePassword(currentPassword, changeNewPassword);
      toast.success("Password changed successfully");
      setChangePasswordOpen(false);
      setCurrentPassword("");
      setChangeNewPassword("");
      setConfirmChangePassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const getAuthProviderLabel = (provider: string) => {
    switch (provider) {
      case "password":
        return "Email & Password";
      case "google":
        return "Google";
      case "both":
        return "Email & Password + Google";
      default:
        return provider;
    }
  };

  return (
    <ProtectedRoute>
      <NavigationLayout>
        <div className="space-y-6 max-w-5xl mx-auto">
          <PageHeader
            title="Security Settings"
            subtitle="Manage your account security and authentication methods"
          />

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : settings ? (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Account Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                  <CardDescription>
                    Your current authentication methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="font-medium">{settings.email}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sign-in Methods</span>
                    <span className="font-medium">{getAuthProviderLabel(settings.auth_provider)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Password Set</span>
                    <span className={`font-medium ${settings.has_password ? "text-green-500" : "text-yellow-500"}`}>
                      {settings.has_password ? "Yes" : "No"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Two-Factor Authentication Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5" />
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Email-based 2FA</p>
                      <p className="text-sm text-muted-foreground">
                        Receive a verification code via email on each login
                      </p>
                    </div>
                    <Switch
                      checked={settings.two_factor_enabled}
                      onCheckedChange={handleToggle2FA}
                      disabled={toggling2FA || !settings.has_password}
                    />
                  </div>
                  {!settings.has_password && (
                    <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>Add a password to enable 2FA</span>
                    </div>
                  )}
                  {settings.two_factor_enabled && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                      <Check className="h-4 w-4 shrink-0" />
                      <span>2FA is active. You'll receive a code on each password login.</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Password Management Card */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Password Management
                  </CardTitle>
                  <CardDescription>
                    {settings.has_password 
                      ? "Update your password or add additional security" 
                      : "Set up a password to sign in with email"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!settings.has_password ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>
                          You signed up with Google. Add a password to also sign in with email.
                        </span>
                      </div>
                      <Dialog open={addPasswordOpen} onOpenChange={setAddPasswordOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Lock className="h-4 w-4 mr-2" />
                            Add Password
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Password</DialogTitle>
                            <DialogDescription>
                              Set a password to sign in with your email address
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="new-password">New Password</Label>
                              <Input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                              />
                              <PasswordStrength password={newPassword} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirm-password">Confirm Password</Label>
                              <Input
                                id="confirm-password"
                                type="password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                placeholder="Confirm new password"
                              />
                              {confirmNewPassword && newPassword !== confirmNewPassword && (
                                <p className="text-xs text-red-500">Passwords do not match</p>
                              )}
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setAddPasswordOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleAddPassword}
                              disabled={
                                addingPassword ||
                                !passwordStrength.isValid ||
                                newPassword !== confirmNewPassword
                              }
                            >
                              {addingPassword ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Adding...
                                </>
                              ) : (
                                "Add Password"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Lock className="h-4 w-4 mr-2" />
                            Change Password
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Change Password</DialogTitle>
                            <DialogDescription>
                              Enter your current password and choose a new one
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="current-password">Current Password</Label>
                              <Input
                                id="current-password"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="change-new-password">New Password</Label>
                              <Input
                                id="change-new-password"
                                type="password"
                                value={changeNewPassword}
                                onChange={(e) => setChangeNewPassword(e.target.value)}
                                placeholder="Enter new password"
                              />
                              <PasswordStrength password={changeNewPassword} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirm-change-password">Confirm New Password</Label>
                              <Input
                                id="confirm-change-password"
                                type="password"
                                value={confirmChangePassword}
                                onChange={(e) => setConfirmChangePassword(e.target.value)}
                                placeholder="Confirm new password"
                              />
                              {confirmChangePassword && changeNewPassword !== confirmChangePassword && (
                                <p className="text-xs text-red-500">Passwords do not match</p>
                              )}
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setChangePasswordOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleChangePassword}
                              disabled={
                                changingPassword ||
                                !currentPassword ||
                                !changePasswordStrength.isValid ||
                                changeNewPassword !== confirmChangePassword
                              }
                            >
                              {changingPassword ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Changing...
                                </>
                              ) : (
                                "Change Password"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Failed to load security settings
              </CardContent>
            </Card>
          )}
        </div>
      </NavigationLayout>
    </ProtectedRoute>
  );
}
