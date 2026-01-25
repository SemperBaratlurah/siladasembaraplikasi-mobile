import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { usePage } from "@/hooks/usePages";
import { Skeleton } from "@/components/ui/skeleton";
import { useVisitTracker } from "@/hooks/useVisitTracker";
import DynamicIcon from "@/components/DynamicIcon";
import MobileLayout from "@/components/MobileLayout";

const colorMap: Record<string, string> = {
  pelayanan: "from-teal to-cyan",
  informasi: "from-cyan to-sky",
  hukum: "from-secondary to-teal",
  umum: "from-primary to-secondary",
};

const LayananDigital = () => {
  useVisitTracker("layanan-digital");
  
  const { services, isLoading: servicesLoading, incrementClick } = useServices();
  const { page, isLoading: pageLoading } = usePage("layanan-digital");

  const handleServiceClick = async (serviceId: string, externalUrl?: string | null) => {
    await incrementClick(serviceId);
    if (externalUrl) {
      window.open(externalUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <MobileLayout title="Layanan Digital">
      {/* Header Section */}
      <div className="gradient-hero px-4 py-6">
        {pageLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 bg-white/20" />
            <Skeleton className="h-4 w-full bg-white/20" />
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-white mb-2">
              {page?.title || "Layanan Digital"}
            </h1>
            {page?.content && (
              <p className="text-white/80 text-sm">
                {page.content}
              </p>
            )}
          </>
        )}
      </div>

      {/* Services Grid */}
      <div className="px-4 py-6">
        {servicesLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="mobile-card">
                <Skeleton className="w-12 h-12 rounded-xl mb-3" />
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Belum ada layanan tersedia</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {services.map((service, index) => {
              const gradientClass = colorMap[service.category || "umum"] || "from-primary to-secondary";

              return (
                <motion.button
                  key={service.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
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
                  {service.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  {service.click_count > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {service.click_count.toLocaleString()} klik
                    </p>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default LayananDigital;
