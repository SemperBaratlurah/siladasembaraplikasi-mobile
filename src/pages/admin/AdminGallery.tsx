import { useState } from "react";
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, Star } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useGallery, GalleryItem } from "@/hooks/useGallery";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import ImageUpload from "@/components/admin/ImageUpload";

const categories = [
  { value: "kegiatan", label: "Kegiatan" },
  { value: "pembangunan", label: "Pembangunan" },
  { value: "sosial", label: "Sosial" },
  { value: "budaya", label: "Budaya" },
  { value: "lainnya", label: "Lainnya" },
];

const AdminGallery = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<GalleryItem | null>(null);

  const { gallery, isLoading, createGalleryItem, updateGalleryItem, deleteGalleryItem } = useGallery();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "kegiatan",
    image_url: "",
    is_featured: false,
    event_date: "",
  });

  const filteredGallery = gallery.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (item?: GalleryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description || "",
        category: item.category || "kegiatan",
        image_url: item.image_url,
        is_featured: item.is_featured || false,
        event_date: item.event_date || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: "",
        description: "",
        category: "kegiatan",
        image_url: "",
        is_featured: false,
        event_date: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Judul wajib diisi");
      return;
    }

    if (!formData.image_url.trim()) {
      toast.error("Gambar wajib diunggah");
      return;
    }

    try {
      if (editingItem) {
        await updateGalleryItem.mutateAsync({
          id: editingItem.id,
          ...formData,
        });
        toast.success("Galeri berhasil diperbarui");
      } else {
        await createGalleryItem.mutateAsync({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          image_url: formData.image_url,
          is_featured: formData.is_featured,
          event_date: formData.event_date || null,
          display_order: 0,
        });
        toast.success("Galeri berhasil ditambahkan");
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan");
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      await deleteGalleryItem.mutateAsync(deletingItem.id);
      toast.success("Galeri berhasil dihapus");
      setIsDeleteDialogOpen(false);
      setDeletingItem(null);
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus");
    }
  };

  const openDeleteDialog = (item: GalleryItem) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Galeri</h1>
              <p className="text-muted-foreground text-sm">Admin &gt; Galeri</p>
            </div>
            <Button 
              className="bg-secondary hover:bg-secondary/90 text-white"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Foto
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari galeri..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Gallery Grid */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Memuat data...
            </div>
          ) : filteredGallery.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada foto di galeri</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredGallery.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-card rounded-xl border shadow-card overflow-hidden"
                >
                  <div className="aspect-square">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white font-medium text-sm truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {categories.find(c => c.value === item.category)?.label || item.category}
                        </Badge>
                        {item.is_featured && (
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => handleOpenDialog(item)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => openDeleteDialog(item)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Foto" : "Tambah Foto Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Perbarui informasi foto"
                : "Isi form berikut untuk menambahkan foto baru"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Image Upload */}
            <ImageUpload
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              bucket="gallery"
              folder="uploads"
              label="Gambar"
              maxSizeMB={5}
            />

            <div className="space-y-2">
              <Label htmlFor="title">Judul *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Masukkan judul foto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi foto"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_date">Tanggal Kegiatan</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_featured">Foto Unggulan</Label>
                <p className="text-xs text-muted-foreground">
                  Tampilkan di halaman utama
                </p>
              </div>
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={createGalleryItem.isPending || updateGalleryItem.isPending}
              className="bg-secondary hover:bg-secondary/90"
            >
              {createGalleryItem.isPending || updateGalleryItem.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Foto?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus foto "{deletingItem?.title}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminGallery;
