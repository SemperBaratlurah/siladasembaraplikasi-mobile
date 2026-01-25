import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePost } from "@/hooks/usePosts";
import { useVisitTracker } from "@/hooks/useVisitTracker";

const PengumumanDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  useVisitTracker(`pengumuman-${slug}`);
  
  const { post: announcement, isLoading, error } = usePost(slug || "");

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="relative h-64 md:h-80 overflow-hidden">
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

  if (error || !announcement || announcement.type !== "pengumuman") {
    return <Navigate to="/pengumuman" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Image */}
      <section className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={announcement.image_url || "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop"}
          alt={announcement.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 container mx-auto px-4">
          <div className="flex items-center gap-2 text-white/80">
            <Bell className="w-5 h-5" />
            <span className="text-sm font-medium">Pengumuman</span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="container mx-auto px-4 -mt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto bg-card rounded-2xl shadow-xl p-6 md:p-10"
        >
          {/* Back Button */}
          <Link
            to="/pengumuman"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Pengumuman
          </Link>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
            {announcement.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              Admin SILADA
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(announcement.published_at || announcement.created_at)}
            </span>
          </div>

          {/* Content */}
          <div
            className="max-w-none text-base leading-[1.7] text-left md:text-justify break-words [&_p]:text-muted-foreground [&_p]:mb-4 [&_h1]:text-foreground [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_li]:text-muted-foreground [&_li]:mb-1 [&_a]:text-primary [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: announcement.content || announcement.excerpt || "" }}
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
      </article>

      <div className="py-12" />
      <Footer />
    </div>
  );
};

export default PengumumanDetail;
