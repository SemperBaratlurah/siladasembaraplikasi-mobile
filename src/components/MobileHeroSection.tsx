import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicSiteSettings } from "@/hooks/usePublicSiteSettings";
import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { usePublicSearch, SearchResult } from "@/hooks/usePublicSearch";

const MobileHeroSection = () => {
  const { settings, isLoading } = usePublicSiteSettings();
  const { searchTerm, setSearchTerm, results, isSearching, noResults } = usePublicSearch();
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "service" && result.url) {
      window.open(result.url, "_blank");
    } else if (result.url) {
      if (result.url.startsWith("http")) {
        window.open(result.url, "_blank");
      } else {
        navigate(result.url);
      }
    }
    setSearchTerm("");
    setIsFocused(false);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Gradient Background */}
      <div className="gradient-hero px-4 pt-6 pb-8">
        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute bottom-4 left-4 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10"
        >
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-3/4 bg-white/20" />
              <Skeleton className="h-5 w-2/3 bg-white/20" />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white leading-tight mb-2">
                {settings.hero_title || settings.site_name || "Selamat Datang"}
              </h1>
              {(settings.hero_subtitle || settings.site_tagline) && (
                <p className="text-white/80 text-sm">
                  {settings.hero_subtitle || settings.site_tagline}
                </p>
              )}
            </>
          )}

          {/* Search Bar */}
          <div className="mt-5 relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                placeholder="Cari layanan, berita, informasi..."
                className="pl-12 h-12 bg-white border-0 rounded-2xl shadow-lg text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Quick Search Results */}
            {isFocused && isSearching && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl shadow-xl border border-border overflow-hidden z-20"
              >
                {noResults ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Tidak ditemukan
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {results.slice(0, 5).map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className="w-full p-3 flex items-center gap-3 hover:bg-muted transition-colors text-left border-b border-border last:border-0"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Search className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{result.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{result.type}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MobileHeroSection;
