import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarDays, MapPin, Clock, ChevronRight, Filter } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  usePublicEvents,
  eventCategories,
  getUpcomingEvents,
  getEventsByDate,
  getEventDates,
  PublicEvent,
} from "@/hooks/usePublicEvents";
import { useVisitTracker } from "@/hooks/useVisitTracker";

const Agenda = () => {
  useVisitTracker("agenda");
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  const { events, isLoading } = usePublicEvents(activeCategory === "all" ? undefined : activeCategory);

  const eventsOnSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return getEventsByDate(events, selectedDate);
  }, [events, selectedDate]);

  const upcomingEvents = useMemo(() => getUpcomingEvents(events), [events]);
  const eventDates = useMemo(() => getEventDates(events), [events]);

  const filteredEvents = useMemo(() => {
    if (activeCategory === "all") return upcomingEvents;
    return upcomingEvents.filter((e) => e.category === activeCategory);
  }, [upcomingEvents, activeCategory]);

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

  const getCategoryLabel = (categoryId: string | null) => {
    if (!categoryId) return "Umum";
    return eventCategories.find((c) => c.id === categoryId)?.label || categoryId;
  };

  const EventCard = ({ event, compact = false }: { event: PublicEvent; compact?: boolean }) => (
    <Link to={`/agenda/${event.slug}`} className="block">
      <div className="bg-card rounded-xl border shadow-sm hover:shadow-md transition-all p-4 cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getCategoryColor(event.category))}>
                {getCategoryLabel(event.category)}
              </span>
            </div>
            <h3 className="font-semibold text-foreground hover:text-primary transition-colors mb-1">{event.title}</h3>
            {!compact && event.excerpt && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {event.excerpt}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {event.event_date && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {format(new Date(event.event_date), "d MMMM yyyy", { locale: id })}
                </span>
              )}
              {event.event_time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {event.event_time}
                </span>
              )}
              {event.event_location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {event.event_location}
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
    </Link>
  );

  const renderSkeletons = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-card rounded-xl border p-4">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="gradient-hero py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Agenda & Kegiatan
            </h1>
            <p className="text-white/80 text-lg">
              Jadwal kegiatan dan acara di Kelurahan Semper Barat
            </p>
          </motion.div>
        </div>
      </section>

      {/* View Toggle & Categories */}
      <section className="py-6 border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode("calendar")}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all",
                  viewMode === "calendar"
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Kalender
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all",
                  viewMode === "list"
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Daftar
              </button>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 justify-center">
              {eventCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                    activeCategory === category.id
                      ? "bg-secondary text-white"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {viewMode === "calendar" ? (
            <div className="grid lg:grid-cols-[400px_1fr] gap-8">
              {/* Calendar */}
              <div className="bg-card rounded-2xl shadow-card p-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={id}
                  className="pointer-events-auto"
                  modifiers={{
                    hasEvent: eventDates,
                  }}
                  modifiersStyles={{
                    hasEvent: {
                      fontWeight: "bold",
                      backgroundColor: "hsl(var(--secondary) / 0.1)",
                      color: "hsl(var(--secondary))",
                    },
                  }}
                />
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-secondary/20"></span>
                    Tanggal dengan kegiatan
                  </p>
                </div>
              </div>

              {/* Events for Selected Date */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  {selectedDate
                    ? format(selectedDate, "EEEE, d MMMM yyyy", { locale: id })
                    : "Pilih tanggal"}
                </h2>
                {isLoading ? (
                  renderSkeletons()
                ) : (
                  <AnimatePresence mode="wait">
                    {eventsOnSelectedDate.length > 0 ? (
                      <motion.div
                        key={selectedDate?.toISOString()}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        {eventsOnSelectedDate.map((event) => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-muted/50 rounded-xl p-8 text-center"
                      >
                        <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">
                          Tidak ada kegiatan pada tanggal ini
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                {/* Upcoming Events Preview */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Kegiatan Mendatang
                  </h3>
                  {isLoading ? (
                    renderSkeletons()
                  ) : upcomingEvents.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingEvents.slice(0, 3).map((event) => (
                        <EventCard key={event.id} event={event} compact />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Belum ada kegiatan mendatang
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* List View */
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Semua Kegiatan ({filteredEvents.length})
                </h2>
              </div>
              {isLoading ? (
                renderSkeletons()
              ) : filteredEvents.length > 0 ? (
                <div className="space-y-4">
                  {filteredEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <EventCard event={event} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/50 rounded-xl p-12 text-center">
                  <Filter className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Tidak ada kegiatan dalam kategori ini
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Agenda;
