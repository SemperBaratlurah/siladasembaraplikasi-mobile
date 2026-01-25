import { motion } from "framer-motion";
import { 
  FileText, 
  Image, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MousePointer,
  ChevronRight,
  Users,
  Clock
} from "lucide-react";
import { useActivities } from "@/hooks/useActivities";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

// Action type configuration with icons and colors
const actionConfig: Record<string, { icon: typeof FileText; color: string; label: string }> = {
  create: { icon: Plus, color: "bg-emerald-500", label: "Membuat" },
  update: { icon: Edit, color: "bg-blue-500", label: "Mengubah" },
  delete: { icon: Trash2, color: "bg-red-500", label: "Menghapus" },
  publish: { icon: Eye, color: "bg-purple-500", label: "Mempublikasikan" },
  click: { icon: MousePointer, color: "bg-amber-500", label: "Mengklik" },
  view: { icon: Eye, color: "bg-cyan-500", label: "Melihat" },
  visit: { icon: Users, color: "bg-teal-500", label: "Mengunjungi" },
};

// Target type labels in Indonesian
const targetTypeLabels: Record<string, string> = {
  service: "Layanan",
  page: "Halaman",
  post: "Artikel",
  gallery: "Galeri",
  menu: "Menu",
  setting: "Pengaturan",
  announcement: "Pengumuman",
  event: "Kegiatan",
};

const RecentActivities = () => {
  const { activities, isLoading } = useActivities(8);

  const getActivityDetails = (activity: typeof activities[0]) => {
    const config = actionConfig[activity.action] || { 
      icon: FileText, 
      color: "bg-muted", 
      label: activity.action 
    };
    
    const actorLabel = activity.actor_type === "admin" ? "Admin SILADA" : "Pengguna";
    const targetLabel = targetTypeLabels[activity.target_type || ""] || activity.target_type;
    
    return {
      ...config,
      actorLabel,
      targetLabel,
      targetTitle: activity.target_title,
    };
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-card"
      >
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-white rounded-2xl p-6 shadow-card"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Aktivitas Terbaru
        </h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Real-time</span>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Belum ada aktivitas tercatat
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((activity, index) => {
            const details = getActivityDetails(activity);
            const IconComponent = details.icon;
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className={`w-8 h-8 rounded-full ${details.color} flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{details.actorLabel}</span>
                    {" "}
                    <span className="text-muted-foreground">{details.label.toLowerCase()}</span>
                    {" "}
                    {details.targetLabel && (
                      <span className="text-muted-foreground">{details.targetLabel.toLowerCase()}</span>
                    )}
                  </p>
                  {details.targetTitle && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      "{details.targetTitle}"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.created_at), { 
                      addSuffix: true, 
                      locale: id 
                    })}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default RecentActivities;
