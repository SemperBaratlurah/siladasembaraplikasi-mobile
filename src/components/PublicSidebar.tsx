import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useMenus } from "@/hooks/useMenus";
import { Skeleton } from "@/components/ui/skeleton";
import DynamicIcon from "@/components/DynamicIcon";

const PublicSidebar = () => {
  const { menus, isLoading } = useMenus(true, "sidebar");

  if (isLoading) {
    return (
      <aside className="bg-card rounded-xl shadow-card p-4 space-y-2">
        <h3 className="font-bold text-foreground mb-4">Menu Lainnya</h3>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </aside>
    );
  }

  if (menus.length === 0) {
    return null;
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-xl shadow-card p-4"
    >
      <h3 className="font-bold text-foreground mb-4 text-lg">Menu Lainnya</h3>
      <nav className="space-y-1">
        {menus.map((menu) => {
          const href = menu.url || `/${menu.slug}`;
          const isExternal = menu.url?.startsWith("http") || menu.target === "_blank";

          if (isExternal) {
            return (
              <a
                key={menu.id}
                href={href}
                target={menu.target || "_blank"}
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <DynamicIcon name={menu.icon} className="w-5 h-5" />
                <span className="font-medium">{menu.name}</span>
              </a>
            );
          }

          return (
            <Link
              key={menu.id}
              to={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <DynamicIcon name={menu.icon} className="w-5 h-5" />
              <span className="font-medium">{menu.name}</span>
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
};

export default PublicSidebar;