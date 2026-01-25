import { motion } from "framer-motion";
import { ChevronRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { usePublicNews } from "@/hooks/usePublicNews";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const MobileNewsCarousel = () => {
  const { articles, isLoading } = usePublicNews();
  const news = articles.slice(0, 5);

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="flex items-center justify-between mb-4 px-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex gap-4 px-4 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-64 flex-shrink-0 mobile-card">
              <Skeleton className="w-full h-32 rounded-xl mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return null;
  }

  return (
    <div className="py-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-lg font-bold text-foreground">Berita Terbaru</h2>
        <Link to="/berita" className="text-sm text-primary font-medium flex items-center gap-1">
          Lihat Semua
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* News Carousel */}
      <ScrollArea className="w-full">
        <div className="flex gap-4 px-4 pb-2">
          {news.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="w-64 flex-shrink-0"
            >
              <Link
                to={`/berita/${item.slug}`}
                className="mobile-card-interactive block h-full"
              >
                {/* Image */}
                {item.image_url ? (
                  <div className="w-full h-32 rounded-xl overflow-hidden mb-3 bg-muted">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-3 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-primary/40" />
                  </div>
                )}

                {/* Content */}
                <div>
                  <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {item.published_at 
                      ? format(new Date(item.published_at), "d MMMM yyyy", { locale: id })
                      : format(new Date(item.created_at), "d MMMM yyyy", { locale: id })
                    }
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default MobileNewsCarousel;
