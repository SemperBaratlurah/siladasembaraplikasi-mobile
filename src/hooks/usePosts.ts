import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  type: string;
  category: string | null;
  image_url: string | null;
  status: string;
  event_date: string | null;
  event_time: string | null;
  event_location: string | null;
  published_at: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePostInput {
  title: string;
  slug: string;
  type: string;
  status?: string;
  excerpt?: string | null;
  content?: string | null;
  category?: string | null;
  image_url?: string | null;
  event_date?: string | null;
  event_time?: string | null;
  event_location?: string | null;
  published_at?: string | null;
  author_id?: string | null;
}

export const usePosts = (type?: string, status?: string) => {
  const queryClient = useQueryClient();

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["posts", type, status],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select("*")
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (type && type !== "all") {
        query = query.eq("type", type);
      }

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Post[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("posts-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["posts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createPost = useMutation({
    mutationFn: async (newPost: CreatePostInput) => {
      const { data, error } = await supabase
        .from("posts")
        .insert(newPost)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const updatePost = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Post> & { id: string }) => {
      const { data, error } = await supabase
        .from("posts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return { posts: posts || [], isLoading, error, createPost, updatePost, deletePost };
};

export const usePost = (slug: string) => {
  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error) throw error;
      return data as Post;
    },
    enabled: !!slug,
  });

  return { post, isLoading, error };
};

export const usePostsMutation = () => {
  const queryClient = useQueryClient();

  const createPost = useMutation({
    mutationFn: async (newPost: CreatePostInput) => {
      const { data, error } = await supabase
        .from("posts")
        .insert(newPost)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const updatePost = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Post> & { id: string }) => {
      const { data, error } = await supabase
        .from("posts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return { createPost, updatePost, deletePost };
};
