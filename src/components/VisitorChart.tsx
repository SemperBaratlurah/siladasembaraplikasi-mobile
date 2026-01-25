import { motion } from "framer-motion";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from "recharts";
import { useStatistics } from "@/hooks/useStatistics";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatNumber } from "@/lib/formatNumber";

const VisitorChart = () => {
  const [days, setDays] = useState(7);
  const { chartData, isLoading } = useStatistics(days);

  // Format data for chart display
  const formattedData = chartData.map((item) => ({
    day: format(new Date(item.date), "EEE", { locale: id }),
    fullDate: format(new Date(item.date), "d MMM", { locale: id }),
    visitors: item.visitors,
    clicks: item.clicks,
  }));

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-card"
      >
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-44" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white rounded-2xl p-6 shadow-card"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Statistik Pengunjung & Klik
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setDays(7)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              days === 7 
                ? "bg-secondary text-white" 
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            7 hari
          </button>
          <button 
            onClick={() => setDays(30)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              days === 30 
                ? "bg-secondary text-white" 
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            30 hari
          </button>
        </div>
      </div>

      <div className="h-64">
        {formattedData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Belum ada data statistik
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(187, 70%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(187, 70%, 45%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(24, 75%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(24, 75%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis 
                dataKey={days <= 7 ? "day" : "fullDate"}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px -4px rgba(0,0,0,0.15)",
                }}
                formatter={(value: number, name: string) => [
                  value.toLocaleString('id-ID'),
                  name === "visitors" ? "Pengunjung" : "Klik"
                ]}
                labelFormatter={(label) => `Hari: ${label}`}
              />
              <Legend 
                formatter={(value) => value === "visitors" ? "Pengunjung" : "Klik"}
                wrapperStyle={{ paddingTop: "10px" }}
              />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="hsl(187, 70%, 45%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVisitors)"
                name="visitors"
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="hsl(24, 75%, 50%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorClicks)"
                name="clicks"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
};

export default VisitorChart;
