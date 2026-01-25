import { motion } from "framer-motion";
import { ChevronRight, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { usePublicEvents, getUpcomingEvents } from "@/hooks/usePublicEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const MobileAgendaList = () => {
  const { events: allEvents, isLoading } = usePublicEvents();
  const events = getUpcomingEvents(allEvents).slice(0, 3);

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mobile-card flex gap-3">
              <Skeleton className="w-14 h-14 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Agenda</h2>
        <Link to="/agenda" className="text-sm text-primary font-medium flex items-center gap-1">
          Lihat Semua
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {events.map((event, index) => {
          const eventDate = event.event_date ? new Date(event.event_date) : null;
          
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link
                to={`/agenda/${event.slug}`}
                className="mobile-card-interactive flex gap-4"
              >
                {/* Date Badge */}
                {eventDate && (
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-primary leading-none">
                      {format(eventDate, "dd")}
                    </span>
                    <span className="text-xs text-primary/80 uppercase">
                      {format(eventDate, "MMM", { locale: id })}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 mb-1">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {event.event_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.event_time}
                      </span>
                    )}
                    {event.event_location && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3" />
                        {event.event_location}
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 self-center" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileAgendaList;
