import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface PublicAnnouncement {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  published_at: string | null;
  created_at: string;
}

export const usePublicAnnouncements = () => {
  const queryClient = useQueryClient();

  const { data: announcements, isLoading, error, refetch } = useQuery({
    queryKey: ["public-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, slug, excerpt, content, image_url, published_at, created_at")
        .eq("type", "pengumuman")
        .eq("status", "published")
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PublicAnnouncement[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("public-announcements-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          // Only refresh if it's an announcement
          const newRecord = payload.new as { type?: string } | null;
          const oldRecord = payload.old as { type?: string } | null;
          if (newRecord?.type === "pengumuman" || oldRecord?.type === "pengumuman") {
            queryClient.invalidateQueries({ queryKey: ["public-announcements"] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { announcements: announcements || [], isLoading, error, refetch };
};
