import { useState } from "react";
import { motion } from "framer-motion";
import { ZoomIn, Calendar, Grid, List } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Lightbox from "@/components/Lightbox";
import { useGallery } from "@/hooks/useGallery";
import { Skeleton } from "@/components/ui/skeleton";
import { useVisitTracker } from "@/hooks/useVisitTracker";

const galleryCategories = [
  { id: "all", label: "Semua" },
  { id: "kegiatan", label: "Kegiatan" },
  { id: "pembangunan", label: "Pembangunan" },
  { id: "pelayanan", label: "Pelayanan" },
  { id: "sosial", label: "Sosial" },
];

const Gallery = () => {
  useVisitTracker("galeri");
  
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("grid");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { gallery, isLoading } = useGallery(activeCategory);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            >
              Galeri Kegiatan
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto"
            >
              Dokumentasi program dan kegiatan Kelurahan Semper Barat
            </motion.p>
          </div>
        </section>

        {/* Gallery Content */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            {/* Filters and View Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-2">
                {galleryCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeCategory === category.id
                        ? "bg-secondary text-white shadow-button"
                        : "bg-white text-muted-foreground hover:bg-muted border border-border"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-secondary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("masonry")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "masonry"
                      ? "bg-white shadow-sm text-secondary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Gallery Grid */}
            {isLoading ? (
              <div className={`grid gap-4 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 space-y-4"
              }`}>
                {[...Array(12)].map((_, i) => (
                  <Skeleton
                    key={i}
                    className={`rounded-xl ${
                      viewMode === "grid"
                        ? "aspect-[4/3]"
                        : `h-${[48, 64, 56, 72, 52, 60][i % 6]}`
                    }`}
                  />
                ))}
              </div>
            ) : gallery.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <ZoomIn className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Belum Ada Foto
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Belum ada foto dalam kategori "{galleryCategories.find(c => c.id === activeCategory)?.label}". 
                  Silakan coba kategori lain.
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {gallery.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer shadow-card hover:shadow-hover transition-all bg-muted"
                    onClick={() => openLightbox(index)}
                  >
                    <img
                      src={item.image_url}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <ZoomIn className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-semibold text-sm line-clamp-2">
                          {item.title}
                        </h3>
                        {item.event_date && (
                          <p className="text-white/70 text-xs mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(item.event_date), "d MMMM yyyy", { locale: id })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Category badge */}
                    {item.category && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full capitalize">
                        {item.category}
                      </div>
                    )}

                    {/* Featured badge */}
                    {item.is_featured && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-secondary text-white text-xs rounded-full">
                        Featured
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                {gallery.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className="group relative rounded-xl overflow-hidden cursor-pointer shadow-card hover:shadow-hover transition-all mb-4 break-inside-avoid"
                    onClick={() => openLightbox(index)}
                  >
                    <img
                      src={item.image_url}
                      alt={item.title}
                      loading="lazy"
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-semibold line-clamp-2">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-white/70 text-sm mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        {item.event_date && (
                          <p className="text-white/60 text-xs mt-2 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(item.event_date), "d MMMM yyyy", { locale: id })}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Lightbox */}
      <Lightbox
        images={gallery}
        initialIndex={selectedIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
};

export default Gallery;
