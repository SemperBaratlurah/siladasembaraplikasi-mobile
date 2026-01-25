import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, AlertCircle, Lightbulb, Target, Users, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { useVisitTracker } from "@/hooks/useVisitTracker";
import MobileLayout from "@/components/MobileLayout";
import { Link } from "react-router-dom";

const Profile = () => {
  useVisitTracker("profil");
  
  const { settings, isLoading } = usePublicProfile();

  const officials = Array.isArray(settings.officials) ? settings.officials : [];
  const missionList = Array.isArray(settings.mission) ? settings.mission : [];
  const hasContactInfo = settings.contact_address || settings.contact_phone || settings.contact_email || settings.contact_hours;
  const hasVisionMission = settings.vision || missionList.length > 0;
  const hasOfficials = officials.length > 0;
  const hasHistory = settings.history;
  const hasAnyContent = hasContactInfo || hasVisionMission || hasOfficials || hasHistory;

  if (isLoading) {
    return (
      <MobileLayout title="Profil">
        <div className="px-4 py-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="mobile-card">
              <Skeleton className="w-10 h-10 rounded-full mb-3" />
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </MobileLayout>
    );
  }

  if (!hasAnyContent) {
    return (
      <MobileLayout title="Profil">
        <div className="px-4 py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Data Profil Belum Tersedia</h2>
          <p className="text-muted-foreground text-sm">
            Informasi profil belum dikonfigurasi.
          </p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Profil">
      {/* Quick Info Cards */}
      {hasContactInfo && (
        <div className="px-4 py-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Informasi Kontak</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: MapPin, label: "Alamat", value: settings.contact_address },
              { icon: Phone, label: "Telepon", value: settings.contact_phone },
              { icon: Mail, label: "Email", value: settings.contact_email },
              { icon: Clock, label: "Jam Operasional", value: settings.contact_hours },
            ].filter(item => item.value).map((item) => (
              <div key={item.label} className="mobile-card">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium text-foreground text-sm mb-1">{item.label}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vision & Mission */}
      {hasVisionMission && (
        <div className="px-4 py-6 bg-muted/30">
          <h2 className="text-lg font-bold text-foreground mb-4">Visi & Misi</h2>
          
          {/* Visi */}
          {settings.vision && (
            <div className="mobile-card bg-gradient-to-br from-primary to-primary/80 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Visi</h3>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">
                "{settings.vision}"
              </p>
            </div>
          )}

          {/* Misi */}
          {missionList.length > 0 && (
            <div className="mobile-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Misi</h3>
              </div>
              <ul className="space-y-3">
                {missionList.map((misi, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground text-sm leading-relaxed">{misi}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Officials */}
      {hasOfficials && (
        <div className="px-4 py-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Struktur Organisasi</h2>
          </div>
          
          <div className="space-y-3">
            {officials.map((official, index) => (
              <motion.div
                key={official.name || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`mobile-card ${index === 0 ? 'bg-gradient-to-br from-primary to-primary/80' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${index === 0 ? 'bg-white/20' : 'bg-primary/10'}`}>
                    <span className={`text-lg font-bold ${index === 0 ? 'text-white' : 'text-primary'}`}>
                      {official.name?.charAt(0) || "?"}
                    </span>
                  </div>
                  <div>
                    <h3 className={`font-semibold ${index === 0 ? 'text-white' : 'text-foreground'}`}>
                      {official.name}
                    </h3>
                    <p className={`text-sm ${index === 0 ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {official.position}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {hasHistory && (
        <div className="px-4 py-6 bg-muted/30">
          <h2 className="text-lg font-bold text-foreground mb-4">Sejarah Singkat</h2>
          <div className="mobile-card">
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
              {settings.history
                ?.replace(/\\n/g, '\n')
                .split(/\n\n+/)
                .filter((p: string) => p.trim())
                .slice(0, 2)
                .map((paragraph: string, idx: number) => (
                  <p key={idx}>{paragraph.trim()}</p>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* Login Link */}
      <div className="px-4 py-6">
        <Link to="/login" className="mobile-card-interactive flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Login Admin</h3>
              <p className="text-xs text-muted-foreground">Masuk ke panel admin</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Link>
      </div>
    </MobileLayout>
  );
};

export default Profile;
