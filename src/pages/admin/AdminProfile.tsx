import { useState, useEffect } from "react";
import { Save, User, Key } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/ImageUpload";

const AdminProfile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: "",
    avatar_url: "",
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    if (data) {
      setFormData({
        full_name: data.full_name || "",
        avatar_url: data.avatar_url || "",
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) {
      toast.error("Anda harus login terlebih dahulu");
      return;
    }
    
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id"
        })
        .select()
        .single();
      
      if (error) {
        console.error("Profile save error:", error);
        throw error;
      }
      
      // Update local state with saved data
      if (data) {
        setFormData({
          full_name: data.full_name || "",
          avatar_url: data.avatar_url || "",
        });
      }
      
      toast.success("Profil berhasil diperbarui");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error?.message || "Gagal memperbarui profil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("Password baru tidak cocok");
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    
    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new_password,
      });
      
      if (error) throw error;
      
      toast.success("Password berhasil diubah");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Gagal mengubah password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Profil Admin</h1>
              <p className="text-muted-foreground text-sm">Admin &gt; Profil</p>
            </div>
          </div>

          <div className="space-y-6 max-w-2xl">
            {/* Profile Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informasi Profil
                </CardTitle>
                <CardDescription>Kelola informasi profil Anda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={formData.avatar_url} />
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                      {getInitials(formData.full_name || user?.email || "AD")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{formData.full_name || "Admin"}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nama Lengkap</Label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Nama lengkap"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
                  </div>
                  <ImageUpload
                    value={formData.avatar_url}
                    onChange={(url) => setFormData({ ...formData, avatar_url: url })}
                    bucket="avatars"
                    folder={user?.id || "default"}
                    label="Foto Profil"
                    maxSizeMB={2}
                  />
                </div>
                
                <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
                  <Save className="w-4 h-4" />
                  {isSaving ? "Menyimpan..." : "Simpan Profil"}
                </Button>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Ubah Password
                </CardTitle>
                <CardDescription>Perbarui password akun Anda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Password Baru</Label>
                  <Input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Konfirmasi Password Baru</Label>
                  <Input
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
                
                <Button 
                  onClick={handleChangePassword} 
                  disabled={isChangingPassword || !passwordData.new_password}
                  variant="outline"
                  className="gap-2"
                >
                  <Key className="w-4 h-4" />
                  {isChangingPassword ? "Mengubah..." : "Ubah Password"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminProfile;
