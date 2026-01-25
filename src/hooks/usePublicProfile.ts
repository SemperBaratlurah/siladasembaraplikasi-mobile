import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { sanitizeText } from "@/lib/sanitize";

export interface ProfileSettings {
  site_name?: string;
  site_tagline?: string;
  contact_address?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_hours?: string;
  vision?: string;
  mission?: string[];
  history?: string;
  officials?: Official[];
}

export interface Official {
  name: string;
  position: string;
  image?: string;
}

export const usePublicProfile = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["public-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value");

      if (error) throw error;

      // Convert array of settings to object and sanitize values
      const settingsMap: Record<string, unknown> = {};
      data?.forEach((item) => {
        // Sanitize string values to remove wrapped quotes
        if (typeof item.value === "string") {
          settingsMap[item.key] = sanitizeText(item.value);
        } else if (Array.isArray(item.value)) {
          // Sanitize arrays of strings (like mission)
          settingsMap[item.key] = item.value.map((v: unknown) => 
            typeof v === "string" ? sanitizeText(v) : v
          );
        } else {
          settingsMap[item.key] = item.value;
        }
      });

      // Parse mission as array (split by newlines or literal \n if string)
      let missionArray: string[] = [];
      const missionRaw = settingsMap.mission;
      if (typeof missionRaw === "string" && missionRaw.trim()) {
        // Split by actual newline OR literal \n (escaped in data)
        missionArray = missionRaw
          .split(/\\n|\n/)
          .map(line => line.trim())
          .filter(line => line.length > 0);
      } else if (Array.isArray(missionRaw)) {
        missionArray = missionRaw.map(item => 
          typeof item === "string" ? item.trim() : String(item)
        ).filter(line => line.length > 0);
      }

      // Return only actual database values - no fallbacks
      return {
        site_name: settingsMap.site_name as string | undefined,
        site_tagline: settingsMap.site_tagline as string | undefined,
        contact_address: settingsMap.contact_address as string | undefined,
        contact_phone: settingsMap.contact_phone as string | undefined,
        contact_email: settingsMap.contact_email as string | undefined,
        contact_hours: settingsMap.contact_hours as string | undefined,
        vision: settingsMap.vision as string | undefined,
        mission: missionArray.length > 0 ? missionArray : undefined,
        history: settingsMap.history as string | undefined,
        officials: settingsMap.officials as Official[] | undefined,
      } as ProfileSettings;
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("public-profile-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_settings",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["public-profile"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { settings: settings || {} as ProfileSettings, isLoading, error };
};
