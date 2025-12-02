"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

// Redirect to the new /files/binaries/[id] route
export default function BinaryDetailRedirectPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/files/binaries/${params.id}`);
  }, [router, params.id]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-2 text-sm text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
