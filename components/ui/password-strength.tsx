"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Check, X, AlertTriangle } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
  warning?: string;
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const analysis = useMemo(() => {
    const requirements: PasswordRequirement[] = [
      {
        label: "At least 8 characters",
        met: password.length >= 8,
        warning: password.length > 0 && password.length < 8 
          ? `${8 - password.length} more characters needed` 
          : undefined,
      },
      {
        label: "Contains uppercase letter",
        met: /[A-Z]/.test(password),
        warning: password.length > 0 && !/[A-Z]/.test(password) 
          ? "Add an uppercase letter (A-Z)" 
          : undefined,
      },
      {
        label: "Contains lowercase letter",
        met: /[a-z]/.test(password),
        warning: password.length > 0 && !/[a-z]/.test(password) 
          ? "Add a lowercase letter (a-z)" 
          : undefined,
      },
      {
        label: "Contains number",
        met: /\d/.test(password),
        warning: password.length > 0 && !/\d/.test(password) 
          ? "Add a number (0-9)" 
          : undefined,
      },
      {
        label: "Contains special character",
        met: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']/.test(password),
        warning: password.length > 0 && !/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']/.test(password) 
          ? "Add a special character (!@#$%^&*)" 
          : undefined,
      },
    ];

    const metCount = requirements.filter((r) => r.met).length;
    const total = requirements.length;

    let strength: "weak" | "fair" | "good" | "strong" = "weak";
    let strengthLabel = "Weak";
    let strengthColor = "bg-red-500";

    if (metCount === total) {
      strength = "strong";
      strengthLabel = "Strong";
      strengthColor = "bg-green-500";
    } else if (metCount >= 4) {
      strength = "good";
      strengthLabel = "Good";
      strengthColor = "bg-blue-500";
    } else if (metCount >= 3) {
      strength = "fair";
      strengthLabel = "Fair";
      strengthColor = "bg-yellow-500";
    }

    // Additional security checks
    const commonPatterns = [
      /^123456/,
      /password/i,
      /qwerty/i,
      /abc123/i,
      /letmein/i,
      /welcome/i,
      /admin/i,
      /(.)\1{2,}/, // Repeated characters
    ];

    const hasCommonPattern = commonPatterns.some((pattern) => pattern.test(password));
    const suggestions: string[] = [];

    if (hasCommonPattern && password.length > 0) {
      suggestions.push("Avoid common patterns or repeated characters");
    }

    if (password.length > 0 && password.length < 12) {
      suggestions.push("Consider using 12+ characters for better security");
    }

    return {
      requirements,
      metCount,
      total,
      strength,
      strengthLabel,
      strengthColor,
      percentage: (metCount / total) * 100,
      suggestions,
      hasCommonPattern,
    };
  }, [password]);

  if (!password) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span
            className={cn(
              "font-medium",
              analysis.strength === "strong" && "text-green-500",
              analysis.strength === "good" && "text-blue-500",
              analysis.strength === "fair" && "text-yellow-500",
              analysis.strength === "weak" && "text-red-500"
            )}
          >
            {analysis.strengthLabel}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300 rounded-full",
              analysis.strengthColor
            )}
            style={{ width: `${analysis.percentage}%` }}
          />
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-1.5">
        {analysis.requirements.map((req, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors duration-200",
              req.met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
            )}
          >
            {req.met ? (
              <Check className="h-3 w-3 shrink-0" />
            ) : (
              <X className="h-3 w-3 shrink-0 text-muted-foreground/50" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>

      {/* Suggestions/Warnings */}
      {(analysis.suggestions.length > 0 || analysis.hasCommonPattern) && (
        <div className="space-y-1.5 pt-1 border-t border-border/50">
          {analysis.hasCommonPattern && (
            <div className="flex items-start gap-2 text-xs text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
              <span>This password contains a common pattern</span>
            </div>
          )}
          {analysis.suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-start gap-2 text-xs text-muted-foreground"
            >
              <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5 text-muted-foreground/70" />
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Export a hook for external validation
export function usePasswordStrength(password: string) {
  return useMemo(() => {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']/.test(password),
    };

    const metCount = Object.values(requirements).filter(Boolean).length;
    const isValid = metCount >= 4 && password.length >= 8;

    return {
      requirements,
      metCount,
      isValid,
      strength: metCount === 5 ? "strong" : metCount >= 4 ? "good" : metCount >= 3 ? "fair" : "weak" as const,
    };
  }, [password]);
}
