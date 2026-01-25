import AdminMobileLayout from "@/components/AdminMobileLayout";
import StatsCards from "@/components/StatsCards";
import VisitorChart from "@/components/VisitorChart";
import PopularServices from "@/components/PopularServices";
import RecentActivities from "@/components/RecentActivities";
import ConnectionStatus, { useConnectionStatus } from "@/components/ConnectionStatus";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const { isOnline } = useConnectionStatus();

  return (
    <AdminMobileLayout title="Dashboard" showRefresh>
      {/* Connection Status */}
      <div className="px-4 pt-4">
        <ConnectionStatus />
        
        {/* Online status indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-destructive'} animate-pulse`} />
          <span className="text-xs text-muted-foreground">
            {isOnline ? 'Terhubung ke server' : 'Tidak terhubung'}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4">
        <StatsCards />
      </div>

      {/* Charts and Lists */}
      <div className="px-4 mt-6 space-y-6">
        <VisitorChart />
        <PopularServices />
        <RecentActivities />
      </div>
    </AdminMobileLayout>
  );
};

export default AdminDashboard;
