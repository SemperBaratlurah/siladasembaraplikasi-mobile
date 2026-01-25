import { useState } from "react";
import { Plus, Edit2, Trash2, Search, Calendar, MapPin, Clock } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const AdminEvents = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const openDeleteDialog = (post: Post) => {
    setDeletingPost(post);
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
              <h1 className="text-2xl font-bold text-foreground">Agenda & Kegiatan</h1>
              <p className="text-muted-foreground text-sm">Admin &gt; Agenda & Kegiatan</p>
            </div>
            <Button 
              className="bg-secondary hover:bg-secondary/90 text-white"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Agenda
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari agenda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="bg-card rounded-xl border shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul Kegiatan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : filteredPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Belum ada agenda
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {post.title}
                      </TableCell>
                      <TableCell>
                        {post.event_date 
                          ? format(new Date(post.event_date), "d MMM yyyy", { locale: id })
                          : "-"}
                      </TableCell>
                      <TableCell>{post.event_location || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={post.status === "published" ? "default" : "secondary"}
                          className={post.status === "published" 
                            ? "bg-green-500 hover:bg-green-600" 
                            : ""}
                        >
                          {post.status === "published" ? "Terbit" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(post)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => openDeleteDialog(post)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Edit Agenda" : "Tambah Agenda Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingPost
                ? "Perbarui informasi agenda"
                : "Isi form berikut untuk menambahkan agenda baru"}
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
              className="bg-secondary hover:bg-secondary/90"
            >
              {createPost.isPending || updatePost.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Agenda?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus agenda "{deletingPost?.title}"? Tindakan ini tidak dapat dibatalkan.
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

export default AdminEvents;
