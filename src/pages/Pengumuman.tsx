import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Megaphone, Calendar } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicAnnouncements } from "@/hooks/usePublicAnnouncements";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useVisitTracker } from "@/hooks/useVisitTracker";

const Pengumuman = () => {
  useVisitTracker("pengumuman");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const { announcements, isLoading } = usePublicAnnouncements();

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: id });
    } catch {
      return dateString;
    }
  };

  const renderSkeletons = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-card rounded-xl shadow-card overflow-hidden">
          <Skeleton className="h-40 w-full" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    if (showEllipsisStart) {
      pages.push(1);
      pages.push("...");
    }

    for (
      let i = Math.max(1, currentPage - 1);
      i <= Math.min(totalPages, currentPage + 1);
      i++
    ) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (showEllipsisEnd) {
      pages.push("...");
      pages.push(totalPages);
    }

    return (
      <div className="flex justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Sebelumnya
        </Button>
        {pages.map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-3 py-2">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page as number)}
            >
              {page}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Selanjutnya
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="gradient-hero py-12 md:py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
                <Megaphone className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Pengumuman
              </h1>
              <p className="text-white/80 mb-8">
                Informasi dan pengumuman terbaru dari kami
              </p>

              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari pengumuman..."
                  className="pl-12 h-12 rounded-full bg-white border-0"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            {/* Results count */}
            {!isLoading && (
              <p className="text-muted-foreground mb-6">
                Menampilkan {paginatedAnnouncements.length} dari{" "}
                {filteredAnnouncements.length} pengumuman
              </p>
            )}

            {/* Announcements Grid */}
            {isLoading ? (
              renderSkeletons()
            ) : paginatedAnnouncements.length === 0 ? (
              <div className="text-center py-12">
                <Megaphone className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Tidak ada pengumuman
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Coba ubah kata kunci pencarian Anda"
                    : "Belum ada pengumuman yang dipublikasikan"}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedAnnouncements.map((item, index) => (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-card rounded-xl shadow-card overflow-hidden hover:shadow-hover transition-shadow group"
                  >
                    {/* Image or Placeholder */}
                    {item.image_url ? (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                        <Megaphone className="w-12 h-12 text-secondary/50" />
                      </div>
                    )}

                    <div className="p-5">
                      <Badge variant="secondary" className="mb-3">
                        Pengumuman
                      </Badge>

                      <h3 className="font-bold text-foreground text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>

                      {item.excerpt && (
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                          {item.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(item.published_at || item.created_at)}
                        </span>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {renderPagination()}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pengumuman;
