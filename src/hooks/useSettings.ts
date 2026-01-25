import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

export interface Setting {
  id: string;
  key: string;
  value: any;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const useSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .order("key", { ascending: true });

      if (error) throw error;
      return data as Setting[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("settings-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_settings",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["settings"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      // Use UPSERT - insert if not exists, update if exists
      const { data, error } = await supabase
        .from("site_settings")
        .upsert(
          { 
            key, 
            value: JSON.stringify(value),
            updated_at: new Date().toISOString()
          },
          { 
            onConflict: "key",
            ignoreDuplicates: false 
          }
        )
        .select()
        .single();

      if (error) {
        console.error("Error saving setting:", key, error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const getSetting = (key: string) => {
    const setting = settings?.find(s => s.key === key);
    if (!setting) return null;
    try {
      return JSON.parse(setting.value);
    } catch {
      return setting.value;
    }
  };

  return {
    settings: settings || [],
    isLoading,
    error,
    updateSetting,
    getSetting,
  };
};
