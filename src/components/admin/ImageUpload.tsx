import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket: string;
  folder?: string;
  label?: string;
  placeholder?: string;
  maxSizeMB?: number;
  className?: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const ImageUpload = ({
  value,
  onChange,
  bucket,
  folder = "",
  label = "Gambar",
  placeholder = "Upload gambar atau masukkan URL",
  maxSizeMB = 2,
  className,
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Format file tidak didukung. Gunakan JPG, PNG, atau WebP.");
      return false;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Ukuran file maksimal ${maxSizeMB}MB`);
      return false;
    }
    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    try {
      // Generate unique filename
      const ext = file.name.split(".").pop();
      const timestamp = Date.now();
      const uniqueName = `${timestamp}-${crypto.randomUUID()}.${ext}`;
      const filePath = folder ? `${folder}/${uniqueName}` : uniqueName;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      onChange(urlData.publicUrl);
      toast.success("Gambar berhasil diupload");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Gagal mengupload gambar");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput("");
      setShowUrlInput(false);
      toast.success("URL gambar berhasil ditambahkan");
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label} (opsional)</Label>
      
      {value ? (
        <div className="relative">
          <div className="relative aspect-video w-full max-w-xs rounded-lg overflow-hidden border bg-muted">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate max-w-xs">
            {value}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Upload Area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
              isUploading
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 cursor-pointer"
            )}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Mengupload...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm">
                  <span className="font-medium text-primary">Klik untuk upload</span>
                  <span className="text-muted-foreground"> atau drag & drop</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WebP (max {maxSizeMB}MB)
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {/* URL Input Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex-1 border-t border-muted" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-xs text-muted-foreground"
            >
              <LinkIcon className="h-3 w-3 mr-1" />
              Atau gunakan URL
            </Button>
            <div className="flex-1 border-t border-muted" />
          </div>

          {/* URL Input Field */}
          {showUrlInput && (
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim()}
                size="sm"
              >
                <ImageIcon className="h-4 w-4 mr-1" />
                Pakai
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
