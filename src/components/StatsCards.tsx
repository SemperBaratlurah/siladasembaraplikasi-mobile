import { FileText, Activity, Users, MousePointer } from "lucide-react";
import { motion } from "framer-motion";
import { useTodayStats, useStatistics } from "@/hooks/useStatistics";
import { useServices } from "@/hooks/useServices";
import { usePages } from "@/hooks/usePages";
import { usePosts } from "@/hooks/usePosts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/formatNumber";

const StatsCards = () => {
  const { todayStats, isLoading: statsLoading } = useTodayStats();
  const { aggregatedStats, isLoading: aggregatedLoading } = useStatistics(30);
  const { services, isLoading: servicesLoading } = useServices();
  const { pages, isLoading: pagesLoading } = usePages("published");
  const { posts, isLoading: postsLoading } = usePosts(undefined, "published");

  const isLoading = statsLoading || servicesLoading || pagesLoading || postsLoading || aggregatedLoading;

  const stats = [
    {
      icon: FileText,
      label: "Total Halaman",
      value: formatNumber(pages.length),
      color: "text-teal",
      bgColor: "bg-teal/10",
    },
    {
      icon: Activity,
      label: "Konten Aktif",
      value: formatNumber(services.length + posts.length),
      color: "text-cyan",
      bgColor: "bg-cyan/10",
    },
    {
      icon: Users,
      label: "Total Pengunjung",
      value: formatNumber(aggregatedStats.totalVisits),
      subtitle: `Hari ini: ${formatNumber(todayStats.visits)}`,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      icon: MousePointer,
      label: "Total Klik",
      value: formatNumber(aggregatedStats.totalClicks),
      subtitle: `Hari ini: ${formatNumber(todayStats.clicks)}`,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-2xl p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="w-12 h-12 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-card"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {stat.value}
              </p>
              {stat.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              )}
            </div>
            <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
