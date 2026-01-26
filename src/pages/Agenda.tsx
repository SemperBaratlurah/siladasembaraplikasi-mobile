import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarDays, MapPin, Clock, ChevronRight, List, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import MobileLayout from "@/components/MobileLayout";
import PullToRefresh from "@/components/PullToRefresh";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  usePublicEvents,
  eventCategories,
  getUpcomingEvents,
  getEventsByDate,
  getEventDates,
} from "@/hooks/usePublicEvents";
import { useVisitTracker } from "@/hooks/useVisitTracker";

const Agenda = () => {
  useVisitTracker("agenda");
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list");

  const { events, isLoading, refetch } = usePublicEvents(activeCategory === "all" ? undefined : activeCategory);

  const eventsOnSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return getEventsByDate(events, selectedDate);
  }, [events, selectedDate]);

  const upcomingEvents = useMemo(() => getUpcomingEvents(events), [events]);
  const eventDates = useMemo(() => getEventDates(events), [events]);

  const handleRefresh = useCallback(async () => {
    await refetch();
    toast.success("Data berhasil diperbarui");
  }, [refetch]);

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      musyawarah: "bg-blue-500/20 text-blue-600",
      kesehatan: "bg-emerald-500/20 text-emerald-600",
      sosial: "bg-amber-500/20 text-amber-600",
      pendidikan: "bg-purple-500/20 text-purple-600",
      olahraga: "bg-rose-500/20 text-rose-600",
    };
    return colors[category || ""] || "bg-muted text-muted-foreground";
  };

  const getCategoryLabel = (categoryId: string | null) => {
    if (!categoryId) return "Umum";
    return eventCategories.find((c) => c.id === categoryId)?.label || categoryId;
  };

  return (
    <MobileLayout title="Agenda">
      {/* View Toggle */}
      <div className="px-4 pt-4 pb-2 flex gap-2">
        <button
          onClick={() => setViewMode("list")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors",
            viewMode === "list"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <List className="w-4 h-4" />
          Daftar
        </button>
        <button
          onClick={() => setViewMode("calendar")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors",
            viewMode === "calendar"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <CalendarIcon className="w-4 h-4" />
          Kalender
        </button>
      </div>

      {/* Categories */}
      <div className="border-b border-border">
        <ScrollArea className="w-full">
          <div className="flex px-4 py-3 gap-2">
            {eventCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  activeCategory === category.id
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {category.label}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <PullToRefresh onRefresh={handleRefresh}>
        {viewMode === "calendar" ? (
          <div className="px-4 py-4">
            {/* Calendar */}
            <div className="mobile-card mb-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={id}
                className="w-full"
                modifiers={{
                  hasEvent: eventDates,
                }}
                modifiersStyles={{
                  hasEvent: {
                    fontWeight: "bold",
                    backgroundColor: "hsl(var(--secondary) / 0.15)",
                    color: "hsl(var(--secondary))",
                  },
                }}
              />
            </div>

            {/* Events on selected date */}
            <h3 className="font-semibold text-foreground mb-3">
              {selectedDate
                ? format(selectedDate, "EEEE, d MMMM yyyy", { locale: id })
                : "Pilih tanggal"}
            </h3>
            
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="mobile-card">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                ))}
              </div>
            ) : eventsOnSelectedDate.length > 0 ? (
              <div className="space-y-3">
                {eventsOnSelectedDate.map((event) => (
                  <Link key={event.id} to={`/agenda/${event.slug}`} className="mobile-card-interactive block">
                    <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2", getCategoryColor(event.category))}>
                      {getCategoryLabel(event.category)}
                    </span>
                    <h4 className="font-semibold text-foreground text-sm mb-2">{event.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {event.event_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.event_time}
                        </span>
                      )}
                      {event.event_location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.event_location}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mobile-card text-center py-8">
                <CalendarDays className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">Tidak ada kegiatan</p>
              </div>
            )}
          </div>
        ) : (
          /* List View */
          <div className="px-4 py-4">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="mobile-card flex gap-4">
                    <Skeleton className="w-14 h-14 rounded-xl flex-shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event, index) => {
                  const eventDate = event.event_date ? new Date(event.event_date) : null;
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
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
                          <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-1", getCategoryColor(event.category))}>
                            {getCategoryLabel(event.category)}
                          </span>
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
            ) : (
              <div className="mobile-card text-center py-12">
                <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Belum ada kegiatan mendatang</p>
              </div>
            )}
          </div>
        )}
      </PullToRefresh>
    </MobileLayout>
  );
};

export default Agenda;
