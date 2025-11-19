import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import SupportSection from "@/components/home/SupportSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import Footer from "@/components/home/Footer";

export default function Home() {
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
