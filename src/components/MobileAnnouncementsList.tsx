import { motion } from "framer-motion";
import { ChevronRight, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { usePublicAnnouncements } from "@/hooks/usePublicAnnouncements";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const MobileAnnouncementsList = () => {
  const { announcements: allAnnouncements, isLoading } = usePublicAnnouncements();
  const announcements = allAnnouncements.slice(0, 3);

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mobile-card">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-6 bg-muted/30">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Pengumuman</h2>
        <Link to="/pengumuman" className="text-sm text-primary font-medium flex items-center gap-1">
          Lihat Semua
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.map((announcement, index) => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link
              to={`/pengumuman/${announcement.slug}`}
              className="mobile-card-interactive flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 mb-1">
                  {announcement.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {announcement.published_at 
                    ? format(new Date(announcement.published_at), "d MMMM yyyy", { locale: id })
                    : format(new Date(announcement.created_at), "d MMMM yyyy", { locale: id })
                  }
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-2" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MobileAnnouncementsList;
