import { useState, useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import FeaturesSection from "@/components/FeaturesSection";
import AgendaSection from "@/components/AgendaSection";
import AnnouncementsSection from "@/components/AnnouncementsSection";
import AboutSection from "@/components/AboutSection";
import PublicSidebar from "@/components/PublicSidebar";
import Footer from "@/components/Footer";
import FloatingChatBot from "@/components/FloatingChatBot";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import IntroAnimation from "@/components/IntroAnimation";
import { useMenus } from "@/hooks/useMenus";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useVisitTracker } from "@/hooks/useVisitTracker";

// Wrapper component for PublicSidebar to conditionally render the section
const PublicSidebarSection = () => {
  const { menus, isLoading } = useMenus(true, "sidebar");
  
  // Don't render the section wrapper if no menus
  if (!isLoading && menus.length === 0) {
    return null;
  }
  
  return (
    <section className="w-full py-12 md:py-16 bg-muted/30">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <PublicSidebar />
      </div>
    </section>
  );
};

// Wrapper component for FeaturesSection to conditionally render the section
const FeaturesSectionWrapper = () => {
  const { data: features, isLoading } = useQuery({
    queryKey: ["public-features-check"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .eq("key", "features");

      if (error) throw error;
      const featuresData = data?.find((item) => item.key === "features");
      if (featuresData?.value && Array.isArray(featuresData.value)) {
        return featuresData.value;
      }
      return [];
    },
  });

  // Don't render the section wrapper if no features
  if (!isLoading && (!features || features.length === 0)) {
    return null;
  }

  return (
    <section className="w-full py-12 md:py-16 bg-background">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <FeaturesSection />
      </div>
    </section>
  );
};

const Index = () => {
  // Track visitor on page load
  useVisitTracker();
  
  // Check if intro has been shown this session
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem("intro_shown");
  });
  const [introComplete, setIntroComplete] = useState(!showIntro);

  const handleIntroComplete = () => {
    sessionStorage.setItem("intro_shown", "true");
    setIntroComplete(true);
  };

  return (
    <>
      {showIntro && !introComplete && (
        <IntroAnimation onComplete={handleIntroComplete} />
      )}
      <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        
        {/* Services Section - Full width */}
        <section className="w-full py-16 md:py-20 bg-background">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <ServicesSection />
          </div>
        </section>

        {/* Pengumuman Section - Full width */}
        <section className="w-full py-12 md:py-16 bg-muted/30">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <AnnouncementsSection />
          </div>
        </section>

        {/* Agenda Section - Full width */}
        <section className="w-full py-12 md:py-16 bg-background">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <AgendaSection />
          </div>
        </section>

        {/* Sidebar/Widget Section - Only render if has content */}
        <PublicSidebarSection />

        {/* Features Section - Only render if has content */}
        <FeaturesSectionWrapper />
        
        <AboutSection />
      </main>
      <Footer />
      <FloatingChatBot />
      <FloatingWhatsApp />
    </div>
    </>
  );
};

export default Index;
