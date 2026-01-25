import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { X, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePublicSiteSettings } from "@/hooks/usePublicSiteSettings";
import { useLocation } from "react-router-dom";
import chatBotIcon from "@/assets/chat-bot-icon.jpg";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const FloatingChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  // Only show on homepage
  const isHomepage = location.pathname === "/";
  
  // Get AI chat enabled setting with realtime subscription
  const { settings } = usePublicSiteSettings();
  const isAIChatEnabled = settings.ai_chat_enabled === true;

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  // If AI Chat is disabled or not on homepage, don't render anything
  if (!isAIChatEnabled || !isHomepage) {
    return null;
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: userMessage.content,
          conversationHistory: messages,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply || "Maaf, terjadi kesalahan.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Gagal mengirim pesan. Silakan coba lagi.");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Maaf, terjadi kesalahan. Silakan coba lagi. 😔" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Drag constraints container */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-40" />

      {/* Floating Bot Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            drag
            dragControls={dragControls}
            dragConstraints={constraintsRef}
            dragElastic={0.1}
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
            className="fixed bottom-6 right-6 z-50 cursor-grab active:cursor-grabbing"
            onClick={() => setIsOpen(true)}
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
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <MessageCircle className="w-3 h-3" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-[350px] h-[500px] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col cursor-grab active:cursor-grabbing"
          >
            {/* Header - Drag Handle */}
            <div 
              className="bg-gradient-to-r from-primary to-purple-600 p-4 flex items-center gap-3 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
                <img 
                  src={chatBotIcon} 
                  alt="Chat Bot" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">Asisten AI</h3>
                <p className="text-xs text-white/80">Kelurahan Semper Barat</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollRef} className="flex-1 p-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-primary/20">
                    <img 
                      src={chatBotIcon} 
                      alt="Chat Bot" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm">
                    Halo! Saya Asisten AI Kelurahan Semper Barat. 👋
                  </p>
                  <p className="text-xs mt-2">
                    Tanyakan tentang layanan, berita, atau informasi lainnya!
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-md">
                      <motion.div
                        className="flex gap-1"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <span className="w-2 h-2 bg-primary rounded-full" />
                        <span className="w-2 h-2 bg-primary rounded-full" />
                        <span className="w-2 h-2 bg-primary rounded-full" />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ketik pesan..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatBot;
