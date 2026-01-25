import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit, Trash2, ExternalLink, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Menu } from "@/hooks/useMenus";
import DynamicIcon from "@/components/DynamicIcon";

interface DraggableMenuRowProps {
  menu: Menu;
  isChild?: boolean;
  onEdit: (menu: Menu) => void;
  onDelete: (menu: Menu) => void;
}

const DraggableMenuRow = ({ menu, isChild, onEdit, onDelete }: DraggableMenuRowProps) => {
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
    <TableRow ref={setNodeRef} style={style} className={isDragging ? "bg-muted" : ""}>
      <TableCell>
        <div className="flex items-center gap-2">
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </TableCell>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {isChild && <ChevronRight className="w-4 h-4 text-muted-foreground ml-4" />}
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <DynamicIcon name={menu.icon} className="w-4 h-4 text-primary" />
          </div>
          <span className={isChild ? "text-muted-foreground" : ""}>{menu.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{menu.slug}</TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {menu.location || "header"}
        </Badge>
      </TableCell>
      <TableCell>
        {menu.url ? (
          <a href={menu.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
            <ExternalLink className="w-3 h-3" />
            {menu.url.length > 25 ? menu.url.substring(0, 25) + "..." : menu.url}
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={menu.is_active ? "default" : "secondary"}>
          {menu.is_active ? "Aktif" : "Nonaktif"}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(menu)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(menu)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default DraggableMenuRow;