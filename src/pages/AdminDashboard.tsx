import { useState } from "react";
import { Settings, RefreshCw } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import StatsCards from "@/components/StatsCards";
import VisitorChart from "@/components/VisitorChart";
import PopularServices from "@/components/PopularServices";
import RecentActivities from "@/components/RecentActivities";
import ConnectionStatus, { useConnectionStatus } from "@/components/ConnectionStatus";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isOnline } = useConnectionStatus();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    // Invalidate all dashboard-related queries
    queryClient.invalidateQueries({ queryKey: ["statistics"] });
    queryClient.invalidateQueries({ queryKey: ["today-stats"] });
    queryClient.invalidateQueries({ queryKey: ["popular-services"] });
    queryClient.invalidateQueries({ queryKey: ["activities"] });
    queryClient.invalidateQueries({ queryKey: ["services"] });
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* Connection Status */}
          <ConnectionStatus />
          
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground text-sm">Admin &gt; Dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="p-2 rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5 text-muted-foreground" />
              </motion.button>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
              {/* Online status indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                <span className="text-xs text-muted-foreground">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards />

          {/* Charts and Lists */}
          <div className="grid lg:grid-cols-2 gap-6 mt-6">
            <VisitorChart />
            <PopularServices />
          </div>

          {/* Recent Activities */}
          <div className="mt-6">
            <RecentActivities />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
