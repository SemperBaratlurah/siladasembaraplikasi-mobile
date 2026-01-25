import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { AlertCircle, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicPage } from "@/hooks/usePublicPages";
import { useVisitTracker } from "@/hooks/useVisitTracker";

const PageDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  useVisitTracker(`page-${slug}`);
  
  const { page, isLoading, error } = usePublicPage(slug || "");

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="gradient-hero py-16 md:py-24">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto">
                <Skeleton className="h-12 w-64 mx-auto mb-4 bg-white/20" />
              </div>
            </div>
          </section>
          <section className="py-12 bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
              <Skeleton className="h-6 w-full mb-4" />
              <Skeleton className="h-6 w-5/6 mb-4" />
              <Skeleton className="h-6 w-4/5 mb-4" />
              <Skeleton className="h-6 w-full mb-4" />
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  // 404 - Page not found
  if (!page || error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="gradient-hero py-16 md:py-24">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-3xl mx-auto"
              >
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  Halaman Tidak Ditemukan
                </h1>
              </motion.div>
            </div>
          </section>

          <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  404 - Halaman Tidak Tersedia
                </h2>
                <p className="text-muted-foreground">
                  Halaman yang Anda cari tidak ditemukan atau belum dipublikasikan.
                </p>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="gradient-hero py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-white/80" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                {page.title}
              </h1>
            </motion.div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <div className="prose prose-lg max-w-none text-muted-foreground whitespace-pre-line">
                {page.content || (
                  <p className="text-center text-muted-foreground italic">
                    Konten halaman kosong.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PageDetail;
