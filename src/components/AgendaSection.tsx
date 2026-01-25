import { usePublicEvents, getUpcomingEvents } from "@/hooks/usePublicEvents";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const AgendaSection = () => {
  const { events, isLoading } = usePublicEvents();
  const upcomingEvents = getUpcomingEvents(events).slice(0, 4);

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Agenda & Kegiatan</h2>
            <p className="text-muted-foreground mt-1">Jadwal kegiatan dan acara di Kelurahan Semper Barat</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (upcomingEvents.length === 0) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Agenda & Kegiatan</h2>
            <p className="text-muted-foreground mt-1">Jadwal kegiatan dan acara di Kelurahan Semper Barat</p>
          </div>
          <Link to="/agenda">
            <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
              Lihat Semua
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">Belum ada agenda terjadwal</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">Agenda dan kegiatan akan ditampilkan di sini</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Agenda & Kegiatan</h2>
          <p className="text-muted-foreground mt-1">Jadwal kegiatan dan acara di Kelurahan Semper Barat</p>
        </div>
        <Link to="/agenda">
          <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
            Lihat Semua
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6">
        {upcomingEvents.map((event) => (
          <Link key={event.id} to={`/agenda/${event.slug}`} className="block">
            <Card className="overflow-hidden hover:shadow-md transition-shadow group h-full">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Date Badge */}
                  <div className="flex-shrink-0 w-20 bg-primary text-primary-foreground flex flex-col items-center justify-center p-3">
                    <span className="text-2xl font-bold leading-none">
                      {event.event_date ? format(new Date(event.event_date), "dd", { locale: id }) : "--"}
                    </span>
                    <span className="text-xs uppercase tracking-wide mt-1">
                      {event.event_date ? format(new Date(event.event_date), "MMM", { locale: id }) : "---"}
                    </span>
                    <span className="text-xs opacity-80">
                      {event.event_date ? format(new Date(event.event_date), "yyyy", { locale: id }) : "----"}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                      {event.event_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{event.event_time}</span>
                        </div>
                      )}
                      {event.event_location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="line-clamp-1">{event.event_location}</span>
                        </div>
                      )}
                    </div>

                    {event.excerpt && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-1">{event.excerpt}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Mobile View All Button */}
      <Link to="/agenda" className="sm:hidden">
        <Button variant="outline" className="w-full flex items-center justify-center gap-2">
          Lihat Semua Agenda
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </section>
  );
};

export default AgendaSection;
