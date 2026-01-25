import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { usePage } from "@/hooks/usePages";
import { Skeleton } from "@/components/ui/skeleton";
import { useVisitTracker } from "@/hooks/useVisitTracker";
import DynamicIcon from "@/components/DynamicIcon";

const colorMap: Record<string, string> = {
  pelayanan: "bg-teal",
  informasi: "bg-cyan",
  hukum: "bg-secondary",
  umum: "bg-primary",
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="gradient-hero py-12 md:py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center text-white"
            >
              {pageLoading ? (
                <>
                  <Skeleton className="h-10 w-64 mx-auto mb-4 bg-white/20" />
                  <Skeleton className="h-6 w-96 mx-auto bg-white/20" />
                </>
              ) : (
                <>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                    {page?.title || "Layanan Digital"}
                  </h1>
                  {page?.content && (
                    <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                      {page.content}
                    </p>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            {servicesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
            ) : services.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Belum ada layanan tersedia</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {services.map((service, index) => {
                  const bgColor = colorMap[service.category || "umum"] || "bg-secondary";

                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="card-service group cursor-pointer"
                      onClick={() => handleServiceClick(service.id, service.external_url)}
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
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LayananDigital;
