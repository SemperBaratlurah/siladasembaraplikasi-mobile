import { useState } from "react";
import { motion } from "framer-motion";
import { ZoomIn, Calendar } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useGallery, GalleryItem } from "@/hooks/useGallery";
import Lightbox from "./Lightbox";
import { Skeleton } from "@/components/ui/skeleton";

const galleryCategories = [
  { id: "all", label: "Semua" },
  { id: "kegiatan", label: "Kegiatan" },
  { id: "pembangunan", label: "Pembangunan" },
  { id: "pelayanan", label: "Pelayanan" },
  { id: "sosial", label: "Sosial" },
];

const GallerySection = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { gallery, isLoading } = useGallery(activeCategory);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  return (
    <section id="galeri" className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            Galeri{" "}
            <span className="text-secondary">Kegiatan</span>
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Dokumentasi berbagai kegiatan dan program Kelurahan Semper Barat
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {galleryCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category.id
                  ? "bg-secondary text-white shadow-button"
                  : "bg-white text-muted-foreground hover:bg-muted"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
            ))}
          </div>
        ) : gallery.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Belum ada foto dalam kategori ini
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {gallery.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer shadow-card hover:shadow-hover transition-all"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={item.image_url}
                  alt={item.title}
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
                        {format(new Date(item.event_date), "d MMM yyyy", { locale: id })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Featured badge */}
                {item.is_featured && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-secondary text-white text-xs rounded-full">
                    Featured
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        <Lightbox
          images={gallery}
          initialIndex={selectedIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      </div>
    </section>
  );
};

export default GallerySection;
