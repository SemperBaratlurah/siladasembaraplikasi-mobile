import { motion } from "framer-motion";
import { usePopularServices } from "@/hooks/useServices";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/formatNumber";
import DynamicIcon from "@/components/DynamicIcon";
import ConnectionStatus from "@/components/ConnectionStatus";

const colorMap: Record<number, string> = {
  0: "bg-teal",
  1: "bg-cyan",
  2: "bg-secondary",
  3: "bg-primary",
};

const PopularServices = () => {
  const { services, isLoading, error } = usePopularServices(4);

  const maxCount = services.length > 0 
    ? Math.max(...services.map((s) => s.click_count), 1) 
    : 1;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-card"
      >
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-6" />
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-white rounded-2xl p-6 shadow-card"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Layanan Populer
        </h3>
        <span className="text-xs text-muted-foreground">Real-time</span>
      </div>

      {error && (
        <ConnectionStatus 
          isError={true} 
          errorMessage="Gagal memuat data layanan populer" 
        />
      )}

      {!error && services.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Belum ada data layanan
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((service, index) => {
            const color = colorMap[index] || "bg-secondary";
            const percentage = maxCount > 0 ? (service.click_count / maxCount) * 100 : 0;

            return (
              <div key={service.id} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                  <DynamicIcon name={service.icon} className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground text-sm truncate max-w-[150px]">
                      {service.name}
                    </span>
                    <span className="text-muted-foreground text-sm whitespace-nowrap">
                      {formatNumber(service.click_count)}{" "}
                      <span className="text-xs">klik</span>
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                      className={`h-full ${color} rounded-full`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default PopularServices;
