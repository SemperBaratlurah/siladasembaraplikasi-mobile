import { useState, useEffect } from "react";
import { Save, Globe, Mail, Share2, FileText, Target, History, Bot, MessageCircle } from "lucide-react";
import AdminMobileLayout from "@/components/AdminMobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/ImageUpload";

const AdminSettings = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { settings, isLoading, updateSetting, getSetting } = useSettings();
  
  const [formData, setFormData] = useState({
    // Website Info
    site_name: "",
    site_tagline: "",
    site_description: "",
    site_logo: "",
    // Hero Section
    hero_title: "",
    hero_subtitle: "",
    hero_description: "",
    // About Section
    about_title: "",
    about_description: "",
    // Vision & Mission
    vision: "",
    mission: "",
    history: "",
    // Contact Info
    contact_email: "",
    contact_phone: "",
    contact_address: "",
    contact_hours: "",
    // Social Media
    social_facebook: "",
    social_instagram: "",
    social_twitter: "",
    social_youtube: "",
    social_whatsapp: "",
    // Features
    ai_chat_enabled: true,
    wa_floating_enabled: true,
  });

  useEffect(() => {
    if (settings.length > 0) {
      setFormData({
        site_name: getSetting("site_name") || "",
        site_tagline: getSetting("site_tagline") || "",
        site_description: getSetting("site_description") || "",
        site_logo: getSetting("site_logo") || "",
        hero_title: getSetting("hero_title") || "",
        hero_subtitle: getSetting("hero_subtitle") || "",
        hero_description: getSetting("hero_description") || "",
        about_title: getSetting("about_title") || "",
        about_description: getSetting("about_description") || "",
        vision: getSetting("vision") || "",
        mission: getSetting("mission") || "",
        history: getSetting("history") || "",
        contact_email: getSetting("contact_email") || "",
        contact_phone: getSetting("contact_phone") || "",
        contact_address: getSetting("contact_address") || "",
        contact_hours: getSetting("contact_hours") || "",
        social_facebook: getSetting("social_facebook") || "",
        social_instagram: getSetting("social_instagram") || "",
        social_twitter: getSetting("social_twitter") || "",
        social_youtube: getSetting("social_youtube") || "",
        social_whatsapp: getSetting("social_whatsapp") || "",
        ai_chat_enabled: getSetting("ai_chat_enabled") !== false,
        wa_floating_enabled: getSetting("wa_floating_enabled") !== false,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const results = await Promise.allSettled(
        Object.entries(formData).map(([key, value]) => 
          updateSetting.mutateAsync({ key, value })
        )
      );
      
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        console.error("Failed settings:", failed);
        toast.error(`Gagal menyimpan ${failed.length} pengaturan`);
      } else {
        toast.success("Pengaturan berhasil disimpan");
      }
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error(error?.message || "Gagal menyimpan pengaturan");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminMobileLayout title="Pengaturan Sistem">
        <div className="px-4 py-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </AdminMobileLayout>
    );
  }

  return (
    <AdminMobileLayout title="Pengaturan Sistem" showRefresh>
      <div className="px-4 py-4">
        {/* Save Button */}
        <div className="flex justify-end mb-4">
          <Button onClick={handleSave} disabled={isSaving} size="sm" className="gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>

        <Tabs defaultValue="website" className="w-full">
          <TabsList className="w-full h-auto flex-wrap mb-4">
            <TabsTrigger value="website" className="text-xs flex-1">Website</TabsTrigger>
            <TabsTrigger value="content" className="text-xs flex-1">Konten</TabsTrigger>
            <TabsTrigger value="contact" className="text-xs flex-1">Kontak</TabsTrigger>
            <TabsTrigger value="social" className="text-xs flex-1">Sosial</TabsTrigger>
            <TabsTrigger value="features" className="text-xs flex-1">Fitur</TabsTrigger>
          </TabsList>

          {/* Tab: Website Info */}
          <TabsContent value="website" className="space-y-4 mt-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="w-4 h-4" />
                  Informasi Website
                </CardTitle>
                <CardDescription className="text-xs">Pengaturan identitas website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Nama Website</Label>
                  <Input
                    value={formData.site_name}
                    onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                    placeholder="SILADA-SEMBAR"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Tagline</Label>
                  <Input
                    value={formData.site_tagline}
                    onChange={(e) => setFormData({ ...formData, site_tagline: e.target.value })}
                    placeholder="Sistem Layanan Digital"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Deskripsi Website</Label>
                  <Textarea
                    value={formData.site_description}
                    onChange={(e) => setFormData({ ...formData, site_description: e.target.value })}
                    placeholder="Deskripsi singkat tentang website..."
                    rows={3}
                  />
                </div>
                <ImageUpload
                  value={formData.site_logo}
                  onChange={(url) => setFormData({ ...formData, site_logo: url })}
                  bucket="site-assets"
                  folder="logo"
                  label="Logo Website"
                  maxSizeMB={1}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-4 h-4" />
                  Hero Section
                </CardTitle>
                <CardDescription className="text-xs">Konten bagian atas homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Judul Hero</Label>
                  <Input
                    value={formData.hero_title}
                    onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
                    placeholder="Selamat Datang di SILADA-SEMBAR"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Subjudul Hero</Label>
                  <Input
                    value={formData.hero_subtitle}
                    onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
                    placeholder="Sistem Layanan Digital Kelurahan"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Deskripsi Hero</Label>
                  <Textarea
                    value={formData.hero_description}
                    onChange={(e) => setFormData({ ...formData, hero_description: e.target.value })}
                    placeholder="Deskripsi singkat untuk hero section..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Content */}
          <TabsContent value="content" className="space-y-4 mt-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-4 h-4" />
                  Tentang Kami
                </CardTitle>
                <CardDescription className="text-xs">Konten section tentang di homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Judul</Label>
                  <Input
                    value={formData.about_title}
                    onChange={(e) => setFormData({ ...formData, about_title: e.target.value })}
                    placeholder="Tentang Kelurahan Semper Barat"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Deskripsi</Label>
                  <Textarea
                    value={formData.about_description}
                    onChange={(e) => setFormData({ ...formData, about_description: e.target.value })}
                    placeholder="Deskripsi lengkap tentang kelurahan..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="w-4 h-4" />
                  Visi & Misi
                </CardTitle>
                <CardDescription className="text-xs">Visi dan misi kelurahan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Visi</Label>
                  <Textarea
                    value={formData.vision}
                    onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                    placeholder="Visi kelurahan..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Misi</Label>
                  <Textarea
                    value={formData.mission}
                    onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                    placeholder="Misi kelurahan (pisahkan dengan enter)..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <History className="w-4 h-4" />
                  Sejarah
                </CardTitle>
                <CardDescription className="text-xs">Sejarah kelurahan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Sejarah Kelurahan</Label>
                  <Textarea
                    value={formData.history}
                    onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                    placeholder="Sejarah dan latar belakang kelurahan..."
                    rows={5}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Contact */}
          <TabsContent value="contact" className="space-y-4 mt-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mail className="w-4 h-4" />
                  Informasi Kontak
                </CardTitle>
                <CardDescription className="text-xs">Informasi kontak di website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Email</Label>
                  <Input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="admin@sembar.jakarta.go.id"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Telepon</Label>
                  <Input
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="+62 21 xxxx xxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Alamat</Label>
                  <Textarea
                    value={formData.contact_address}
                    onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
                    placeholder="Alamat lengkap kantor kelurahan..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Jam Operasional</Label>
                  <Input
                    value={formData.contact_hours}
                    onChange={(e) => setFormData({ ...formData, contact_hours: e.target.value })}
                    placeholder="Senin - Jumat, 08:00 - 16:00 WIB"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Social Media */}
          <TabsContent value="social" className="space-y-4 mt-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Share2 className="w-4 h-4" />
                  Media Sosial
                </CardTitle>
                <CardDescription className="text-xs">Link media sosial organisasi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Facebook</Label>
                  <Input
                    value={formData.social_facebook}
                    onChange={(e) => setFormData({ ...formData, social_facebook: e.target.value })}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Instagram</Label>
                  <Input
                    value={formData.social_instagram}
                    onChange={(e) => setFormData({ ...formData, social_instagram: e.target.value })}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Twitter / X</Label>
                  <Input
                    value={formData.social_twitter}
                    onChange={(e) => setFormData({ ...formData, social_twitter: e.target.value })}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">YouTube</Label>
                  <Input
                    value={formData.social_youtube}
                    onChange={(e) => setFormData({ ...formData, social_youtube: e.target.value })}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">WhatsApp</Label>
                  <Input
                    value={formData.social_whatsapp}
                    onChange={(e) => setFormData({ ...formData, social_whatsapp: e.target.value })}
                    placeholder="628123456789"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Features */}
          <TabsContent value="features" className="space-y-4 mt-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bot className="w-4 h-4" />
                  Fitur AI Chat
                </CardTitle>
                <CardDescription className="text-xs">Pengaturan asisten AI</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Aktifkan AI Chat</p>
                    <p className="text-xs text-muted-foreground">Tampilkan tombol chat AI</p>
                  </div>
                  <Switch
                    checked={formData.ai_chat_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, ai_chat_enabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageCircle className="w-4 h-4" />
                  Fitur WhatsApp
                </CardTitle>
                <CardDescription className="text-xs">Pengaturan tombol WhatsApp</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Aktifkan WhatsApp Float</p>
                    <p className="text-xs text-muted-foreground">Tampilkan tombol WA mengambang</p>
                  </div>
                  <Switch
                    checked={formData.wa_floating_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, wa_floating_enabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminMobileLayout>
  );
};

export default AdminSettings;
