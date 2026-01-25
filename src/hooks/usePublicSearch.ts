import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";

export interface SearchResult {
  id: string;
  type: "service" | "menu";
  name: string;
  description?: string;
  url?: string;
  icon?: string;
}

export const usePublicSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const queryClient = useQueryClient();

  // Fetch services
  const { data: services = [] } = useQuery({
    queryKey: ["search-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, description, external_url, icon")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch menus (header and sidebar)
  const { data: menus = [] } = useQuery({
    queryKey: ["search-menus"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menus")
        .select("id, name, slug, url, icon")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Subscribe to realtime changes
  useEffect(() => {
    const servicesChannel = supabase
      .channel("search-services-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "services" },
        () => queryClient.invalidateQueries({ queryKey: ["search-services"] })
      )
      .subscribe();

    const menusChannel = supabase
      .channel("search-menus-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menus" },
        () => queryClient.invalidateQueries({ queryKey: ["search-menus"] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(servicesChannel);
      supabase.removeChannel(menusChannel);
    };
  }, [queryClient]);

  // Filter results based on search term
  const results = useMemo<SearchResult[]>(() => {
    if (!debouncedSearch.trim()) return [];

    const searchLower = debouncedSearch.toLowerCase();

    const serviceResults: SearchResult[] = services
      .filter(
        (s) =>
          s.name?.toLowerCase().includes(searchLower) ||
          s.description?.toLowerCase().includes(searchLower)
      )
      .map((s) => ({
        id: s.id,
        type: "service" as const,
        name: s.name,
        description: s.description || undefined,
        url: s.external_url || undefined,
        icon: s.icon || undefined,
      }));

    const menuResults: SearchResult[] = menus
      .filter(
        (m) =>
          m.name?.toLowerCase().includes(searchLower) ||
          m.slug?.toLowerCase().includes(searchLower)
      )
      .map((m) => ({
        id: m.id,
        type: "menu" as const,
        name: m.name,
        url: m.url || `/${m.slug}`,
        icon: m.icon || undefined,
      }));

    return [...serviceResults, ...menuResults].slice(0, 10);
  }, [debouncedSearch, services, menus]);

  const isSearching = debouncedSearch.trim().length > 0;
  const noResults = isSearching && results.length === 0;

  return {
    searchTerm,
    setSearchTerm,
    results,
    isSearching,
    noResults,
  };
};
