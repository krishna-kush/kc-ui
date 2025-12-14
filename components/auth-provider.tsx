"use client";

import { Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AuthProvider>{children}</AuthProvider>
    </Suspense>
  );
}
