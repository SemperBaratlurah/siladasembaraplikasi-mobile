import { useState, useEffect } from "react";
import { Save, Palette, Type, Layout } from "lucide-react";
import AdminMobileLayout from "@/components/AdminMobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    <AdminMobileLayout title="Tema & Tampilan" showRefresh>
      <div className="px-4 py-4">
        {/* Save Button */}
        <div className="flex justify-end mb-4">
          <Button onClick={handleSave} disabled={isSaving} size="sm" className="gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>

        <div className="space-y-4">
          {/* Color Presets */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="w-4 h-4" />
                Preset Warna
              </CardTitle>
              <CardDescription className="text-xs">Pilih skema warna yang tersedia</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Pemerintahan Indonesia */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-muted-foreground mb-2">🇮🇩 Pemerintahan</h4>
                <div className="grid grid-cols-2 gap-2">
                  {colorPresets.filter(p => p.category === 'pemerintah').map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handlePresetSelect(preset)}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        formData.theme_primary_color === preset.primary
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border"
                      }`}
                    >
                      <div className="flex gap-1.5 mb-1.5">
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: preset.secondary }}
                        />
                      </div>
                      <p className="text-xs font-medium truncate">{preset.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Warna Umum */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">🎨 Warna Umum</h4>
                <div className="grid grid-cols-2 gap-2">
                  {colorPresets.filter(p => p.category === 'umum' || p.category === 'default').map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handlePresetSelect(preset)}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        formData.theme_primary_color === preset.primary
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border"
                      }`}
                    >
                      <div className="flex gap-1.5 mb-1.5">
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: preset.secondary }}
                        />
                      </div>
                      <p className="text-xs font-medium truncate">{preset.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Colors */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="w-4 h-4" />
                Warna Kustom
              </CardTitle>
              <CardDescription className="text-xs">Sesuaikan warna secara manual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Warna Utama (Primary)</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.theme_primary_color}
                    onChange={(e) => setFormData({ ...formData, theme_primary_color: e.target.value })}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={formData.theme_primary_color}
                    onChange={(e) => setFormData({ ...formData, theme_primary_color: e.target.value })}
                    placeholder="#006666"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Warna Sekunder</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.theme_secondary_color}
                    onChange={(e) => setFormData({ ...formData, theme_secondary_color: e.target.value })}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={formData.theme_secondary_color}
                    onChange={(e) => setFormData({ ...formData, theme_secondary_color: e.target.value })}
                    placeholder="#00A19D"
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Layout className="w-4 h-4" />
                Preview
              </CardTitle>
              <CardDescription className="text-xs">Tampilan dengan pengaturan saat ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-muted/50">
                <div className="flex gap-3 items-center mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: formData.theme_primary_color }}
                  >
                    S
                  </div>
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: formData.theme_primary_color }}>
                      SILADA-SEMBAR
                    </h3>
                    <p className="text-xs text-muted-foreground">Sistem Layanan Digital</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1.5 rounded-lg text-white text-xs font-medium"
                    style={{ backgroundColor: formData.theme_primary_color }}
                  >
                    Primary
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-lg text-white text-xs font-medium"
                    style={{ backgroundColor: formData.theme_secondary_color }}
                  >
                    Secondary
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Font Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Type className="w-4 h-4" />
                Pengaturan Font
              </CardTitle>
              <CardDescription className="text-xs">Pilih font untuk website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="text-sm">Font Family</Label>
                <Select 
                  value={formData.theme_font_family} 
                  onValueChange={(value) => setFormData({ ...formData, theme_font_family: value })}
                >
                  <SelectTrigger className="w-full">
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
      </div>
    </AdminMobileLayout>
  );
};

export default AdminTheme;
