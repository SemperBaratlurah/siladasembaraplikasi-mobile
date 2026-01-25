import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface PublicNewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  image_url: string | null;
  published_at: string | null;
  created_at: string;
}

export const newsCategories = [
  { id: "all", label: "Semua" },
  { id: "pengumuman", label: "Pengumuman" },
  { id: "kegiatan", label: "Kegiatan" },
  { id: "layanan", label: "Layanan" },
  { id: "program", label: "Program" },
];

export const usePublicNews = (category?: string) => {
  const queryClient = useQueryClient();

  const { data: articles, isLoading, error } = useQuery({
    queryKey: ["public-news", category],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select("id, title, slug, excerpt, content, category, image_url, published_at, created_at")
        .eq("type", "berita")
        .eq("status", "published")
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as PublicNewsArticle[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("public-news-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          // Only refresh if it's a news article
          const newRecord = payload.new as { type?: string } | null;
          const oldRecord = payload.old as { type?: string } | null;
          if (newRecord?.type === "berita" || oldRecord?.type === "berita") {
            queryClient.invalidateQueries({ queryKey: ["public-news"] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { articles: articles || [], isLoading, error };
};

export const usePublicNewsArticle = (slug: string) => {
  const queryClient = useQueryClient();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["public-news-article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", slug)
        .eq("type", "berita")
        .eq("status", "published")
        .single();

      if (error) throw error;
      return data as PublicNewsArticle;
    },
    enabled: !!slug,
  });

  // Real-time subscription for single article
  useEffect(() => {
    if (!slug) return;

    const channel = supabase
      .channel(`public-news-article-${slug}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["public-news-article", slug] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, slug]);

  return { article, isLoading, error };
};
