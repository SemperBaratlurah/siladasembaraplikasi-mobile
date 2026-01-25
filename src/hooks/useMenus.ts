import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

export interface Menu {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  url: string | null;
  icon: string;
  display_order: number;
  is_active: boolean;
  target: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMenuInput {
  name: string;
  slug: string;
  parent_id?: string | null;
  url?: string | null;
  icon?: string;
  display_order?: number;
  is_active?: boolean;
  target?: string;
  location?: string;
}

export type MenuLocation = "header" | "sidebar" | "homepage";

export const useMenus = (activeOnly = false, location?: MenuLocation) => {
  const queryClient = useQueryClient();

  const { data: menus, isLoading, error } = useQuery({
    queryKey: ["menus", activeOnly, location],
    queryFn: async () => {
      let query = supabase
        .from("menus")
        .select("*")
        .order("display_order", { ascending: true });

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      if (location) {
        query = query.eq("location", location);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Menu[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("menus-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "menus",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["menus"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createMenu = useMutation({
    mutationFn: async (newMenu: CreateMenuInput) => {
      const { data, error } = await supabase
        .from("menus")
        .insert(newMenu)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });

  const updateMenu = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Menu> & { id: string }) => {
      const { data, error } = await supabase
        .from("menus")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });

  const deleteMenu = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("menus")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });

  return {
    menus: menus || [],
    isLoading,
    error,
    createMenu,
    updateMenu,
    deleteMenu,
  };
};
