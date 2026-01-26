import { useState, useRef, ReactNode } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

const PullToRefresh = ({ children, onRefresh, className = "" }: PullToRefreshProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const pullProgress = useTransform(y, [0, 80], [0, 1]);
  const rotation = useTransform(y, [0, 80], [0, 180]);
  
  const THRESHOLD = 80;

  const handlePanEnd = async (_: any, info: PanInfo) => {
    if (info.offset.y >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    y.set(0);
  };

  const handlePan = (_: any, info: PanInfo) => {
    // Only allow pull down when at top of scroll
    if (containerRef.current && containerRef.current.scrollTop <= 0) {
      const newY = Math.max(0, Math.min(info.offset.y * 0.5, 100));
      y.set(newY);
    }
  };

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Refresh Indicator */}
      <motion.div 
        className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center"
        style={{ 
          y: useTransform(y, [0, 80], [-40, 20]),
          opacity: pullProgress
        }}
      >
        <motion.div 
          className={`w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ${
            isRefreshing ? "animate-spin" : ""
          }`}
          style={{ rotate: isRefreshing ? undefined : rotation }}
        >
          <RefreshCw className="w-5 h-5 text-primary" />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y: isRefreshing ? 50 : y }}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PullToRefresh;
