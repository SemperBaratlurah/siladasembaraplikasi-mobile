import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi, Loader2, RefreshCw, AlertTriangle } from "lucide-react";

interface ConnectionStatusProps {
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

const ConnectionStatus = ({ 
  isLoading = false, 
  isError = false, 
  errorMessage,
  onRetry 
}: ConnectionStatusProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineOverlay, setShowOfflineOverlay] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineOverlay(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineOverlay(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setShowOfflineOverlay(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Show overlay when offline
  if (showOfflineOverlay) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center p-8 max-w-md"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6"
            >
              <WifiOff className="w-10 h-10 text-destructive" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Koneksi Terputus
            </h2>
            <p className="text-muted-foreground mb-6">
              Periksa koneksi internet Anda dan coba lagi. Kami akan otomatis menyambung kembali saat koneksi tersedia.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-4 h-4" />
              </motion.div>
              <span>Mencoba menyambung kembali...</span>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Show error state
  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-4"
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-foreground">Gagal memuat data</p>
          <p className="text-sm text-muted-foreground">
            {errorMessage || "Terjadi kesalahan saat mengambil data dari server."}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-destructive/20 hover:bg-destructive/30 rounded-lg text-destructive font-medium text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        )}
      </motion.div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-12"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4"
          >
            <Loader2 className="w-6 h-6 text-primary" />
          </motion.div>
          <p className="text-muted-foreground text-sm">Memuat data...</p>
        </div>
      </motion.div>
    );
  }

  // Show connection restored indicator briefly
  if (isOnline) {
    return null;
  }

  return null;
};

// Hook to use connection status
export const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline };
};

export default ConnectionStatus;
