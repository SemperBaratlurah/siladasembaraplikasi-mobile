import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, X, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const WebView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const url = searchParams.get("url") || "";
  const title = searchParams.get("title") || "Layanan";

  useEffect(() => {
    // Reset states when URL changes
    setIsLoading(true);
    setError(false);
  }, [url]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleClose = () => {
    navigate("/");
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setError(false);
    // Force iframe reload by updating key
    const iframe = document.getElementById("webview-iframe") as HTMLIFrameElement;
    if (iframe) {
      iframe.src = url;
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError(true);
  };

  if (!url) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">URL tidak valid</p>
        <Button onClick={handleBack}>Kembali</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-14 bg-primary flex items-center px-2 gap-1 safe-area-top sticky top-0 z-50 shadow-md"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="text-primary-foreground hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex-1 min-w-0 px-2">
          <h1 className="font-semibold text-primary-foreground text-sm truncate">
            {title}
          </h1>
          <p className="text-xs text-primary-foreground/70 truncate">
            {url}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          className="text-primary-foreground hover:bg-white/10"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="text-primary-foreground hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </Button>
      </motion.header>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-14 left-0 right-0 z-40">
          <div className="h-1 bg-primary/20 overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      )}

      {/* WebView Content */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background p-4 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
          </div>
        )}

        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ExternalLink className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Tidak dapat memuat halaman
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Halaman ini mungkin memblokir tampilan dalam aplikasi.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack}>
                Kembali
              </Button>
              <Button onClick={handleRefresh}>
                Coba Lagi
              </Button>
            </div>
          </div>
        ) : (
          <iframe
            id="webview-iframe"
            src={url}
            className="w-full h-full border-0"
            style={{ 
              height: 'calc(100vh - 56px)',
              display: isLoading ? 'none' : 'block'
            }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={title}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </div>
    </div>
  );
};

export default WebView;
