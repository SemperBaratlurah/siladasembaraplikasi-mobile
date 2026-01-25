import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { usePublicSiteSettings } from "@/hooks/usePublicSiteSettings";
import { useLocation } from "react-router-dom";

const FloatingWhatsApp = () => {
  const { settings } = usePublicSiteSettings();
  const location = useLocation();
  
  // Only show on homepage
  const isHomepage = location.pathname === "/";
  
  // Check if WA floating is enabled and we have a WhatsApp number
  const isWAFloatingEnabled = settings.wa_floating_enabled === true;
  const whatsappUrl = settings.social_whatsapp;
  
  // Don't render if disabled, no WhatsApp URL, or not on homepage
  if (!isWAFloatingEnabled || !whatsappUrl || !isHomepage) {
    return null;
  }

  const handleClick = () => {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          y: [0, -8, 0],
        }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{
          y: {
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 left-6 z-50 cursor-pointer"
        onClick={handleClick}
      >
        <div className="relative">
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-green-500/40 blur-xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* WhatsApp Button */}
          <div className="w-14 h-14 relative z-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors">
            <MessageCircle className="w-7 h-7 text-white" fill="white" />
          </div>
          
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-green-500"
            animate={{
              scale: [1, 1.5, 1.5],
              opacity: [0.8, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
          
          {/* Label tooltip */}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-card border shadow-lg rounded-lg px-3 py-1.5 whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
            <span className="text-sm font-medium text-foreground">Chat via WhatsApp</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingWhatsApp;
