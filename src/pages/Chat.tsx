import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, ArrowLeft, Bot, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { usePublicSiteSettings } from "@/hooks/usePublicSiteSettings";
import { useVisitTracker } from "@/hooks/useVisitTracker";
import chatBotIcon from "@/assets/chat-bot-icon.jpg";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Chat = () => {
  useVisitTracker("chat");
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const { settings, isLoading: settingsLoading } = usePublicSiteSettings();
  const isAIChatEnabled = settings.ai_chat_enabled === true;

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const parseSSEData = (data: string): string => {
    try {
      const parsed = JSON.parse(data);
      return parsed.choices?.[0]?.delta?.content || "";
    } catch {
      return "";
    }
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            message: userMessage.content,
            conversationHistory: messages,
            stream: true,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal mengirim pesan");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Streaming tidak didukung");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            
            const content = parseSSEData(data);
            if (content) {
              fullContent += content;
              setStreamingContent(fullContent);
            }
          }
        }
      }

      // Add complete message to history
      if (fullContent) {
        setMessages((prev) => [...prev, { role: "assistant", content: fullContent }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Maaf, tidak ada respons dari server. 😔" },
        ]);
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        console.log("Request cancelled");
        return;
      }
      console.error("Chat error:", error);
      toast.error("Gagal mengirim pesan. Silakan coba lagi.");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Maaf, terjadi kesalahan. Silakan coba lagi. 😔" },
      ]);
    } finally {
      setIsLoading(false);
      setStreamingContent("");
      abortControllerRef.current = null;
    }
  }, [input, isLoading, messages]);

  const quickQuestions = [
    "Apa saja layanan yang tersedia?",
    "Bagaimana cara mengurus KTP?",
    "Jam operasional kantor?",
    "Syarat pembuatan SKTM?",
  ];

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="h-14 bg-card border-b border-border flex items-center px-4 gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-20 w-full rounded-xl mb-4" />
          <Skeleton className="h-20 w-3/4 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!isAIChatEnabled) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="h-14 bg-card border-b border-border flex items-center px-4 gap-3 safe-area-top">
          <Link to="/" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold text-foreground">Asisten AI</h1>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-muted">
              <img src={chatBotIcon} alt="Chat Bot" className="w-full h-full object-cover opacity-50" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Fitur Tidak Aktif</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Asisten AI sedang tidak tersedia. Silakan hubungi admin untuk mengaktifkan fitur ini.
            </p>
            <Link to="/">
              <Button variant="outline" className="mt-4">
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="h-14 bg-gradient-to-r from-primary to-purple-600 flex items-center px-4 gap-3 safe-area-top">
        <Link to="/" className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/30">
          <img src={chatBotIcon} alt="Chat Bot" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <h1 className="font-semibold text-white text-sm">Asisten AI</h1>
          <p className="text-xs text-white/70">Kelurahan Semper Barat</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white/80">Online</span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {messages.length === 0 && (
          <div className="py-8">
            {/* Welcome Message */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-primary/20">
                <img src={chatBotIcon} alt="Chat Bot" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Halo! Saya Asisten AI 👋
              </h2>
              <p className="text-sm text-muted-foreground">
                Siap membantu Anda dengan informasi layanan kelurahan
              </p>
            </div>

            {/* Quick Questions */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center mb-3">
                Pertanyaan populer:
              </p>
              {quickQuestions.map((question, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => {
                    setInput(question);
                  }}
                  className="w-full text-left p-3 bg-card rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-sm"
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-primary/20">
                  <img src={chatBotIcon} alt="Bot" className="w-full h-full object-cover" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-border rounded-bl-md"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert [&_p]:m-0 [&_ul]:my-1 [&_ol]:my-1">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )}
              </div>
              
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
              )}
            </motion.div>
          ))}
          
          {/* Streaming response */}
          {isLoading && streamingContent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 justify-start"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-primary/20">
                <img src={chatBotIcon} alt="Bot" className="w-full h-full object-cover" />
              </div>
              <div className="max-w-[80%] bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="prose prose-sm max-w-none dark:prose-invert [&_p]:m-0 [&_ul]:my-1 [&_ol]:my-1">
                  <ReactMarkdown>{streamingContent}</ReactMarkdown>
                  <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5" />
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Loading indicator when no content yet */}
          {isLoading && !streamingContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 justify-start"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-primary/20">
                <img src={chatBotIcon} alt="Bot" className="w-full h-full object-cover" />
              </div>
              <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-md">
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
      <div className="p-4 border-t border-border bg-card safe-area-bottom">
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
            className="flex-1 h-11 rounded-xl bg-background"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()}
            className="h-11 w-11 rounded-xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
