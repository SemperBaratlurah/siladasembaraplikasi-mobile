import { Link, useLocation } from "react-router-dom";
import { Newspaper, Megaphone, Calendar, Image, Menu, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface TabItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const contentTabs: TabItem[] = [
  { icon: Newspaper, label: "Berita", path: "/admin/news" },
  { icon: Megaphone, label: "Pengumuman", path: "/admin/announcements" },
  { icon: Calendar, label: "Agenda", path: "/admin/events" },
  { icon: Image, label: "Galeri", path: "/admin/gallery" },
  { icon: Menu, label: "Menu", path: "/admin/menu" },
  { icon: FileText, label: "Halaman", path: "/admin/pages" },
];

const AdminContentTabs = () => {
  const location = useLocation();

  return (
    <div className="bg-card border-b border-border sticky top-14 z-30">
      <ScrollArea className="w-full">
        <div className="flex px-4 py-2 gap-2">
          {contentTabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default AdminContentTabs;
