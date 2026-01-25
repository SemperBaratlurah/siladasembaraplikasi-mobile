import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnecting, setShowReconnecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setShowReconnecting(true);
      setTimeout(() => {
        setIsOnline(true);
        setShowReconnecting(false);
      }, 1500);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {(!isOnline || showReconnecting) && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-background to-muted/30" />
            
            {/* Animated circles */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-6">
            {showReconnecting ? (
              // Reconnecting state
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="w-10 h-10 text-green-500" />
                  </motion.div>
                </motion.div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Terhubung Kembali
                </h2>
                <p className="text-muted-foreground">
                  Koneksi internet tersambung...
                </p>
              </motion.div>
            ) : (
              // Offline state
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
              >
                {/* Animated WiFi Off Icon */}
                <motion.div
                  className="relative mb-8"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Pulse rings */}
                  <motion.div
                    className="absolute inset-0 bg-destructive/20 rounded-full"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-destructive/20 rounded-full"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  />
                  
                  {/* Icon container */}
                  <div className="relative w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center border-2 border-destructive/20">
                    <WifiOff className="w-12 h-12 text-destructive" />
                  </div>
                </motion.div>

                {/* Text content */}
                <motion.h1
                  className="text-2xl md:text-3xl font-bold text-foreground mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Tidak Ada Koneksi Internet
                </motion.h1>
                
                <motion.p
                  className="text-muted-foreground max-w-md mb-8 leading-relaxed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Sepertinya Anda sedang offline. Periksa koneksi internet Anda 
                  dan coba lagi.
                </motion.p>

                {/* Retry button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    onClick={handleRetry}
                    size="lg"
                    className="gap-2 px-8"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Coba Lagi
                  </Button>
                </motion.div>

                {/* Tips */}
                <motion.div
                  className="mt-10 p-4 bg-muted/50 rounded-xl max-w-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Tips:</span> Pastikan WiFi 
                    atau data seluler Anda aktif dan memiliki sinyal yang cukup.
                  </p>
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
