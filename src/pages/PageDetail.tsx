import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, FileText, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import MobileLayout from "@/components/MobileLayout";
import { usePublicPage } from "@/hooks/usePublicPages";
import { useVisitTracker } from "@/hooks/useVisitTracker";

const PageDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  useVisitTracker(`page-${slug}`);
  
  const { page, isLoading, error } = usePublicPage(slug || "");

  if (isLoading) {
    return (
      <MobileLayout title="Halaman" showSearch={false}>
        <div className="px-4 py-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-6 w-full mb-3" />
          <Skeleton className="h-6 w-5/6 mb-3" />
          <Skeleton className="h-6 w-4/5 mb-3" />
          <Skeleton className="h-6 w-full mb-3" />
        </div>
      </MobileLayout>
    );
  }

  // 404 - Page not found
  if (!page || error) {
    return (
      <MobileLayout title="Halaman" showSearch={false}>
        <div className="px-4 py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              404 - Tidak Ditemukan
            </h2>
            <p className="text-sm text-muted-foreground">
              Halaman yang Anda cari tidak ditemukan atau belum dipublikasikan.
            </p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title={page.title} showSearch={false}>
      <div className="px-4 py-4">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl shadow-card p-4"
        >
          {/* Title with icon */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">
              {page.title}
            </h1>
          </div>

          {/* Content */}
          <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
            {page.content || (
              <p className="text-center text-muted-foreground italic">
                Konten halaman kosong.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default PageDetail;
