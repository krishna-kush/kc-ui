"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect to unified auth page
export default function SignInPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/auth");
  }, [router]);
  
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="text-center">Redirecting...</div>
    </div>
  );
}
