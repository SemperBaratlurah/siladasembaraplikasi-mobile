import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ChevronRight, ChevronLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePublicNews, newsCategories } from "@/hooks/usePublicNews";
import { useVisitTracker } from "@/hooks/useVisitTracker";

const ITEMS_PER_PAGE = 6;

const News = () => {
  useVisitTracker("berita");
  
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { articles, isLoading } = usePublicNews(activeCategory);

  const filteredArticles = useMemo(() => {
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [articles, searchQuery]);

  // Reset to page 1 when filters change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getCategoryLabel = (categoryId: string | null) => {
    if (!categoryId) return "Umum";
    return newsCategories.find((c) => c.id === categoryId)?.label || categoryId;
  };

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      pengumuman: "bg-amber-500/20 text-amber-600 border-amber-500/30",
      kegiatan: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
      layanan: "bg-blue-500/20 text-blue-600 border-blue-500/30",
      program: "bg-purple-500/20 text-purple-600 border-purple-500/30",
    };
    return colors[category || ""] || "bg-muted text-muted-foreground";
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (showEllipsis) {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis-start");
      }

      // Show pages around current
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis-end");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    } else {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-10">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="h-9 w-9"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {pages.map((page) =>
          typeof page === "string" ? (
            <span key={page} className="px-2 text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              onClick={() => setCurrentPage(page)}
              className={`h-9 w-9 ${
                currentPage === page ? "bg-secondary hover:bg-secondary/90" : ""
              }`}
            >
              {page}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="h-9 w-9"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  const renderSkeletons = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-card">
          <Skeleton className="h-48 w-full" />
          <div className="p-5">
            <Skeleton className="h-4 w-20 mb-3" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="gradient-hero py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Berita & Informasi Publik
            </h1>
            <p className="text-white/80 text-lg mb-8">
              Dapatkan informasi terbaru seputar kegiatan, layanan, dan pengumuman
              dari Kelurahan Semper Barat
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari berita atau artikel..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-12 py-6 text-lg bg-white/95 border-0 shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {newsCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category.id
                    ? "bg-secondary text-white"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            renderSkeletons()
          ) : (
            <>
              {/* Results Info */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  Menampilkan {filteredArticles.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredArticles.length)} dari {filteredArticles.length} artikel
                </p>
              </div>

              {paginatedArticles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    Tidak ada artikel yang ditemukan.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedArticles.map((article, index) => (
                      <motion.article
                        key={article.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-xl transition-all duration-300"
                      >
                        <Link to={`/berita/${article.slug}`}>
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={article.image_url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop"}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <Badge
                              className={`absolute top-4 left-4 ${getCategoryColor(
                                article.category
                              )}`}
                            >
                              {getCategoryLabel(article.category)}
                            </Badge>
                          </div>
                          <div className="p-5">
                            <h2 className="text-lg font-semibold text-foreground group-hover:text-secondary transition-colors line-clamp-2 mb-2">
                              {article.title}
                            </h2>
                            <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                              {article.excerpt}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {formatDate(article.published_at || article.created_at)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  5 menit
                                </span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        </Link>
                      </motion.article>
                    ))}
                  </div>

                  {/* Pagination */}
                  {renderPagination()}
                </>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default News;
