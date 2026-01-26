import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, User, ArrowLeft, Share2, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import MobileLayout from "@/components/MobileLayout";
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
      <MobileLayout title="Agenda" showSearch={false}>
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

  if (error || !event || event.type !== "agenda") {
    return <Navigate to="/agenda" replace />;
  }

  return (
    <MobileLayout title="Agenda" showSearch={false}>
      <div className="px-4 py-4">
        {/* Back Button */}
        <Link
          to="/agenda"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>

        {/* Hero Image */}
        <div className="relative h-48 rounded-xl overflow-hidden mb-4">
          <img
            src={event.image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop"}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl shadow-card p-4"
        >
          {/* Category Badge */}
          {event.category && (
            <Badge className={`mb-3 ${getCategoryColor(event.category)}`}>
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </Badge>
          )}

          {/* Title */}
          <h1 className="text-xl font-bold text-foreground mb-3 leading-tight">
            {event.title}
          </h1>

          {/* Event Info */}
          <div className="bg-muted/50 rounded-xl p-3 mb-4">
            <div className="grid grid-cols-1 gap-3">
              {event.event_date && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-primary" />
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
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Waktu</p>
                    <p className="text-sm font-medium text-foreground">{event.event_time}</p>
                  </div>
                </div>
              )}
              {event.event_location && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
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
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4 pb-4 border-b">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              Admin
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(event.created_at), "d MMMM yyyy", { locale: id })}
            </span>
          </div>

          {/* Content */}
          <div
            className="text-sm leading-relaxed break-words [&_p]:text-muted-foreground [&_p]:mb-3 [&_h1]:text-foreground [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-foreground [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-3 [&_li]:text-muted-foreground [&_li]:mb-1 [&_a]:text-primary [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: event.content || event.excerpt || "" }}
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

export default AgendaDetail;
