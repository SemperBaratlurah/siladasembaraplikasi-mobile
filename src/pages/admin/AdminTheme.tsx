import { useState, useEffect } from "react";
import { Save, Palette, Sun, Moon, Type, Layout } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";

const colorPresets = [
  // Default
  { name: "Teal (Default)", primary: "#006666", secondary: "#00A19D", category: "default" },
  
  // Pemerintahan Indonesia
  { name: "Merah Putih", primary: "#C41E3A", secondary: "#E8505B", category: "pemerintah" },
  { name: "Biru Instansi", primary: "#003366", secondary: "#0066B3", category: "pemerintah" },
  { name: "Kemenkeu", primary: "#003D7A", secondary: "#0066CC", category: "pemerintah" },
  { name: "Kemendagri", primary: "#1A237E", secondary: "#3949AB", category: "pemerintah" },
  { name: "Kemenkes", primary: "#2E7D32", secondary: "#4CAF50", category: "pemerintah" },
  { name: "Kemendikbud", primary: "#01579B", secondary: "#0288D1", category: "pemerintah" },
  { name: "Kemensos", primary: "#6A1B9A", secondary: "#AB47BC", category: "pemerintah" },
  { name: "BPS", primary: "#1565C0", secondary: "#42A5F5", category: "pemerintah" },
  
  // Warna Umum
  { name: "Hijau", primary: "#166534", secondary: "#22c55e", category: "umum" },
  { name: "Ungu", primary: "#7c3aed", secondary: "#a855f7", category: "umum" },
  { name: "Oranye", primary: "#c2410c", secondary: "#f97316", category: "umum" },
  { name: "Biru Langit", primary: "#0284c7", secondary: "#38bdf8", category: "umum" },
  { name: "Emas", primary: "#B8860B", secondary: "#DAA520", category: "umum" },
];

const AdminTheme = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { settings, isLoading, updateSetting, getSetting } = useSettings();
  
  const [formData, setFormData] = useState({
    theme_mode: "light",
    theme_primary_color: "#006666",
    theme_secondary_color: "#00A19D",
    theme_font_family: "Inter",
  });

  useEffect(() => {
    if (settings.length > 0) {
      setFormData({
        theme_mode: getSetting("theme_mode") || "light",
        theme_primary_color: getSetting("theme_primary_color") || "#006666",
        theme_secondary_color: getSetting("theme_secondary_color") || "#00A19D",
        theme_font_family: getSetting("theme_font_family") || "Inter",
      });
    }
  }, [settings]);

  const handlePresetSelect = (preset: typeof colorPresets[0]) => {
    setFormData({
      ...formData,
      theme_primary_color: preset.primary,
      theme_secondary_color: preset.secondary,
    });
  };

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
        toast.error(`Gagal menyimpan ${failed.length} pengaturan tema`);
      } else {
        toast.success("Pengaturan tema berhasil disimpan");
      }
    } catch (error: any) {
      console.error("Error saving theme:", error);
      toast.error(error?.message || "Gagal menyimpan pengaturan tema");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tema & Tampilan</h1>
              <p className="text-muted-foreground text-sm">Admin &gt; Tema & Tampilan</p>
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>

          <div className="space-y-6 max-w-4xl">
            {/* Color Presets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Preset Warna
                </CardTitle>
                <CardDescription>Pilih skema warna yang sudah tersedia</CardDescription>
              </CardHeader>
              <CardContent>
              {/* Pemerintahan Indonesia */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">🇮🇩 Pemerintahan Indonesia</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {colorPresets.filter(p => p.category === 'pemerintah').map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => handlePresetSelect(preset)}
                        className={`p-3 rounded-xl border-2 transition-all hover:shadow-md ${
                          formData.theme_primary_color === preset.primary
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border"
                        }`}
                      >
                        <div className="flex gap-2 mb-2">
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: preset.secondary }}
                          />
                        </div>
                        <p className="text-xs font-medium">{preset.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Warna Umum */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">🎨 Warna Umum</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {colorPresets.filter(p => p.category === 'umum' || p.category === 'default').map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => handlePresetSelect(preset)}
                        className={`p-3 rounded-xl border-2 transition-all hover:shadow-md ${
                          formData.theme_primary_color === preset.primary
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border"
                        }`}
                      >
                        <div className="flex gap-2 mb-2">
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: preset.secondary }}
                          />
                        </div>
                        <p className="text-xs font-medium">{preset.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Custom Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Warna Kustom
                </CardTitle>
                <CardDescription>Sesuaikan warna secara manual</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Warna Utama (Primary)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.theme_primary_color}
                        onChange={(e) => setFormData({ ...formData, theme_primary_color: e.target.value })}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={formData.theme_primary_color}
                        onChange={(e) => setFormData({ ...formData, theme_primary_color: e.target.value })}
                        placeholder="#006666"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Warna Sekunder</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.theme_secondary_color}
                        onChange={(e) => setFormData({ ...formData, theme_secondary_color: e.target.value })}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={formData.theme_secondary_color}
                        onChange={(e) => setFormData({ ...formData, theme_secondary_color: e.target.value })}
                        placeholder="#00A19D"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Preview
                </CardTitle>
                <CardDescription>Lihat tampilan dengan pengaturan saat ini</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 rounded-xl bg-muted/50">
                  <div className="flex gap-4 items-center mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: formData.theme_primary_color }}
                    >
                      S
                    </div>
                    <div>
                      <h3 className="font-bold" style={{ color: formData.theme_primary_color }}>
                        SILADA-SEMBAR
                      </h3>
                      <p className="text-sm text-muted-foreground">Sistem Layanan Digital</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                      style={{ backgroundColor: formData.theme_primary_color }}
                    >
                      Tombol Primary
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                      style={{ backgroundColor: formData.theme_secondary_color }}
                    >
                      Tombol Secondary
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Font Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Pengaturan Font
                </CardTitle>
                <CardDescription>Pilih font untuk website</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select 
                    value={formData.theme_font_family} 
                    onValueChange={(value) => setFormData({ ...formData, theme_font_family: value })}
                  >
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Nunito">Nunito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminTheme;
