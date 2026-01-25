import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Newspaper,
  Megaphone,
  Calendar,
  Image,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Menu,
  FileText,
  Palette,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicSiteSettings } from "@/hooks/usePublicSiteSettings";
import LogoutConfirmDialog from "@/components/admin/LogoutConfirmDialog";
import logo from "@/assets/logo.png";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  isActive?: boolean;
  children?: { label: string; href: string }[];
}

const mainMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin", isActive: true },
  { icon: Menu, label: "Kelola Menu", href: "/admin/menu" },
  { icon: Layers, label: "Layanan Digital", href: "/admin/services" },
  { icon: FileText, label: "Halaman Website", href: "/admin/pages" },
  { icon: Newspaper, label: "Berita & Artikel", href: "/admin/news" },
  { icon: Megaphone, label: "Pengumuman", href: "/admin/announcements" },
  { icon: Calendar, label: "Agenda & Kegiatan", href: "/admin/events" },
  { icon: Image, label: "Galeri", href: "/admin/gallery" },
];

const settingsMenuItems: MenuItem[] = [
  { icon: Settings, label: "Pengaturan Sistem", href: "/admin/settings" },
  { icon: User, label: "Profil Admin", href: "/admin/profile" },
  { icon: Palette, label: "Tema & Tampilan", href: "/admin/theme" },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { settings: siteSettings, isLoading: siteLoading } = usePublicSiteSettings();

  const isActiveLink = (href?: string) => {
    if (!href) return false;
    return location.pathname === href;
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full gradient-sidebar">
      <div className="p-6 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="Logo" 
            className="w-10 h-10 object-contain"
          />
          <div>
            {siteLoading ? (
              <Skeleton className="h-5 w-28 bg-white/20 mb-1" />
            ) : siteSettings.site_name ? (
              <span className="text-white font-bold text-lg block">{siteSettings.site_name}</span>
            ) : (
              <span className="text-white/60 font-bold text-lg block">Admin Panel</span>
            )}
            <span className="text-white/60 text-xs">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {mainMenuItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.href || "#"}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                  isActiveLink(item.href)
                    ? "bg-secondary text-white font-medium"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Settings Section */}
        <div className="mt-6">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="flex items-center justify-between w-full px-4 py-2 text-white/50 text-xs uppercase tracking-wider"
          >
            <span>Pengaturan</span>
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                settingsOpen && "rotate-180"
              )}
            />
          </button>
          <AnimatePresence>
            {settingsOpen && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1 mt-2"
              >
                {settingsMenuItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href || "#"}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                        isActiveLink(item.href)
                          ? "bg-secondary text-white font-medium"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogoutClick}
          disabled={isLoggingOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all w-full disabled:opacity-50"
        >
          <LogOut className="w-5 h-5" />
          <span>{isLoggingOut ? "Keluar..." : "Keluar"}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />
    </>
  );
};

export default AdminSidebar;
