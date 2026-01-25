import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import MobileHeroSection from "@/components/MobileHeroSection";
import MobileServicesGrid from "@/components/MobileServicesGrid";
import MobileNewsCarousel from "@/components/MobileNewsCarousel";
import MobileAgendaList from "@/components/MobileAgendaList";
import MobileAnnouncementsList from "@/components/MobileAnnouncementsList";
import IntroAnimation from "@/components/IntroAnimation";
import { useVisitTracker } from "@/hooks/useVisitTracker";

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
      <MobileLayout showSearch={false} showFloatingButtons={true}>
        {/* Hero with Search */}
        <MobileHeroSection />
        
        {/* Services Grid */}
        <MobileServicesGrid />
        
        {/* Announcements */}
        <MobileAnnouncementsList />
        
        {/* Agenda */}
        <MobileAgendaList />
        
        {/* News Carousel */}
        <MobileNewsCarousel />
      </MobileLayout>
    </>
  );
};

export default Index;
