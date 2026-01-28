import { motion } from "framer-motion";
import { ExternalLink, ChevronRight } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { usePage } from "@/hooks/usePages";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import DynamicIcon from "@/components/DynamicIcon";

const colorMap: Record<string, string> = {
  pelayanan: "bg-teal",
  informasi: "bg-cyan",
  hukum: "bg-secondary",
  umum: "bg-primary",
};

const MAX_PREVIEW_SERVICES = 6;

const ServicesSection = () => {
  const { services, isLoading, incrementClick } = useServices();
  const { page } = usePage("layanan-digital");
  const navigate = useNavigate();
  
  // Limit to preview count for homepage
  const previewServices = services.slice(0, MAX_PREVIEW_SERVICES);
  const hasMoreServices = services.length > MAX_PREVIEW_SERVICES;

  const handleServiceClick = async (serviceId: string, serviceName: string, externalUrl?: string | null) => {
    await incrementClick(serviceId);
    if (externalUrl) {
      // Open in in-app WebView instead of external browser
      navigate(`/webview?url=${encodeURIComponent(externalUrl)}&title=${encodeURIComponent(serviceName)}`);
    }
  };

  return (
    <div id="layanan">
      {/* Section Title - from CMS or default */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
          {page?.title || "Layanan Digital Kelurahan Semper Barat"}
        </h2>
        {page?.content && (
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            {page.content}
          </p>
        )}
      </motion.div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-card">
              <div className="flex items-start gap-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : previewServices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Belum ada layanan tersedia</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 md:gap-6">
            {previewServices.map((service, index) => {
              const bgColor = colorMap[service.category || "umum"] || "bg-secondary";

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="card-service group cursor-pointer"
                  onClick={() => handleServiceClick(service.id, service.name, service.external_url)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                    >
                      <DynamicIcon name={service.icon} className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-foreground text-lg mb-1">
                          {service.name}
                        </h3>
                        {service.external_url && (
                          <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {service.description}
                      </p>
                      {service.click_count > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {service.click_count.toLocaleString()} klik
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* View All Button */}
          {hasMoreServices && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-center mt-8"
            >
              <Link to="/layanan-digital">
                <Button className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-6 shadow-button">
                  Lihat Semua Layanan
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default ServicesSection;

