import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface PublicPage {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const usePublicPage = (slug: string) => {
  const queryClient = useQueryClient();

  const { data: page, isLoading, error } = useQuery({
    queryKey: ["public-page", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error) throw error;
      return data as PublicPage | null;
    },
    enabled: !!slug,
  });

  // Real-time subscription
  useEffect(() => {
    if (!slug) return;

    const channel = supabase
      .channel(`public-page-${slug}-realtime`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pages",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["public-page", slug] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, slug]);

  return { page, isLoading, error };
};
