import { Search, Bell, Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {
  const { user, isLoading } = useAuth();

  // Get display name and initials
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
  const initials = displayName
    ? displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="bg-white border-b border-border sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-6 h-6 text-foreground" />
          </button>

          {/* Search Bar */}
          <div className="hidden sm:block relative w-64 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari sesuatu..."
              className="pl-10 h-10 bg-muted/50 border-0 rounded-lg"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <Button className="bg-secondary hover:bg-secondary/90 text-white font-medium hidden sm:flex">
            <Plus className="w-4 h-4 mr-2" />
            Kelola Konten
          </Button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-border">
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-20 hidden md:block" />
                <Skeleton className="w-9 h-9 rounded-full" />
              </>
            ) : (
              <>
                {displayName && (
                  <span className="hidden md:block text-sm font-medium text-foreground">
                    {displayName}
                  </span>
                )}
                <Avatar className="w-9 h-9">
                  <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
                  <AvatarFallback className="bg-secondary text-white font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
