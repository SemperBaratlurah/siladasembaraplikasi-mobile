import { useState, useEffect } from "react";
import { Save, User, Key } from "lucide-react";
import AdminMobileLayout from "@/components/AdminMobileLayout";
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
    <AdminMobileLayout title="Profil Admin" showRefresh>
      <div className="px-4 py-4 space-y-4">
        {/* Profile Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4" />
              Informasi Profil
            </CardTitle>
            <CardDescription className="text-xs">Kelola informasi profil Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={formData.avatar_url} />
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {getInitials(formData.full_name || user?.email || "AD")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{formData.full_name || "Admin"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Nama Lengkap</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Email</Label>
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
            
            <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? "Menyimpan..." : "Simpan Profil"}
            </Button>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Key className="w-4 h-4" />
              Ubah Password
            </CardTitle>
            <CardDescription className="text-xs">Perbarui password akun Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Password Baru</Label>
              <Input
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Konfirmasi Password</Label>
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
              className="w-full gap-2"
            >
              <Key className="w-4 h-4" />
              {isChangingPassword ? "Mengubah..." : "Ubah Password"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminMobileLayout>
  );
};

export default AdminProfile;
