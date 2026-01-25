import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Service } from "@/hooks/useAdminServices";
import DynamicIcon from "@/components/DynamicIcon";

interface DraggableServiceRowProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
}

const DraggableServiceRow = ({ service, onEdit, onDelete }: DraggableServiceRowProps) => {
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
    <TableRow ref={setNodeRef} style={style} className="group">
      <TableCell>
        <button
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <DynamicIcon name={service.icon} className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{service.name}</p>
            {service.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">{service.description}</p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {service.category || "Umum"}
        </Badge>
      </TableCell>
      <TableCell>
        {service.external_url ? (
          <a 
            href={service.external_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline truncate max-w-[200px] block"
          >
            {service.external_url}
          </a>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">{service.click_count}</span>
      </TableCell>
      <TableCell>
        {service.is_active ? (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aktif</Badge>
        ) : (
          <Badge variant="secondary" className="bg-gray-100 text-gray-600">Nonaktif</Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(service)}
            className="gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDelete(service)} 
            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hapus</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default DraggableServiceRow;
