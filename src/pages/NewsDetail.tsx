import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, User, ArrowLeft, Share2, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import MobileLayout from "@/components/MobileLayout";
import { usePublicNewsArticle, usePublicNews, newsCategories } from "@/hooks/usePublicNews";
import { useVisitTracker } from "@/hooks/useVisitTracker";

const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  useVisitTracker(`berita-${slug}`);
  
  const { article, isLoading, error } = usePublicNewsArticle(slug || "");
  const { articles } = usePublicNews();

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

  // Get related articles
  const relatedArticles = articles
    .filter((a) => a.category === article?.category && a.id !== article?.id)
    .slice(0, 3);

  if (isLoading) {
    return (
      <MobileLayout title="Berita" showSearch={false}>
        <div className="px-4 py-4">
          <Skeleton className="w-full h-48 rounded-xl mb-4" />
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <Skeleton className="h-40 w-full" />
        </div>
      </MobileLayout>
    );
  }

  if (error || !article) {
    return <Navigate to="/berita" replace />;
  }

  return (
    <MobileLayout title="Berita" showSearch={false}>
      <div className="px-4 py-4">
        {/* Back Button */}
        <Link
          to="/berita"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>

        {/* Hero Image */}
        <div className="relative h-48 rounded-xl overflow-hidden mb-4">
          <img
            src={article.image_url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop"}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl shadow-card p-4"
        >
          {/* Category Badge */}
          <Badge className={`mb-3 ${getCategoryColor(article.category)}`}>
            {getCategoryLabel(article.category)}
          </Badge>

          {/* Title */}
          <h1 className="text-xl font-bold text-foreground mb-3 leading-tight">
            {article.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4 pb-4 border-b">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              Admin
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(article.published_at || article.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              5 menit
            </span>
          </div>

          {/* Content */}
          <div
            className="text-sm leading-relaxed break-words [&_p]:text-muted-foreground [&_p]:mb-3 [&_h1]:text-foreground [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-foreground [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-3 [&_li]:text-muted-foreground [&_li]:mb-1 [&_a]:text-primary [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: article.content || article.excerpt || "" }}
          />

          {/* Share Section */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-foreground flex items-center gap-1">
                <Share2 className="w-3 h-3" />
                Bagikan:
              </span>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" className="w-8 h-8">
                  <Facebook className="w-3 h-3" />
                </Button>
                <Button size="icon" variant="outline" className="w-8 h-8">
                  <Twitter className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-6">
            <h2 className="text-base font-bold text-foreground mb-4">
              Artikel Terkait
            </h2>
            <div className="space-y-3">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  to={`/berita/${related.slug}`}
                  className="flex gap-3 bg-card rounded-xl overflow-hidden shadow-card p-3"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={related.image_url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop"}
                      alt={related.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-2">
                      {related.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(related.published_at || related.created_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default NewsDetail;
