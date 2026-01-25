import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

export interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string | null;
  event_date: string | null;
  is_featured: boolean | null;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateGalleryInput {
  title: string;
  image_url: string;
  description?: string | null;
  category?: string | null;
  event_date?: string | null;
  is_featured?: boolean | null;
  display_order?: number | null;
}

export const useGallery = (category?: string) => {
  const queryClient = useQueryClient();

  const { data: gallery, isLoading, error } = useQuery({
    queryKey: ["gallery", category],
    queryFn: async () => {
      let query = supabase
        .from("gallery")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as GalleryItem[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("gallery-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "gallery",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["gallery"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createGalleryItem = useMutation({
    mutationFn: async (newItem: CreateGalleryInput) => {
      const { data, error } = await supabase
        .from("gallery")
        .insert(newItem)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });

  const updateGalleryItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GalleryItem> & { id: string }) => {
      const { data, error } = await supabase
        .from("gallery")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });

  const deleteGalleryItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("gallery")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });

  return { gallery: gallery || [], isLoading, error, createGalleryItem, updateGalleryItem, deleteGalleryItem };
};

export const useFeaturedGallery = () => {
  const queryClient = useQueryClient();

  const { data: featuredGallery, isLoading, error } = useQuery({
    queryKey: ["featured-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .eq("is_featured", true)
        .order("display_order", { ascending: true })
        .limit(6);

      if (error) throw error;
      return data as GalleryItem[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("featured-gallery-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "gallery",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["featured-gallery"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { featuredGallery: featuredGallery || [], isLoading, error };
};

export const useGalleryMutation = () => {
  const queryClient = useQueryClient();

  const addImage = useMutation({
    mutationFn: async (newItem: CreateGalleryInput) => {
      const { data, error } = await supabase
        .from("gallery")
        .insert(newItem)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });

  const updateImage = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GalleryItem> & { id: string }) => {
      const { data, error } = await supabase
        .from("gallery")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });

  const deleteImage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("gallery")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });

  return { addImage, updateImage, deleteImage };
};
