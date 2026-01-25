import { motion } from "framer-motion";
import { ExternalLink, ChevronRight } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import DynamicIcon from "@/components/DynamicIcon";

const colorMap: Record<string, string> = {
  pelayanan: "from-teal to-cyan",
  informasi: "from-cyan to-sky",
  hukum: "from-secondary to-teal",
  umum: "from-primary to-secondary",
};

const MobileServicesGrid = () => {
  const { services, isLoading, incrementClick } = useServices();

  const handleServiceClick = async (serviceId: string, externalUrl?: string | null) => {
    await incrementClick(serviceId);
    if (externalUrl) {
      window.open(externalUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="mobile-card">
              <Skeleton className="w-12 h-12 rounded-xl mb-3" />
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-muted-foreground">Belum ada layanan tersedia</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Layanan Digital</h2>
        <Link to="/layanan-digital" className="text-sm text-primary font-medium flex items-center gap-1">
          Lihat Semua
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-2 gap-3">
        {services.slice(0, 6).map((service, index) => {
          const gradientClass = colorMap[service.category || "umum"] || "from-primary to-secondary";

          return (
            <motion.button
              key={service.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => handleServiceClick(service.id, service.external_url)}
              className="mobile-card-interactive text-left"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center mb-3`}>
                <DynamicIcon name={service.icon} className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-start justify-between gap-1">
                <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
                  {service.name}
                </h3>
                {service.external_url && (
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                )}
              </div>
              {service.click_count > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {service.click_count.toLocaleString()} klik
                </p>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* View All Button */}
      {services.length > 6 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4"
        >
          <Link to="/layanan-digital" className="block">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-12">
              Lihat Semua Layanan ({services.length})
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default MobileServicesGrid;
