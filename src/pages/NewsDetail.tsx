import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, User, ArrowLeft, Share2, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
      <div className="min-h-screen bg-background">
        <Header />
        <section className="relative h-64 md:h-96 overflow-hidden">
          <Skeleton className="w-full h-full" />
        </section>
        <article className="container mx-auto px-4 -mt-20 relative z-10">
          <div className="max-w-3xl mx-auto bg-card rounded-2xl shadow-xl p-6 md:p-10">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-4 w-1/2 mb-8" />
            <Skeleton className="h-40 w-full" />
          </div>
        </article>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return <Navigate to="/berita" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Image */}
      <section className="relative h-64 md:h-96 overflow-hidden">
        <img
          src={article.image_url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop"}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </section>

      {/* Article Content */}
      <article className="container mx-auto px-4 -mt-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto bg-card rounded-2xl shadow-xl p-6 md:p-10"
        >
          {/* Back Button */}
          <Link
            to="/berita"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Berita
          </Link>

          {/* Category Badge */}
          <Badge className={`mb-4 ${getCategoryColor(article.category)}`}>
            {getCategoryLabel(article.category)}
          </Badge>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
            {article.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              Admin SILADA
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(article.published_at || article.created_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              5 menit baca
            </span>
          </div>

          {/* Content */}
          <div
            className="max-w-none text-base leading-[1.7] text-left md:text-justify break-words [&_p]:text-muted-foreground [&_p]:mb-4 [&_h1]:text-foreground [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_li]:text-muted-foreground [&_li]:mb-1 [&_a]:text-secondary [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: article.content || article.excerpt || "" }}
          />

          {/* Share Section */}
          <div className="mt-10 pt-6 border-t">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-foreground flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Bagikan:
              </span>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" className="w-9 h-9">
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" className="w-9 h-9">
                  <Twitter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="max-w-5xl mx-auto py-12">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Artikel Terkait
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  to={`/berita/${related.slug}`}
                  className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-lg transition-all"
                >
                  <div className="h-32 overflow-hidden">
                    <img
                      src={related.image_url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop"}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground group-hover:text-secondary transition-colors line-clamp-2 text-sm">
                      {related.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(related.published_at || related.created_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <Footer />
    </div>
  );
};

export default NewsDetail;
