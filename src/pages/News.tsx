import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ChevronRight, ChevronLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MobileLayout from "@/components/MobileLayout";
import { usePublicNews, newsCategories } from "@/hooks/usePublicNews";
import { useVisitTracker } from "@/hooks/useVisitTracker";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const News = () => {
  useVisitTracker("berita");
  
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { articles, isLoading } = usePublicNews(activeCategory);

  const filteredArticles = useMemo(() => {
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [articles, searchQuery]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const getCategoryLabel = (categoryId: string | null) => {
    if (!categoryId) return "Umum";
    return newsCategories.find((c) => c.id === categoryId)?.label || categoryId;
  };

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      pengumuman: "bg-amber-500/20 text-amber-600",
      kegiatan: "bg-emerald-500/20 text-emerald-600",
      layanan: "bg-blue-500/20 text-blue-600",
      program: "bg-purple-500/20 text-purple-600",
    };
    return colors[category || ""] || "bg-muted text-muted-foreground";
  };

  return (
    <MobileLayout title="Berita">
      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari berita..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-muted/50 border-0 rounded-xl"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="sticky top-14 z-30 bg-background border-b border-border">
        <ScrollArea className="w-full">
          <div className="flex px-4 py-3 gap-2">
            {newsCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Articles */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="mobile-card flex gap-4">
                <Skeleton className="w-24 h-24 rounded-xl flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Tidak ada artikel ditemukan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/berita/${article.slug}`}
                  className="mobile-card-interactive flex gap-4"
                >
                  {/* Thumbnail */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                    {article.image_url ? (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-primary/40" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 py-1">
                    <Badge className={`text-xs mb-1.5 ${getCategoryColor(article.category)}`}>
                      {getCategoryLabel(article.category)}
                    </Badge>
                    <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 mb-1.5">
                      {article.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {article.published_at 
                        ? format(new Date(article.published_at), "d MMM yyyy", { locale: id })
                        : format(new Date(article.created_at), "d MMM yyyy", { locale: id })
                      }
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default News;
