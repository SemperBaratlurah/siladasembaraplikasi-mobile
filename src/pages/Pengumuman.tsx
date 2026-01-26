import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Megaphone, Calendar } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import PullToRefresh from "@/components/PullToRefresh";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicAnnouncements } from "@/hooks/usePublicAnnouncements";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useVisitTracker } from "@/hooks/useVisitTracker";
import { toast } from "sonner";

const Pengumuman = () => {
  useVisitTracker("pengumuman");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const { announcements, isLoading, refetch } = usePublicAnnouncements();

  const filteredAnnouncements = useMemo(() => {
    if (!searchQuery.trim()) return announcements;

    const query = searchQuery.toLowerCase();
    return announcements.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.excerpt?.toLowerCase().includes(query)
    );
  }, [announcements, searchQuery]);

  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const paginatedAnnouncements = filteredAnnouncements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleRefresh = useCallback(async () => {
    await refetch();
    toast.success("Data berhasil diperbarui");
  }, [refetch]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: id });
    } catch {
      return dateString;
    }
  };

  const renderSkeletons = () => (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-card rounded-xl shadow-card overflow-hidden p-4">
          <div className="flex gap-3">
            <Skeleton className="h-20 w-20 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center gap-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="text-xs"
        >
          Sebelumnya
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className="w-8 h-8 p-0 text-xs"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="text-xs"
        >
          Selanjutnya
        </Button>
      </div>
    );
  };

  return (
    <MobileLayout title="Pengumuman" showSearch={false}>
      <div className="px-4 py-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari pengumuman..."
            className="pl-10 h-10 rounded-xl bg-card border-border"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-xs text-muted-foreground mb-4">
            Menampilkan {paginatedAnnouncements.length} dari{" "}
            {filteredAnnouncements.length} pengumuman
          </p>
        )}

        {/* Announcements List with Pull to Refresh */}
        <PullToRefresh onRefresh={handleRefresh}>
          {isLoading ? (
            renderSkeletons()
          ) : paginatedAnnouncements.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Megaphone className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">
                Tidak ada pengumuman
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Coba ubah kata kunci pencarian Anda"
                  : "Belum ada pengumuman yang dipublikasikan"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedAnnouncements.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <Link
                    to={`/pengumuman/${item.slug}`}
                    className="flex gap-3 bg-card rounded-xl shadow-card overflow-hidden p-3 active:scale-[0.98] transition-transform"
                  >
                    {/* Image or Placeholder */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                          <Megaphone className="w-8 h-8 text-secondary/50" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Badge variant="secondary" className="text-[10px] px-2 py-0.5 mb-1.5">
                        Pengumuman
                      </Badge>

                      <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">
                        {item.title}
                      </h3>

                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {formatDate(item.published_at || item.created_at)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </PullToRefresh>

        {/* Pagination */}
        {renderPagination()}
      </div>
    </MobileLayout>
  );
};

export default Pengumuman;
