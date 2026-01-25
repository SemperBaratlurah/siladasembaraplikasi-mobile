import { ReactNode } from "react";
import { Link } from "react-router-dom";
import AdminBottomNav from "./AdminBottomNav";
import { usePublicSiteSettings } from "@/hooks/usePublicSiteSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

interface AdminMobileLayoutProps {
  children: ReactNode;
  title?: string;
  showRefresh?: boolean;
}

const AdminMobileLayout = ({ 
  children, 
  title = "Admin",
  showRefresh = false 
}: AdminMobileLayoutProps) => {
  const { settings, isLoading: siteLoading } = usePublicSiteSettings();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin App Bar */}
      <header className="sticky top-0 z-40 gradient-header safe-area-top">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between h-14 px-4">
            <Link to="/admin" className="flex items-center gap-2.5">
              <img 
                src={logo} 
                alt="Logo" 
                className="w-8 h-8 object-contain"
              />
              {siteLoading ? (
                <Skeleton className="h-5 w-24 bg-white/20" />
              ) : (
                <span className="text-white font-bold text-base truncate max-w-[180px]">
                  {settings.site_name || "Admin"}
                </span>
              )}
            </Link>

            <div className="flex items-center gap-2">
              {showRefresh && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
                >
                  <RefreshCw className="w-4.5 h-4.5" />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Page Title */}
      <div className="bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
        </div>
      </div>

      <main className="pb-20">
        <div className="max-w-lg mx-auto">
          {children}
        </div>
      </main>
      
      <AdminBottomNav />
    </div>
  );
};

export default AdminMobileLayout;
