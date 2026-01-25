import { Link, useLocation } from "react-router-dom";
import { Home, Grid3X3, Newspaper, Calendar, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Beranda", path: "/" },
  { icon: Grid3X3, label: "Layanan", path: "/layanan-digital" },
  { icon: Newspaper, label: "Berita", path: "/berita" },
  { icon: Calendar, label: "Agenda", path: "/agenda" },
  { icon: User, label: "Profil", path: "/profil" },
];

const BottomNavigation = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full relative transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="activeTab"
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
  );
};

export default BottomNavigation;
