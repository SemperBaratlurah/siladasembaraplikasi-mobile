import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface DailyStatistic {
  id: string;
  date: string;
  total_visits: number;
  total_clicks: number;
  service_id: string | null;
  created_at: string;
}

export const useStatistics = (days: number = 7) => {
  const queryClient = useQueryClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split("T")[0];

  const { data: statistics, isLoading, error } = useQuery({
    queryKey: ["statistics", days],
    queryFn: async () => {
      // Fetch all records without limit - handle pagination for large datasets
      let allData: DailyStatistic[] = [];
      let hasMore = true;
      let offset = 0;
      const pageSize = 1000;

      while (hasMore) {
        const { data, error } = await supabase
          .from("statistics_daily")
          .select("*")
          .gte("date", startDateStr)
          .order("date", { ascending: true })
          .range(offset, offset + pageSize - 1);

        if (error) throw error;
        
        if (data && data.length > 0) {
          allData = [...allData, ...(data as DailyStatistic[])];
          offset += pageSize;
          hasMore = data.length === pageSize;
        } else {
          hasMore = false;
        }
      }

      return allData;
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("statistics-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "statistics_daily",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["statistics"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Aggregate statistics - no limits
  const aggregatedStats = statistics?.reduce(
    (acc, stat) => {
      acc.totalVisits += stat.total_visits;
      acc.totalClicks += stat.total_clicks;
      return acc;
    },
    { totalVisits: 0, totalClicks: 0 }
  ) || { totalVisits: 0, totalClicks: 0 };

  // Group by date for chart
  const chartData = statistics?.reduce((acc: Record<string, { date: string; visitors: number; clicks: number }>, stat) => {
    if (!acc[stat.date]) {
      acc[stat.date] = { date: stat.date, visitors: 0, clicks: 0 };
    }
    acc[stat.date].visitors += stat.total_visits;
    acc[stat.date].clicks += stat.total_clicks;
    return acc;
  }, {});

  const chartDataArray = chartData
    ? Object.values(chartData).sort((a, b) => a.date.localeCompare(b.date))
    : [];

  return {
    statistics: statistics || [],
    aggregatedStats,
    chartData: chartDataArray,
    isLoading,
    error,
  };
};

export const useTodayStats = () => {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: todayStats, isLoading, error } = useQuery({
    queryKey: ["today-stats"],
    queryFn: async () => {
      // Fetch all today's records without limit
      let allData: DailyStatistic[] = [];
      let hasMore = true;
      let offset = 0;
      const pageSize = 1000;

      while (hasMore) {
        const { data, error } = await supabase
          .from("statistics_daily")
          .select("*")
          .eq("date", today)
          .range(offset, offset + pageSize - 1);

        if (error) throw error;
        
        if (data && data.length > 0) {
          allData = [...allData, ...(data as DailyStatistic[])];
          offset += pageSize;
          hasMore = data.length === pageSize;
        } else {
          hasMore = false;
        }
      }
      
      const totals = allData.reduce(
        (acc, stat) => {
          acc.visits += stat.total_visits;
          acc.clicks += stat.total_clicks;
          return acc;
        },
        { visits: 0, clicks: 0 }
      );
      
      return totals;
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("today-stats-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "statistics_daily",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["today-stats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { todayStats: todayStats || { visits: 0, clicks: 0 }, isLoading, error };
};
