import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { sanitizeText } from "@/lib/sanitize";

export interface SiteSettings {
  site_name?: string;
  site_tagline?: string;
  contact_address?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_hours?: string;
  about_title?: string;
  about_description?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_description?: string;
  // Social media
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  social_youtube?: string;
  social_whatsapp?: string;
  // Vision & Mission for homepage
  vision?: string;
  mission?: string[];
  // Features
  ai_chat_enabled?: boolean;
  wa_floating_enabled?: boolean;
}

export const usePublicSiteSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["public-site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value");

      if (error) throw error;

      // Convert array of settings to object and sanitize values
      const settingsMap: Record<string, unknown> = {};
      data?.forEach((item) => {
        // Sanitize string values to remove wrapped quotes
        const value = typeof item.value === "string" 
          ? sanitizeText(item.value) 
          : item.value;
        settingsMap[item.key] = value;
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
        about_title: settingsMap.about_title as string | undefined,
        about_description: settingsMap.about_description as string | undefined,
        hero_title: settingsMap.hero_title as string | undefined,
        hero_subtitle: settingsMap.hero_subtitle as string | undefined,
        hero_description: settingsMap.hero_description as string | undefined,
        // Social media
        social_facebook: settingsMap.social_facebook as string | undefined,
        social_instagram: settingsMap.social_instagram as string | undefined,
        social_twitter: settingsMap.social_twitter as string | undefined,
        social_youtube: settingsMap.social_youtube as string | undefined,
        social_whatsapp: settingsMap.social_whatsapp as string | undefined,
        // Vision & Mission
        vision: settingsMap.vision as string | undefined,
        mission: missionArray.length > 0 ? missionArray : undefined,
        // Features
        ai_chat_enabled: settingsMap.ai_chat_enabled === true || settingsMap.ai_chat_enabled === "true",
        wa_floating_enabled: settingsMap.wa_floating_enabled === true || settingsMap.wa_floating_enabled === "true",
      } as SiteSettings;
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("public-site-settings-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_settings",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["public-site-settings"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { settings: settings || {} as SiteSettings, isLoading, error };
};
