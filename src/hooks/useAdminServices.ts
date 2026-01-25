import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

export interface Service {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  category: string | null;
  is_active: boolean;
  click_count: number;
  external_url: string | null;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceInput {
  name: string;
  description?: string | null;
  icon: string;
  category?: string | null;
  is_active: boolean;
  external_url?: string | null;
  display_order?: number;
}

export interface UpdateServiceInput extends Partial<CreateServiceInput> {
  id: string;
}

export const useAdminServices = () => {
  const queryClient = useQueryClient();

  const { data: services, isLoading, error } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Service[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("admin-services-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "services",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-services"] });
          queryClient.invalidateQueries({ queryKey: ["services"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createService = useMutation({
    mutationFn: async (input: CreateServiceInput) => {
      const { data, error } = await supabase
        .from("services")
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const updateService = useMutation({
    mutationFn: async ({ id, ...input }: UpdateServiceInput) => {
      const { data, error } = await supabase
        .from("services")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  return {
    services: services || [],
    isLoading,
    error,
    createService,
    updateService,
    deleteService,
  };
};
