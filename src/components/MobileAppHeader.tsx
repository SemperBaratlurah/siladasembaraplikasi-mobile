import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { usePublicSiteSettings } from "@/hooks/usePublicSiteSettings";
import { usePublicSearch, SearchResult } from "@/hooks/usePublicSearch";
import { Skeleton } from "@/components/ui/skeleton";
import logo from "@/assets/kelurahan-icon.png";

interface MobileAppHeaderProps {
  title?: string;
  showSearch?: boolean;
  showBack?: boolean;
}

const MobileAppHeader = ({ title, showSearch = true }: MobileAppHeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { settings, isLoading: siteLoading } = usePublicSiteSettings();
  const { searchTerm, setSearchTerm, results, isSearching, noResults } = usePublicSearch();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

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
    setIsSearchOpen(false);
    setSearchTerm("");
  };

  return (
    <>
      {/* App Bar */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border safe-area-top">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between h-14 px-4">
            {/* Logo & Title */}
            <Link to="/" className="flex items-center gap-2.5">
              <img 
                src={logo} 
                alt="Logo" 
                className="w-8 h-8 object-contain"
              />
              {siteLoading ? (
                <Skeleton className="h-5 w-24 bg-muted" />
              ) : (
                <span className="text-foreground font-bold text-base truncate max-w-[180px]">
                  {title || settings.site_name || "SILADA"}
                </span>
              )}
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {showSearch && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSearchOpen(true)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:bg-muted transition-colors"
                >
                  <Search className="w-4.5 h-4.5" />
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:bg-muted transition-colors relative"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Full Screen Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <div className="max-w-lg mx-auto h-full flex flex-col">
              {/* Search Header */}
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari layanan, berita, atau informasi..."
                    className="pl-10 h-11 bg-muted/50 border-0 rounded-xl"
                  />
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchTerm("");
                  }}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto">
                {isSearching ? (
                  noResults ? (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <Search className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">Tidak ditemukan hasil untuk "{searchTerm}"</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {results.map((result) => (
                        <motion.button
                          key={`${result.type}-${result.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => handleResultClick(result)}
                          className="w-full p-4 flex items-center gap-4 rounded-xl hover:bg-muted transition-colors text-left"
                        >
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Search className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">{result.name}</p>
                            {result.description && (
                              <p className="text-sm text-muted-foreground truncate">{result.description}</p>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Ketik untuk mulai mencari</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileAppHeader;
