import { ReactNode } from "react";
import MobileAppHeader from "./MobileAppHeader";
import BottomNavigation from "./BottomNavigation";
import FloatingChatBot from "./FloatingChatBot";
import FloatingWhatsApp from "./FloatingWhatsApp";

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showSearch?: boolean;
  showBottomNav?: boolean;
  showFloatingButtons?: boolean;
}

const MobileLayout = ({ 
  children, 
  title, 
  showSearch = true,
  showBottomNav = true,
  showFloatingButtons = true 
}: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <MobileAppHeader title={title} showSearch={showSearch} />
      
      <main className={showBottomNav ? "pb-20" : ""}>
        <div className="max-w-lg mx-auto">
          {children}
        </div>
      </main>
      
      {showBottomNav && <BottomNavigation />}
      
      {showFloatingButtons && (
        <div className="max-w-lg mx-auto relative">
          <FloatingChatBot />
          <FloatingWhatsApp />
        </div>
      )}
    </div>
  );
};

export default MobileLayout;
