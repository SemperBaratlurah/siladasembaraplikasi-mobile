import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface Activity {
  id: string;
  actor_id: string | null;
  actor_type: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  target_title: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export const useActivities = (limit = 10) => {
  const queryClient = useQueryClient();

  const { data: activities, isLoading, error } = useQuery({
    queryKey: ["activities", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Activity[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("activities-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activities_log",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["activities"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { activities: activities || [], isLoading, error };
};

export const logActivity = async (
  action: string,
  targetType?: string,
  targetId?: string,
  targetTitle?: string,
  actorType: "admin" | "public" = "public"
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from("activities_log").insert({
      actor_id: user?.id || null,
      actor_type: actorType,
      action,
      target_type: targetType,
      target_id: targetId,
      target_title: targetTitle,
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};
