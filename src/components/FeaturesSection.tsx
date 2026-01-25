import { motion } from "framer-motion";
import { BarChart3, Layers, ShieldCheck, LucideIcon, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Feature {
  icon: string;
  title: string;
  description: string;
  color?: string;
  bgColor?: string;
}

// Icon mapping for features from database
const iconMap: Record<string, LucideIcon> = {
  BarChart3,
  Layers,
  ShieldCheck,
};

const colorMap: Record<string, { color: string; bgColor: string }> = {
  teal: { color: "text-teal", bgColor: "bg-teal/10" },
  cyan: { color: "text-cyan", bgColor: "bg-cyan/10" },
  secondary: { color: "text-secondary", bgColor: "bg-secondary/10" },
  primary: { color: "text-primary", bgColor: "bg-primary/10" },
};

const FeaturesSection = () => {
  const queryClient = useQueryClient();

  const { data: features, isLoading } = useQuery({
    queryKey: ["public-features"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .eq("key", "features");

      if (error) throw error;

      // Get features from site_settings
      const featuresData = data?.find((item) => item.key === "features");
      if (featuresData?.value && Array.isArray(featuresData.value)) {
        return featuresData.value as unknown as Feature[];
      }
      return [] as Feature[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("public-features-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_settings",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["public-features"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Loading state
  if (isLoading) {
    return (
      <div className="py-12 md:py-16 bg-gradient-to-b from-background to-sky-light/30 -mx-4 px-4 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-card">
              <Skeleton className="w-14 h-14 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state - no features configured
  if (!features || features.length === 0) {
    return null; // Don't render section if no features
  }

  return (
    <div className="py-12 md:py-16 bg-gradient-to-b from-background to-sky-light/30 rounded-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {features.map((feature, index) => {
          const IconComponent = iconMap[feature.icon] || BarChart3;
          const colors = colorMap[feature.color || "secondary"] || colorMap.secondary;

          return (
            <motion.div
              key={feature.title || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-card hover:shadow-hover transition-shadow"
            >
              <div
                className={`w-14 h-14 rounded-full ${colors.bgColor} flex items-center justify-center flex-shrink-0`}
              >
                <IconComponent className={`w-7 h-7 ${colors.color}`} />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturesSection;
