"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import HeroSection from "@/components/custom/home/HeroSection";
import FeaturesSection from "@/components/custom/home/FeaturesSection";
import SupportSection from "@/components/custom/home/SupportSection";
import HowItWorksSection from "@/components/custom/home/HowItWorksSection";
import Footer from "@/components/custom/home/Footer";
import { Loader } from "@/components/custom/common/loader";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return <Loader fullScreen />;
  }

  // If authenticated, don't render the landing page (redirect is happening)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <SupportSection />
      <HowItWorksSection />
      <Footer />
    </div>
  );
}
