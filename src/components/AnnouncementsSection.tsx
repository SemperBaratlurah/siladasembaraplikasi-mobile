import { Link } from "react-router-dom";
import { Bell, ArrowRight, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePublicAnnouncements } from "@/hooks/usePublicAnnouncements";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const AnnouncementsSection = () => {
  const { announcements, isLoading } = usePublicAnnouncements();

  // Show only latest 3 announcements on homepage
  const latestAnnouncements = announcements.slice(0, 3);

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Pengumuman</h2>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (latestAnnouncements.length === 0) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Pengumuman</h2>
          </div>
        </div>
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Belum ada pengumuman terbaru</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Pengumuman</h2>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/pengumuman" className="flex items-center gap-1">
            Lihat Semua
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
        {latestAnnouncements.map((announcement) => (
          <Card 
            key={announcement.id} 
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/pengumuman/${announcement.slug}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                  >
                    {announcement.title}
                  </Link>
                  {announcement.excerpt && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {announcement.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(
                        new Date(announcement.published_at || announcement.created_at),
                        "d MMMM yyyy",
                        { locale: id }
                      )}
                    </span>
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  Baru
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default AnnouncementsSection;
