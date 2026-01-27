import { useState } from "react";
import { Plus, Edit2, Trash2, Search, Calendar, MapPin, Clock } from "lucide-react";
import AdminMobileLayout from "@/components/AdminMobileLayout";
import AdminContentTabs from "@/components/AdminContentTabs";
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
import { usePosts, Post } from "@/hooks/usePosts";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import ImageUpload from "@/components/admin/ImageUpload";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const AdminEvents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);

  const { posts, isLoading, createPost, updatePost, deletePost } = usePosts('agenda');

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    event_date: "",
    event_time: "",
    event_location: "",
    status: "draft" as "draft" | "published",
    image_url: "",
  });

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (post?: Post) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        content: post.content || "",
        excerpt: post.excerpt || "",
        event_date: post.event_date ? format(new Date(post.event_date), "yyyy-MM-dd") : "",
        event_time: post.event_time || "",
        event_location: post.event_location || "",
        status: post.status as "draft" | "published",
        image_url: post.image_url || "",
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        event_date: "",
        event_time: "",
        event_location: "",
        status: "draft",
        image_url: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Judul wajib diisi");
      return;
    }

    try {
      const eventDate = formData.event_date ? new Date(formData.event_date).toISOString() : null;
      
      if (editingPost) {
        await updatePost.mutateAsync({
          id: editingPost.id,
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          event_date: eventDate,
          event_time: formData.event_time,
          event_location: formData.event_location,
          status: formData.status,
          image_url: formData.image_url,
          published_at: formData.status === "published" ? new Date().toISOString() : null,
        });
        toast.success("Agenda berhasil diperbarui");
      } else {
        await createPost.mutateAsync({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          event_date: eventDate,
          event_time: formData.event_time,
          event_location: formData.event_location,
          type: "agenda",
          slug: formData.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
          status: formData.status,
          image_url: formData.image_url,
          published_at: formData.status === "published" ? new Date().toISOString() : null,
        });
        toast.success("Agenda berhasil ditambahkan");
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan");
    }
  };

  const handleDelete = async () => {
    if (!deletingPost) return;
    try {
      await deletePost.mutateAsync(deletingPost.id);
      toast.success("Agenda berhasil dihapus");
      setIsDeleteDialogOpen(false);
      setDeletingPost(null);
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus");
    }
  };

  return (
    <AdminMobileLayout title="Konten">
      <AdminContentTabs />
      
      {/* Search & Add */}
      <div className="px-4 py-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari agenda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-muted/50 border-0 rounded-xl"
          />
        </div>
        <Button 
          className="w-full h-11 rounded-xl"
          onClick={() => handleOpenDialog()}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Agenda
        </Button>
      </div>

      {/* Posts List */}
      <div className="px-4 pb-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="mobile-card flex gap-3">
                <Skeleton className="w-14 h-14 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Belum ada agenda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map((post, index) => {
              const eventDate = post.event_date ? new Date(post.event_date) : null;
              
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="mobile-card"
                >
                  <div className="flex gap-3">
                    {/* Date Badge */}
                    {eventDate ? (
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-primary leading-none">
                          {format(eventDate, "dd")}
                        </span>
                        <span className="text-xs text-primary/80 uppercase">
                          {format(eventDate, "MMM", { locale: id })}
                        </span>
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm line-clamp-1 mb-1">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={post.status === "published" ? "default" : "secondary"}
                          className={`text-xs ${post.status === "published" ? "bg-green-500" : ""}`}
                        >
                          {post.status === "published" ? "Terbit" : "Draft"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {post.event_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.event_time}
                          </span>
                        )}
                        {post.event_location && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3" />
                            {post.event_location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9"
                      onClick={() => handleOpenDialog(post)}
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 text-destructive hover:text-destructive"
                      onClick={() => {
                        setDeletingPost(post);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Edit Agenda" : "Tambah Agenda Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingPost ? "Perbarui informasi agenda" : "Isi form berikut untuk menambahkan agenda baru"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Kegiatan *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Masukkan judul kegiatan"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_date">Tanggal</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_time">Waktu</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="event_time"
                    type="time"
                    value={formData.event_time}
                    onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_location">Lokasi</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="event_location"
                  value={formData.event_location}
                  onChange={(e) => setFormData({ ...formData, event_location: e.target.value })}
                  placeholder="Masukkan lokasi kegiatan"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Ringkasan</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Ringkasan singkat kegiatan"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Deskripsi Lengkap</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Tulis deskripsi lengkap kegiatan..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "draft" | "published") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Terbit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ImageUpload
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              bucket="posts"
              folder="agenda"
              label="Gambar Kegiatan"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={createPost.isPending || updatePost.isPending}
            >
              {createPost.isPending || updatePost.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Agenda?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus agenda "{deletingPost?.title}"?
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
    </AdminMobileLayout>
  );
};

export default AdminEvents;
