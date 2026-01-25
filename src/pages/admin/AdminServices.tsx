import { useState } from "react";
import { Plus, Search, ExternalLink } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAdminServices, CreateServiceInput, Service } from "@/hooks/useAdminServices";
import { toast } from "sonner";
import DynamicIcon from "@/components/DynamicIcon";
import { GripVertical, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

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

interface SortableServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
}

const SortableServiceCard = ({ service, onEdit, onDelete }: SortableServiceCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="mobile-card"
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
          <DynamicIcon name={service.icon} className="w-5 h-5 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground text-sm truncate">
              {service.name}
            </h3>
            {service.external_url && (
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={service.is_active ? "default" : "secondary"} className="text-xs">
              {service.is_active ? "Aktif" : "Nonaktif"}
            </Badge>
            <span className="text-xs text-muted-foreground">{service.click_count} klik</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-9"
          onClick={() => onEdit(service)}
        >
          <Edit2 className="w-4 h-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-destructive hover:text-destructive"
          onClick={() => onDelete(service)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const AdminServices = () => {
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
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
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
      toast.success("Urutan berhasil diperbarui");
    } catch (error) {
      toast.error("Gagal memperbarui urutan");
    }
  };

  return (
    <AdminMobileLayout title="Layanan Digital">
      {/* Search & Add */}
      <div className="px-4 py-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari layanan..."
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
          Tambah Layanan
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Seret untuk mengubah urutan
        </p>
      </div>

      {/* Services List */}
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
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? "Tidak ada layanan ditemukan" : "Belum ada layanan"}
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={filteredServices.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {filteredServices.map((service) => (
                  <SortableServiceCard
                    key={service.id}
                    service={service}
                    onEdit={handleOpenDialog}
                    onDelete={(s) => {
                      setDeletingService(s);
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
            <DialogTitle>{editingService ? "Edit Layanan" : "Tambah Layanan"}</DialogTitle>
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
                placeholder="Deskripsi singkat..."
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
              Yakin hapus layanan "{deletingService?.name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminMobileLayout>
  );
};

export default AdminServices;
