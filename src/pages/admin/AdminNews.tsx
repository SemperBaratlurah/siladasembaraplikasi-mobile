import { useState } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
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

const AdminNews = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);

  const { posts, isLoading, createPost, updatePost, deletePost } = usePosts('berita');

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
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
        category: post.category || "",
        status: post.status as "draft" | "published",
        image_url: post.image_url || "",
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        category: "",
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
      if (editingPost) {
        await updatePost.mutateAsync({
          id: editingPost.id,
          ...formData,
          published_at: formData.status === "published" ? new Date().toISOString() : null,
        });
        toast.success("Berita berhasil diperbarui");
      } else {
        await createPost.mutateAsync({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          category: formData.category,
          status: formData.status,
          image_url: formData.image_url,
          type: "berita",
          slug: formData.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
          published_at: formData.status === "published" ? new Date().toISOString() : null,
        });
        toast.success("Berita berhasil ditambahkan");
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
      toast.success("Berita berhasil dihapus");
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
            placeholder="Cari berita..."
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
          Tambah Berita
        </Button>
      </div>

      {/* Posts List */}
      <div className="px-4 pb-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="mobile-card flex gap-3">
                <Skeleton className="w-16 h-16 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Belum ada berita</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="mobile-card"
              >
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    {post.image_url ? (
                      <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                    )}
                  </div>

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
                      {post.category && (
                        <span className="text-xs text-muted-foreground">{post.category}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(post.created_at), "d MMM yyyy", { locale: id })}
                    </p>
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
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Edit Berita" : "Tambah Berita Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingPost ? "Perbarui informasi berita" : "Isi form berikut untuk menambahkan berita baru"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Masukkan judul berita"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Ringkasan</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Ringkasan singkat berita"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Konten</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Tulis konten berita..."
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Contoh: Pemerintahan"
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
            </div>

            <ImageUpload
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              bucket="posts"
              folder="berita"
              label="Gambar Berita"
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
            <AlertDialogTitle>Hapus Berita?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus berita "{deletingPost?.title}"?
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

export default AdminNews;
