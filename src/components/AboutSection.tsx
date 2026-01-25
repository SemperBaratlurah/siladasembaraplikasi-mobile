import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, Users, Eye, HandHeart, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicSiteSettings } from "@/hooks/usePublicSiteSettings";
import { Link } from "react-router-dom";

const AboutSection = () => {
  const { settings, isLoading } = usePublicSiteSettings();

  const hasContent = settings.about_title || settings.about_description || settings.site_name;

  if (isLoading) {
    return (
      <section id="informasi" className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Skeleton className="h-10 w-3/4 mx-auto mb-6" />
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-5/6 mx-auto mb-4" />
            <Skeleton className="h-12 w-40 mx-auto mt-8" />
          </div>
        </div>
      </section>
    );
  }

  if (!hasContent) {
    return null;
  }

  return (
    <section id="informasi" className="w-full py-16 md:py-20 bg-muted/30">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Full-width Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          {settings.about_title ? (
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6 text-center">
              {settings.about_title}
            </h2>
          ) : settings.site_name ? (
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6 text-center">
              Tentang <span className="text-secondary">{settings.site_name}</span>
            </h2>
          ) : null}
          
          {settings.about_description && (
            <div className="text-muted-foreground mb-6 md:mb-8 space-y-4 max-w-none px-2 sm:px-0">
              {settings.about_description
                .split(/\\n\\n|\n\n/)
                .filter((p: string) => p.trim())
                .map((paragraph: string, index: number) => (
                  <p key={index} className="text-base md:text-lg leading-[1.7] text-left md:text-justify break-words">
                    {paragraph.replace(/\\n/g, ' ').trim()}
                  </p>
                ))}
            </div>
          )}
          
          <div className="text-center">
            <Link to="/profil">
              <Button className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-6 shadow-button">
                Selengkapnya
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Feature Icons Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-10 md:mt-12 max-w-4xl mx-auto"
        >
          <div className="text-center p-3 sm:p-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Users className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground text-xs sm:text-sm">Pelayanan Publik</h4>
          </div>
          <div className="text-center p-3 sm:p-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Eye className="w-7 h-7 sm:w-8 sm:h-8 text-secondary" />
            </div>
            <h4 className="font-semibold text-foreground text-xs sm:text-sm">Transparan</h4>
          </div>
          <div className="text-center p-3 sm:p-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <HandHeart className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500" />
            </div>
            <h4 className="font-semibold text-foreground text-xs sm:text-sm">Partisipatif</h4>
          </div>
          <div className="text-center p-3 sm:p-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500" />
            </div>
            <h4 className="font-semibold text-foreground text-xs sm:text-sm">Akuntabel</h4>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
