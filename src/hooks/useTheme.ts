import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface ThemeSettings {
  theme_mode?: string;
  theme_primary_color?: string;
  theme_secondary_color?: string;
  theme_font_family?: string;
}

// Convert hex color to HSL values for CSS variables
const hexToHsl = (hex: string): string => {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const useTheme = () => {
  const queryClient = useQueryClient();

  const { data: themeSettings, isLoading, error } = useQuery({
    queryKey: ["theme-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["theme_mode", "theme_primary_color", "theme_secondary_color", "theme_font_family"]);

      if (error) throw error;

      const settings: ThemeSettings = {};
      data?.forEach((item) => {
        let value: string | undefined = undefined;
        // Parse JSON strings if needed
        if (typeof item.value === "string") {
          try {
            value = JSON.parse(item.value);
          } catch {
            value = item.value;
          }
        } else if (item.value !== null) {
          value = String(item.value);
        }
        settings[item.key as keyof ThemeSettings] = value;
      });

      return settings;
    },
  });

  // Apply theme to document
  useEffect(() => {
    if (!themeSettings) return;

    const root = document.documentElement;

    // Apply primary color
    if (themeSettings.theme_primary_color) {
      const primaryHsl = hexToHsl(themeSettings.theme_primary_color);
      root.style.setProperty("--primary", primaryHsl);
      root.style.setProperty("--ring", primaryHsl);
      root.style.setProperty("--navy", primaryHsl);
      root.style.setProperty("--sidebar-background", primaryHsl);
    }

    // Apply secondary color
    if (themeSettings.theme_secondary_color) {
      const secondaryHsl = hexToHsl(themeSettings.theme_secondary_color);
      root.style.setProperty("--secondary", secondaryHsl);
      root.style.setProperty("--teal", secondaryHsl);
      root.style.setProperty("--sidebar-primary", secondaryHsl);
    }

    // Apply font family
    if (themeSettings.theme_font_family) {
      root.style.setProperty("--font-family", `'${themeSettings.theme_font_family}', system-ui, sans-serif`);
      document.body.style.fontFamily = `'${themeSettings.theme_font_family}', system-ui, sans-serif`;
      
      // Load Google Font if not already loaded
      const fontName = themeSettings.theme_font_family.replace(/\s+/g, '+');
      const existingLink = document.querySelector(`link[href*="${fontName}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700;800&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    }

    // Apply dark mode
    if (themeSettings.theme_mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

  }, [themeSettings]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("theme-settings-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_settings",
        },
        (payload) => {
          // Only refetch if theme-related settings changed
          const key = (payload.new as any)?.key || (payload.old as any)?.key;
          if (key?.startsWith('theme_')) {
            queryClient.invalidateQueries({ queryKey: ["theme-settings"] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { themeSettings, isLoading, error };
};
