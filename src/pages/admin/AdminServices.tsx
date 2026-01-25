import { useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminServices, CreateServiceInput, Service } from "@/hooks/useAdminServices";
import { toast } from "sonner";
import DraggableServiceRow from "@/components/admin/DraggableServiceRow";
import DynamicIcon, { availableIcons } from "@/components/DynamicIcon";

const iconOptions = [
  "Globe", "FileText", "ClipboardList", "UserCheck", "Building2", "FileSearch", 
  "Scale", "Heart", "GraduationCap", "Briefcase", "Home", "Car", "Landmark", 
  "Shield", "BadgeCheck", "Mail", "Phone", "MapPin", "Calendar", "Settings", 
  "CheckCircle", "AlertCircle", "Info", "HelpCircle", "Users", "Newspaper",
  "Megaphone", "HandHelping", "IdCard", "Coins", "Handshake", "Construction"
];

const categoryOptions = [
  { value: "umum", label: "Umum" },
  { value: "kependudukan", label: "Kependudukan" },
  { value: "perizinan", label: "Perizinan" },
  { value: "sosial", label: "Sosial" },
  { value: "kesehatan", label: "Kesehatan" },
  { value: "pendidikan", label: "Pendidikan" },
  { value: "lainnya", label: "Lainnya" },
];

const AdminServices = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<CreateServiceInput>({
    name: "",
    description: "",
    icon: "FileText",
    category: "umum",
    is_active: true,
    external_url: "",
    display_order: 0,
  });

  const { services, isLoading, createService, updateService, deleteService } = useAdminServices();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (service.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || "",
        icon: service.icon,
        category: service.category || "umum",
        is_active: service.is_active,
        external_url: service.external_url || "",
        display_order: service.display_order || 0,
      });
    } else {
      setEditingService(null);
      setFormData({
        name: "",
        description: "",
        icon: "FileText",
        category: "umum",
        is_active: true,
        external_url: "",
        display_order: services.length,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Nama layanan wajib diisi");
      return;
    }

    try {
      if (editingService) {
        await updateService.mutateAsync({
          id: editingService.id,
          ...formData,
        });
        toast.success("Layanan berhasil diperbarui");
      } else {
        await createService.mutateAsync(formData);
        toast.success("Layanan berhasil ditambahkan");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error("Gagal menyimpan layanan");
    }
  };

  const handleDelete = async () => {
    if (!deletingService) return;
    try {
      await deleteService.mutateAsync(deletingService.id);
      toast.success("Layanan berhasil dihapus");
      setDeleteDialogOpen(false);
      setDeletingService(null);
    } catch (error) {
      toast.error("Gagal menghapus layanan");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = filteredServices.findIndex(s => s.id === active.id);
    const newIndex = filteredServices.findIndex(s => s.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(filteredServices, oldIndex, newIndex);
    
    try {
      await Promise.all(
        newOrder.map((service, index) => 
          updateService.mutateAsync({ id: service.id, display_order: index })
        )
      );
      toast.success("Urutan layanan berhasil diperbarui");
    } catch (error) {
      toast.error("Gagal memperbarui urutan layanan");
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
              <h1 className="text-2xl font-bold text-foreground">Layanan Digital</h1>
              <p className="text-muted-foreground text-sm">Admin &gt; Layanan Digital • Drag untuk mengubah urutan</p>
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="w-4 h-4" /> Tambah Layanan
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Cari layanan..."
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
                    <TableHead>Nama Layanan</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Klik</TableHead>
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
                        <td><Skeleton className="h-4 w-32" /></td>
                        <td><Skeleton className="h-4 w-12" /></td>
                        <td><Skeleton className="h-4 w-16" /></td>
                        <td><Skeleton className="h-4 w-20" /></td>
                      </TableRow>
                    ))
                  ) : filteredServices.length === 0 ? (
                    <TableRow>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? "Tidak ada layanan yang ditemukan" : "Belum ada layanan. Klik tombol Tambah Layanan untuk membuat layanan baru."}
                      </td>
                    </TableRow>
                  ) : (
                    <SortableContext items={filteredServices.map(s => s.id)} strategy={verticalListSortingStrategy}>
                      {filteredServices.map((service) => (
                        <DraggableServiceRow
                          key={service.id}
                          service={service}
                          onEdit={handleOpenDialog}
                          onDelete={(s) => { setDeletingService(s); setDeleteDialogOpen(true); }}
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
            <DialogTitle>{editingService ? "Edit Layanan" : "Tambah Layanan Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Layanan *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Surat Keterangan Domisili"
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi singkat layanan..."
                rows={3}
              />
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
                <Label>Kategori</Label>
                <Select value={formData.category || "umum"} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL Eksternal</Label>
              <Input
                value={formData.external_url || ""}
                onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                placeholder="https://example.com/layanan"
              />
              <p className="text-xs text-muted-foreground">Kosongkan jika layanan adalah halaman internal</p>
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
              <Label>Aktif (tampil di website)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={createService.isPending || updateService.isPending}>
              {createService.isPending || updateService.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Layanan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus layanan "{deletingService?.name}"? Tindakan ini tidak dapat dibatalkan.
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

export default AdminServices;
