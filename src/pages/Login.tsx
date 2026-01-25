import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, isLoading, signIn } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error("Email dan kata sandi wajib diisi");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Email atau kata sandi salah");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Email belum dikonfirmasi. Periksa inbox Anda.");
        } else {
          toast.error(error.message);
        }
        setIsSubmitting(false);
        return;
      }
      
      toast.success("Login berhasil!");
      
      // Check admin role and redirect immediately after successful login
      if (data?.user) {
        const { data: roleData } = await supabase.rpc('has_role', {
          _user_id: data.user.id,
          _role: 'admin' as const,
        });
        
        if (roleData === true) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat login");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-4">
            <img 
              src={logo} 
              alt="Logo SILADA SEMBAR" 
              className="w-24 h-24 object-contain"
            />
            <div>
              <h1 className="text-white font-bold text-2xl tracking-wide">SILADA-SEMBAR</h1>
              <p className="text-white/60 text-sm mt-1">Sistem Layanan Administrasi Digital</p>
            </div>
          </Link>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-navy">Masuk ke Akun Anda</CardTitle>
            <CardDescription>Silakan masukkan kredensial Anda untuk melanjutkan</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Kata Sandi</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-3 pt-0">
            <p className="text-sm text-muted-foreground">
              Hanya untuk Admin Kelurahan
            </p>
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </Button>
          </CardFooter>
        </Card>

        {/* Footer */}
        <p className="text-center text-white/50 text-sm mt-6">
          © 2024 Kelurahan Semper Barat, Jakarta Utara
        </p>
      </div>
    </div>
  );
};

export default Login;
