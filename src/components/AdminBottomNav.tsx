import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Layers, FileText, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LogoutConfirmDialog from "./admin/LogoutConfirmDialog";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  action?: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Layers, label: "Layanan", path: "/admin/services" },
  { icon: FileText, label: "Konten", path: "/admin/news" },
  { icon: Settings, label: "Setelan", path: "/admin/settings" },
  { icon: LogOut, label: "Keluar", action: "logout" },
];

const AdminBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Berhasil keluar");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Gagal keluar dari sistem");
    } finally {
      setIsLoggingOut(false);
      setLogoutDialogOpen(false);
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-around h-16 px-2">
            {navItems.map((item) => {
              const active = isActive(item.path);
              
              if (item.action === "logout") {
                return (
                  <button
                    key={item.label}
                    onClick={() => setLogoutDialogOpen(true)}
                    className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground"
                  >
                    <item.icon className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path!}
                  className={cn(
                    "flex flex-col items-center justify-center flex-1 h-full relative transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="adminActiveTab"
                      className="absolute -top-0.5 w-12 h-1 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn("w-5 h-5 mb-1", active && "text-primary")} />
                  <span className={cn(
                    "text-xs font-medium",
                    active ? "text-primary" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />
    </>
  );
};

export default AdminBottomNav;
