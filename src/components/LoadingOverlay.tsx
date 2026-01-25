import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingOverlay = ({ message = "Memuat data...", fullScreen = false }: LoadingOverlayProps) => {
  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
      >
        <LoadingContent message={message} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center py-12"
    >
      <LoadingContent message={message} />
    </motion.div>
  );
};

const LoadingContent = ({ message }: { message: string }) => (
  <div className="text-center">
    <motion.div
      className="relative inline-flex items-center justify-center w-20 h-20 mb-6"
    >
      {/* Outer spinning ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary/50"
      />
      
      {/* Inner spinning ring (opposite direction) */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="absolute inset-2 rounded-full border-4 border-transparent border-b-secondary border-l-secondary/50"
      />
      
      {/* Center pulse */}
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
      >
        <Loader2 className="w-4 h-4 text-white" />
      </motion.div>
    </motion.div>
    
    <motion.p 
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="text-muted-foreground font-medium"
    >
      {message}
    </motion.p>
    
    {/* Loading dots */}
    <div className="flex items-center justify-center gap-1 mt-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{ 
            duration: 0.8, 
            repeat: Infinity,
            delay: i * 0.2 
          }}
          className="w-2 h-2 rounded-full bg-primary"
        />
      ))}
    </div>
  </div>
);

export default LoadingOverlay;
