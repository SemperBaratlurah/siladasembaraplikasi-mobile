import { useState, useMemo } from "react";
import { Plus, Search, ExternalLink, GripVertical, Edit2, Trash2, Link as LinkIcon } from "lucide-react";
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
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AdminMobileLayout from "@/components/AdminMobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMenus, CreateMenuInput, Menu } from "@/hooks/useMenus";
import { usePages } from "@/hooks/usePages";
import { toast } from "sonner";
import DynamicIcon from "@/components/DynamicIcon";
import { motion } from "framer-motion";

const iconOptions = [
  "Link", "Globe", "Home", "FileText", "Calendar", "Image", "Newspaper", "Megaphone", 
  "Info", "Phone", "Mail", "Settings", "User", "Users", "Building2", "CheckCircle", 
  "FileSearch", "Scale", "Landmark", "Shield", "BadgeCheck", "Briefcase", "GraduationCap",
  "Heart", "MapPin", "ExternalLink", "Layers", "LayoutDashboard", "BarChart"
];

interface SortableMenuCardProps {
  menu: Menu & { isChild?: boolean };
  onEdit: (menu: Menu) => void;
  onDelete: (menu: Menu) => void;
}

const SortableMenuCard = ({ menu, onEdit, onDelete }: SortableMenuCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: menu.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mobile-card ${menu.isChild ? "ml-6 border-l-2 border-primary/20" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 p-1 text-muted-foreground touch-none"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <DynamicIcon name={menu.icon || "Link"} className="w-5 h-5 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground text-sm truncate">
              {menu.name}
            </h3>
            {menu.target === "_blank" && (
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={menu.is_active ? "default" : "secondary"} className="text-xs">
              {menu.is_active ? "Aktif" : "Nonaktif"}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {menu.location || "header"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {menu.url || `/${menu.slug}`}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-9"
          onClick={() => onEdit(menu)}
        >
          <Edit2 className="w-4 h-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-destructive hover:text-destructive"
          onClick={() => onDelete(menu)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const AdminMenus = () => {
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

  // Get parent menus for dropdown
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
        icon: menu.icon || "Link",
        display_order: menu.display_order || 0,
        is_active: menu.is_active,
        target: menu.target || "_self",
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
    <AdminMobileLayout title="Kelola Menu">
      {/* Search & Add */}
      <div className="px-4 py-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari menu..."
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
          Tambah Menu
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Seret untuk mengubah urutan
        </p>
      </div>

      {/* Menus List */}
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
        ) : filteredMenus.length === 0 ? (
          <div className="text-center py-12">
            <LinkIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {searchQuery ? "Tidak ada menu ditemukan" : "Belum ada menu"}
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={filteredMenus.map(m => m.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {filteredMenus.map((menu) => (
                  <SortableMenuCard
                    key={menu.id}
                    menu={menu}
                    onEdit={handleOpenDialog}
                    onDelete={(m) => {
                      setDeletingMenu(m);
                      setDeleteDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Dialog Form */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMenu ? "Edit Menu" : "Tambah Menu Baru"}</DialogTitle>
            <DialogDescription>
              Isi detail menu navigasi. Untuk menautkan ke halaman website, pilih dari dropdown.
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
              </div>
            )}
            
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={formData.url || ""}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="/pages/nama-halaman atau https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <DynamicIcon name={formData.icon || "Link"} className="w-4 h-4" />
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
                <Select value={formData.target || "_self"} onValueChange={(value) => setFormData({ ...formData, target: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_self">Tab Sama</SelectItem>
                    <SelectItem value="_blank">Tab Baru</SelectItem>
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
                    <SelectItem value="none">— Tidak ada —</SelectItem>
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
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Aktif (tampil di website)</Label>
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
              Apakah Anda yakin ingin menghapus menu "{deletingMenu?.name}"?
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

export default AdminMenus;
