import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, User, ArrowLeft, Share2, Facebook, Twitter, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePost } from "@/hooks/usePosts";
import { useVisitTracker } from "@/hooks/useVisitTracker";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const AgendaDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  useVisitTracker(`agenda-${slug}`);
  
  const { post: event, isLoading, error } = usePost(slug || "");

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "EEEE, d MMMM yyyy", { locale: id });
  };

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      musyawarah: "bg-blue-500/20 text-blue-600 border-blue-500/30",
      kesehatan: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
      sosial: "bg-amber-500/20 text-amber-600 border-amber-500/30",
      pendidikan: "bg-purple-500/20 text-purple-600 border-purple-500/30",
      olahraga: "bg-rose-500/20 text-rose-600 border-rose-500/30",
    };
    return colors[category || ""] || "bg-muted text-muted-foreground";
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

  if (error || !event || event.type !== "agenda") {
    return <Navigate to="/agenda" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Image */}
      <section className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={event.image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 container mx-auto px-4">
          <div className="flex items-center gap-2 text-white/80">
            <CalendarDays className="w-5 h-5" />
            <span className="text-sm font-medium">Agenda & Kegiatan</span>
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
            to="/agenda"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Agenda
          </Link>

          {/* Category Badge */}
          {event.category && (
            <Badge className={`mb-4 ${getCategoryColor(event.category)}`}>
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </Badge>
          )}

          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
            {event.title}
          </h1>

          {/* Event Info */}
          <div className="bg-muted/50 rounded-xl p-4 mb-6">
            <div className="grid sm:grid-cols-3 gap-4">
              {event.event_date && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tanggal</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(event.event_date)}
                    </p>
                  </div>
                </div>
              )}
              {event.event_time && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Waktu</p>
                    <p className="text-sm font-medium text-foreground">{event.event_time}</p>
                  </div>
                </div>
              )}
              {event.event_location && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Lokasi</p>
                    <p className="text-sm font-medium text-foreground">{event.event_location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              Admin SILADA
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Dibuat: {format(new Date(event.created_at), "d MMMM yyyy", { locale: id })}
            </span>
          </div>

          {/* Content */}
          <div
            className="max-w-none text-base leading-[1.7] text-left md:text-justify break-words [&_p]:text-muted-foreground [&_p]:mb-4 [&_h1]:text-foreground [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_li]:text-muted-foreground [&_li]:mb-1 [&_a]:text-primary [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: event.content || event.excerpt || "" }}
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

export default AgendaDetail;
