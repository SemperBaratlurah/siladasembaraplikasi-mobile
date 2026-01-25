import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface PublicEvent {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  image_url: string | null;
  event_date: string | null;
  event_time: string | null;
  event_location: string | null;
  published_at: string | null;
  created_at: string;
}

export const eventCategories = [
  { id: "all", label: "Semua" },
  { id: "musyawarah", label: "Musyawarah" },
  { id: "kesehatan", label: "Kesehatan" },
  { id: "sosial", label: "Sosial" },
  { id: "pendidikan", label: "Pendidikan" },
  { id: "olahraga", label: "Olahraga" },
];

export const usePublicEvents = (category?: string) => {
  const queryClient = useQueryClient();

  const { data: events, isLoading, error } = useQuery({
    queryKey: ["public-events", category],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select("id, title, slug, excerpt, content, category, image_url, event_date, event_time, event_location, published_at, created_at")
        .eq("type", "agenda")
        .eq("status", "published")
        .order("event_date", { ascending: true, nullsFirst: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as PublicEvent[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("public-events-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          // Only refresh if it's an event
          const newRecord = payload.new as { type?: string } | null;
          const oldRecord = payload.old as { type?: string } | null;
          if (newRecord?.type === "agenda" || oldRecord?.type === "agenda") {
            queryClient.invalidateQueries({ queryKey: ["public-events"] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { events: events || [], isLoading, error };
};

export const getUpcomingEvents = (events: PublicEvent[]): PublicEvent[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return events
    .filter((event) => {
      if (!event.event_date) return false;
      const eventDate = new Date(event.event_date);
      return eventDate >= today;
    })
    .sort((a, b) => {
      const dateA = new Date(a.event_date || 0);
      const dateB = new Date(b.event_date || 0);
      return dateA.getTime() - dateB.getTime();
    });
};

export const getEventsByDate = (events: PublicEvent[], date: Date): PublicEvent[] => {
  return events.filter((event) => {
    if (!event.event_date) return false;
    const eventDate = new Date(event.event_date);
    return (
      eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear()
    );
  });
};

export const getEventDates = (events: PublicEvent[]): Date[] => {
  return events
    .filter((e) => e.event_date)
    .map((e) => new Date(e.event_date!));
};
