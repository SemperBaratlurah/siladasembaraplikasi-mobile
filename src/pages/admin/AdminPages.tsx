import { useState } from "react";
import { Plus, Edit2, Trash2, Search, FileText, Eye } from "lucide-react";
import AdminMobileLayout from "@/components/AdminMobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePages, usePagesMutation, Page } from "@/hooks/usePages";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { motion } from "framer-motion";

const AdminPages = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [deletingPage, setDeletingPage] = useState<Page | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    status: "draft" as "draft" | "published" | "archived",
  });

  const { pages, isLoading } = usePages();
  const { createPage, updatePage, deletePage } = usePagesMutation();

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (page?: Page) => {
    if (page) {
      setEditingPage(page);
      setFormData({
        title: page.title,
        slug: page.slug,
        content: page.content || "",
        status: page.status as "draft" | "published" | "archived",
      });
    } else {
      setEditingPage(null);
      setFormData({
        title: "",
        slug: "",
        content: "",
        status: "draft",
      });
    }
    setDialogOpen(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Judul halaman wajib diisi");
      return;
    }

    try {
      if (editingPage) {
        await updatePage.mutateAsync({
          id: editingPage.id,
          ...formData,
        });
        toast.success("Halaman berhasil diperbarui");
      } else {
        await createPage.mutateAsync({
          ...formData,
          slug: formData.slug || generateSlug(formData.title),
        });
        toast.success("Halaman berhasil ditambahkan");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error("Gagal menyimpan halaman");
    }
  };

  const handleDelete = async () => {
    if (!deletingPage) return;
    try {
      await deletePage.mutateAsync(deletingPage.id);
      toast.success("Halaman berhasil dihapus");
      setDeleteDialogOpen(false);
      setDeletingPage(null);
    } catch (error) {
      toast.error("Gagal menghapus halaman");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500 text-white text-xs">Terbit</Badge>;
      case "draft":
        return <Badge variant="secondary" className="text-xs">Draft</Badge>;
      case "archived":
        return <Badge variant="outline" className="text-xs">Arsip</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  return (
    <AdminMobileLayout title="Halaman Website">
      {/* Search & Add */}
      <div className="px-4 py-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari halaman..."
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
          Tambah Halaman
        </Button>
      </div>

      {/* Pages List */}
      <div className="px-4 pb-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="mobile-card flex gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {searchQuery ? "Tidak ada halaman ditemukan" : "Belum ada halaman"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPages.map((page, index) => (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="mobile-card"
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-1 mb-1">
                      {page.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(page.status)}
                      <span className="text-xs text-muted-foreground">/{page.slug}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(page.updated_at), "d MMM yyyy", { locale: id })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  {page.status === "published" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9"
                      asChild
                    >
                      <a href={`/pages/${page.slug}`} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4 mr-1" />
                        Lihat
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9"
                    onClick={() => handleOpenDialog(page)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-destructive hover:text-destructive"
                    onClick={() => {
                      setDeletingPage(page);
                      setDeleteDialogOpen(true);
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

      {/* Dialog Form */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPage ? "Edit Halaman" : "Tambah Halaman Baru"}</DialogTitle>
            <DialogDescription>
              {editingPage ? "Perbarui informasi halaman" : "Isi form berikut untuk menambahkan halaman baru"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Judul Halaman *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) })}
                placeholder="Contoh: Tentang Kami"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="tentang-kami"
              />
            </div>
            <div className="space-y-2">
              <Label>Konten</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Tulis konten halaman di sini..."
                rows={10}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: "draft" | "published" | "archived") => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Terbit</SelectItem>
                  <SelectItem value="archived">Arsip</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={createPage.isPending || updatePage.isPending}>
              {createPage.isPending || updatePage.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Halaman</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus halaman "{deletingPage?.title}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminMobileLayout>
  );
};

export default AdminPages;
