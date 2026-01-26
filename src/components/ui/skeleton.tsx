import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Skeleton = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(
          "rounded-md bg-muted relative overflow-hidden",
          "before:absolute before:inset-0",
          "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
          "before:animate-shimmer",
          className
        )} 
        {...props} 
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

export { Skeleton };
