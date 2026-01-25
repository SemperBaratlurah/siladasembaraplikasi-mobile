import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicSiteSettings } from "@/hooks/usePublicSiteSettings";

const HeroSection = () => {
  const { settings, isLoading } = usePublicSiteSettings();

  return (
    <section className="gradient-hero relative overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-10 right-1/4 w-32 h-32 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-40 h-40 rounded-full bg-white/5 blur-3xl pointer-events-none" />

      {/* Main container */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-16 md:py-20 lg:py-24">
        {/* Centered content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl xl:max-w-5xl mx-auto text-center"
        >
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full max-w-md mx-auto bg-white/20" />
              <Skeleton className="h-6 w-3/4 max-w-sm mx-auto bg-white/20" />
            </div>
          ) : (
            <>
              {settings.hero_title ? (
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-4">
                  {settings.hero_title}
                </h1>
              ) : settings.site_name ? (
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-4">
                  {settings.site_name}
                </h1>
              ) : (
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white/60 italic mb-4">
                  Judul belum diatur
                </h1>
              )}
              
              {(settings.hero_subtitle || settings.site_tagline) && (
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-white/90 mb-4">
                  {settings.hero_subtitle || settings.site_tagline}
                </h2>
              )}
              
              {settings.hero_description && (
                <p className="text-white/80 text-sm sm:text-base lg:text-lg max-w-xl mx-auto leading-relaxed">
                  {settings.hero_description}
                </p>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
