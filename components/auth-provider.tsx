"use client";

import { AuthProvider } from "@/contexts/AuthContext";

export default function Provider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
