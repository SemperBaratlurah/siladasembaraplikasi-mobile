import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
}

export const usePages = (status?: string) => {
  const queryClient = useQueryClient();

  const { data: pages, isLoading, error } = useQuery({
    queryKey: ["pages", status],
    queryFn: async () => {
      let query = supabase
        .from("pages")
        .select("*")
        .order("updated_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Page[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("pages-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pages",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["pages"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { pages: pages || [], isLoading, error };
};

export const usePage = (slug: string) => {
  const { data: page, isLoading, error } = useQuery({
    queryKey: ["page", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error) throw error;
      return data as Page;
    },
    enabled: !!slug,
  });

  return { page, isLoading, error };
};

export const usePagesMutation = () => {
  const queryClient = useQueryClient();

  const createPage = useMutation({
    mutationFn: async (newPage: Omit<Page, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("pages")
        .insert(newPage)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });

  const updatePage = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Page> & { id: string }) => {
      const { data, error } = await supabase
        .from("pages")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });

  const deletePage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pages")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });

  return { createPage, updatePage, deletePage };
};
