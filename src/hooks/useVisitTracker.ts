import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const VISIT_KEY = "visit_recorded_pages";

/**
 * Track page visits - records once per page per session
 * @param pageName - Optional page identifier for analytics
 */
export const useVisitTracker = (pageName?: string) => {
  const hasRecorded = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const recordVisit = async () => {
      // Prevent duplicate recording in the same component lifecycle
      if (hasRecorded.current) return;

      // Get today's date
      const today = new Date().toISOString().split("T")[0];
      
      // Get recorded pages from session storage
      const recordedPagesJson = sessionStorage.getItem(VISIT_KEY);
      const recordedPages: Record<string, string[]> = recordedPagesJson 
        ? JSON.parse(recordedPagesJson) 
        : {};

      // Check if this page was already recorded today
      const todayPages = recordedPages[today] || [];
      const pageKey = pageName || "home";
      
      if (todayPages.includes(pageKey)) {
        hasRecorded.current = true;
        return;
      }

      try {
        const { error } = await supabase.rpc("record_visit");
        
        if (error) {
          console.error("Error recording visit:", error);
          return;
        }

        // Mark page as recorded for today
        todayPages.push(pageKey);
        recordedPages[today] = todayPages;
        
        // Clean old dates (keep only today)
        const cleanedRecords: Record<string, string[]> = { [today]: todayPages };
        sessionStorage.setItem(VISIT_KEY, JSON.stringify(cleanedRecords));
        
        hasRecorded.current = true;

        // Invalidate statistics queries for real-time update
        queryClient.invalidateQueries({ queryKey: ["statistics"] });
        queryClient.invalidateQueries({ queryKey: ["today-stats"] });
      } catch (error) {
        console.error("Error recording visit:", error);
      }
    };

    recordVisit();
  }, [pageName, queryClient]);
};
