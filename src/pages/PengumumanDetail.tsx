import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MobileLayout from "@/components/MobileLayout";
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
      <MobileLayout title="Pengumuman" showSearch={false}>
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

  if (error || !announcement || announcement.type !== "pengumuman") {
    return <Navigate to="/pengumuman" replace />;
  }

  return (
    <MobileLayout title="Pengumuman" showSearch={false}>
      <div className="px-4 py-4">
        {/* Back Button */}
        <Link
          to="/pengumuman"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>

        {/* Hero Image */}
        <div className="relative h-48 rounded-xl overflow-hidden mb-4">
          <img
            src={announcement.image_url || "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop"}
            alt={announcement.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3">
            <div className="flex items-center gap-2 text-white/90 bg-black/40 px-2 py-1 rounded-lg">
              <Bell className="w-4 h-4" />
              <span className="text-xs font-medium">Pengumuman</span>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl shadow-card p-4"
        >
          {/* Title */}
          <h1 className="text-xl font-bold text-foreground mb-3 leading-tight">
            {announcement.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4 pb-4 border-b">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              Admin
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(announcement.published_at || announcement.created_at)}
            </span>
          </div>

          {/* Content */}
          <div
            className="text-sm leading-relaxed break-words [&_p]:text-muted-foreground [&_p]:mb-3 [&_h1]:text-foreground [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-foreground [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-3 [&_li]:text-muted-foreground [&_li]:mb-1 [&_a]:text-primary [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: announcement.content || announcement.excerpt || "" }}
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
      </div>
    </MobileLayout>
  );
};

export default PengumumanDetail;
