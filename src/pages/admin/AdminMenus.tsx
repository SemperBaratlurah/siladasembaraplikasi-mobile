import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useMenus, CreateMenuInput, Menu } from "@/hooks/useMenus";
import { usePages } from "@/hooks/usePages";
import { toast } from "sonner";
import DraggableMenuRow from "@/components/admin/DraggableMenuRow";
import DynamicIcon from "@/components/DynamicIcon";

const iconOptions = [
  "Link", "Globe", "Home", "FileText", "Calendar", "Image", "Newspaper", "Megaphone", 
  "Info", "Phone", "Mail", "Settings", "User", "Users", "Building2", "CheckCircle", 
  "FileSearch", "Scale", "Landmark", "Shield", "BadgeCheck", "Briefcase", "GraduationCap",
  "Heart", "MapPin", "ExternalLink", "Layers", "LayoutDashboard", "BarChart"
];

const AdminMenus = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [deletingMenu, setDeletingMenu] = useState<Menu | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<CreateMenuInput>({
    name: "",
    slug: "",
    url: "",
    icon: "Link",
    display_order: 0,
    is_active: true,
    target: "_self",
    location: "header",
    parent_id: null,
  });

  const { menus, isLoading, createMenu, updateMenu, deleteMenu } = useMenus();
  const { pages: availablePages } = usePages("published");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get parent menus (menus without parent_id) for dropdown
  const parentMenus = useMemo(() => 
    menus.filter(m => !m.parent_id && m.location === "header"), 
    [menus]
  );

  // Organize menus: parents first, then children under each parent
  const organizedMenus = useMemo(() => {
    const result: Array<Menu & { isChild?: boolean }> = [];
    const parents = menus.filter(m => !m.parent_id);
    const children = menus.filter(m => m.parent_id);
    
    parents.forEach(parent => {
      result.push(parent);
      children
        .filter(child => child.parent_id === parent.id)
        .forEach(child => result.push({ ...child, isChild: true }));
    });
    
    // Add orphan children (children whose parent doesn't exist)
    children
      .filter(child => !parents.find(p => p.id === child.parent_id))
      .forEach(child => result.push(child));
    
    return result;
  }, [menus]);

  const filteredMenus = organizedMenus.filter(menu =>
    menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    menu.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (menu?: Menu) => {
    if (menu) {
      setEditingMenu(menu);
      setFormData({
        name: menu.name,
        slug: menu.slug,
        url: menu.url || "",
        icon: menu.icon,
        display_order: menu.display_order,
        is_active: menu.is_active,
        target: menu.target,
        parent_id: menu.parent_id,
        location: menu.location || "header",
      });
    } else {
      setEditingMenu(null);
      setFormData({
        name: "",
        slug: "",
        url: "",
        icon: "Link",
        display_order: menus.length,
        is_active: true,
        target: "_self",
        location: "header",
        parent_id: null,
      });
    }
    setDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Nama menu wajib diisi");
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        parent_id: formData.parent_id === "none" ? null : formData.parent_id,
      };

      if (editingMenu) {
        await updateMenu.mutateAsync({
          id: editingMenu.id,
          ...dataToSave,
        });
        toast.success("Menu berhasil diperbarui");
      } else {
        await createMenu.mutateAsync({
          ...dataToSave,
          slug: formData.slug || generateSlug(formData.name),
        });
        toast.success("Menu berhasil ditambahkan");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error("Gagal menyimpan menu");
    }
  };

  const handleDelete = async () => {
    if (!deletingMenu) return;
    try {
      await deleteMenu.mutateAsync(deletingMenu.id);
      toast.success("Menu berhasil dihapus");
      setDeleteDialogOpen(false);
      setDeletingMenu(null);
    } catch (error) {
      toast.error("Gagal menghapus menu");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = filteredMenus.findIndex(m => m.id === active.id);
    const newIndex = filteredMenus.findIndex(m => m.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(filteredMenus, oldIndex, newIndex);
    
    // Update display_order for affected menus
    try {
      await Promise.all(
        newOrder.map((menu, index) => 
          updateMenu.mutateAsync({ id: menu.id, display_order: index })
        )
      );
      toast.success("Urutan menu berhasil diperbarui");
    } catch (error) {
      toast.error("Gagal memperbarui urutan menu");
    }
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Kelola Menu</h1>
              <p className="text-muted-foreground text-sm">Admin &gt; Kelola Menu • Drag untuk mengubah urutan</p>
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="w-4 h-4" /> Tambah Menu
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Cari menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Nama Menu</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <td><Skeleton className="h-4 w-8" /></td>
                        <td><Skeleton className="h-4 w-40" /></td>
                        <td><Skeleton className="h-4 w-24" /></td>
                        <td><Skeleton className="h-4 w-20" /></td>
                        <td><Skeleton className="h-4 w-32" /></td>
                        <td><Skeleton className="h-4 w-16" /></td>
                        <td><Skeleton className="h-4 w-20" /></td>
                      </TableRow>
                    ))
                  ) : filteredMenus.length === 0 ? (
                    <TableRow>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? "Tidak ada menu yang ditemukan" : "Belum ada menu. Klik tombol Tambah Menu untuk membuat menu baru."}
                      </td>
                    </TableRow>
                  ) : (
                    <SortableContext items={filteredMenus.map(m => m.id)} strategy={verticalListSortingStrategy}>
                      {filteredMenus.map((menu) => (
                        <DraggableMenuRow
                          key={menu.id}
                          menu={menu}
                          isChild={'isChild' in menu && menu.isChild}
                          onEdit={handleOpenDialog}
                          onDelete={(m) => { setDeletingMenu(m); setDeleteDialogOpen(true); }}
                        />
                      ))}
                    </SortableContext>
                  )}
                </TableBody>
              </Table>
            </DndContext>
          </div>
        </main>
      </div>

      {/* Dialog Form */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMenu ? "Edit Menu" : "Tambah Menu Baru"}</DialogTitle>
            <DialogDescription>
              Isi detail menu navigasi. Untuk menautkan ke halaman website, pilih dari dropdown "Pilih Halaman".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Menu *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })}
                placeholder="Contoh: Beranda"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="beranda"
              />
            </div>
            
            {/* Page selector for easy linking */}
            {availablePages.length > 0 && (
              <div className="space-y-2">
                <Label>Pilih Halaman (opsional)</Label>
                <Select 
                  value=""
                  onValueChange={(slug) => {
                    const page = availablePages.find(p => p.slug === slug);
                    if (page) {
                      setFormData({ 
                        ...formData, 
                        url: `/pages/${slug}`,
                        name: formData.name || page.title,
                        slug: formData.slug || generateSlug(page.title)
                      });
                      toast.success(`URL diatur ke /pages/${slug}`);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="— Pilih halaman untuk ditautkan —" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePages.map((page) => (
                      <SelectItem key={page.id} value={page.slug}>
                        {page.title} (/pages/{page.slug})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Pilih halaman untuk otomatis mengisi URL dengan benar
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={formData.url || ""}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="/pages/nama-halaman atau https://..."
              />
              <p className="text-xs text-muted-foreground">
                Format: /pages/slug untuk halaman internal, atau URL lengkap untuk link eksternal
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <DynamicIcon name={formData.icon} className="w-4 h-4" />
                        <span>{formData.icon}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        <div className="flex items-center gap-2">
                          <DynamicIcon name={icon} className="w-4 h-4" />
                          <span>{icon}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target</Label>
                <Select value={formData.target} onValueChange={(value) => setFormData({ ...formData, target: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_self">Buka di Tab Sama</SelectItem>
                    <SelectItem value="_blank">Buka di Tab Baru</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lokasi Tampil</Label>
                <Select value={formData.location || "header"} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="homepage">Homepage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Parent Menu</Label>
                <Select 
                  value={formData.parent_id || "none"} 
                  onValueChange={(value) => setFormData({ ...formData, parent_id: value === "none" ? null : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih parent..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Tidak ada (Menu Utama) —</SelectItem>
                    {parentMenus
                      .filter(p => p.id !== editingMenu?.id)
                      .map((parent) => (
                        <SelectItem key={parent.id} value={parent.id}>
                          {parent.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Urutan Tampil</Label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={createMenu.isPending || updateMenu.isPending}>
              {createMenu.isPending || updateMenu.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Menu</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus menu "{deletingMenu?.name}"? Tindakan ini tidak dapat dibatalkan.
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
    </div>
  );
};

export default AdminMenus;