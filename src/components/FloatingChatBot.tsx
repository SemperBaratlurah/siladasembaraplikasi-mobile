import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { usePublicSiteSettings } from "@/hooks/usePublicSiteSettings";
import { useLocation, useNavigate } from "react-router-dom";
import chatBotIcon from "@/assets/chat-bot-icon.jpg";

const FloatingChatBot = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Only show on homepage
  const isHomepage = location.pathname === "/";
  
  // Get AI chat enabled setting
  const { settings } = usePublicSiteSettings();
  const isAIChatEnabled = settings.ai_chat_enabled === true;
  
  // If AI Chat is disabled or not on homepage, don't render anything
  if (!isAIChatEnabled || !isHomepage) {
    return null;
  }

  const handleClick = () => {
    navigate("/chat");
  };

  return (
    <AnimatePresence>
      <motion.button
        onClick={handleClick}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          y: [0, -10, 0],
        }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{
          y: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-4 z-50"
        aria-label="Chat dengan Asisten AI"
      >
        <div className="relative">
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/30 blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Chat Bot Icon */}
          <div className="w-16 h-16 relative z-10 rounded-full overflow-hidden shadow-lg border-2 border-primary/30">
            <img 
              src={chatBotIcon} 
              alt="Chat Bot" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Chat bubble indicator */}
          <motion.div
            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <MessageCircle className="w-3 h-3" />
          </motion.div>
        </div>
      </motion.button>
    </AnimatePresence>
  );
};

export default FloatingChatBot;
