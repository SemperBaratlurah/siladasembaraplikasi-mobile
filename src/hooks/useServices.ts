import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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

export const useServices = () => {
  const queryClient = useQueryClient();

  const { data: services, isLoading, error } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Service[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("services-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "services",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["services"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const incrementClick = async (serviceId: string) => {
    try {
      await supabase.rpc("increment_service_click", { service_id: serviceId });
      // Invalidate all related queries for real-time update
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["popular-services"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
      queryClient.invalidateQueries({ queryKey: ["today-stats"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    } catch (error) {
      console.error("Error incrementing click:", error);
    }
  };

  return { services: services || [], isLoading, error, incrementClick };
};

export const usePopularServices = (limit = 4) => {
  const queryClient = useQueryClient();

  const { data: services, isLoading, error } = useQuery({
    queryKey: ["popular-services", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("click_count", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Service[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("popular-services-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "services",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["popular-services", limit] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, limit]);

  return { services: services || [], isLoading, error };
};
