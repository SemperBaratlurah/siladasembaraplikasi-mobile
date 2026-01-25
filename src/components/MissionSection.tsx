import { motion } from "framer-motion";
import { ChevronRight, Lightbulb, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { usePublicSiteSettings } from "@/hooks/usePublicSiteSettings";

const MissionSection = () => {
  const { settings, isLoading } = usePublicSiteSettings();

  // Don't render if loading
  if (isLoading) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-3/4 mx-auto mb-6" />
            <Skeleton className="h-10 w-48 mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  // Don't render if no vision AND no mission content
  const hasVision = settings.vision && settings.vision.trim();
  const hasMission = settings.mission && settings.mission.length > 0;
  
  if (!hasVision && !hasMission) {
    return null;
  }

  // Get brief summary: first sentence of vision OR first mission item (max 2 sentences)
  const getBriefSummary = () => {
    if (hasVision) {
      // Take first 1-2 sentences from vision
      const sentences = settings.vision!.split(/[.!?]+/).filter(s => s.trim());
      return sentences.slice(0, 2).join(". ").trim() + (sentences.length > 0 ? "." : "");
    }
    if (hasMission && settings.mission!.length > 0) {
      // Take first mission item as summary
      return settings.mission![0];
    }
    return "";
  };

  const summary = getBriefSummary();

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-10"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
            Visi & Misi
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Visi Column */}
          {hasVision && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 sm:p-6 md:p-8 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Visi</h3>
              </div>
              <p className="text-white/90 text-base leading-[1.7] text-left md:text-justify break-words">
                "{settings.vision}"
              </p>
            </motion.div>
          )}

          {/* Misi Column */}
          {hasMission && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-card rounded-2xl p-5 sm:p-6 md:p-8 shadow-xl border"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Misi</h3>
              </div>
              <ul className="space-y-2 sm:space-y-3">
                {settings.mission!.slice(0, 3).map((misi, index) => (
                  <li key={index} className="flex items-start gap-2 sm:gap-3">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground text-base leading-[1.7] text-left md:text-justify break-words">{misi}</span>
                  </li>
                ))}
                {settings.mission!.length > 3 && (
                  <li className="text-sm text-muted-foreground/70 pl-8">
                    +{settings.mission!.length - 3} misi lainnya...
                  </li>
                )}
              </ul>
            </motion.div>
          )}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-8"
        >
          <Link to="/profil">
            <Button 
              className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-6 shadow-button"
            >
              Lihat Profil Lengkap
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default MissionSection;
