import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, AlertCircle, Lightbulb, Target, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { useVisitTracker } from "@/hooks/useVisitTracker";

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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="gradient-hero py-16 md:py-24">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto">
                <Skeleton className="h-12 w-64 mx-auto mb-4 bg-white/20" />
                <Skeleton className="h-6 w-48 mx-auto bg-white/20" />
              </div>
            </div>
          </section>
          <section className="py-12 bg-background">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-20">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="bg-card border-none shadow-lg">
                    <CardContent className="p-6 text-center">
                      <Skeleton className="w-12 h-12 rounded-full mx-auto mb-4" />
                      <Skeleton className="h-5 w-24 mx-auto mb-2" />
                      <Skeleton className="h-4 w-32 mx-auto" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  // Empty state - no profile data configured
  if (!hasAnyContent) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="gradient-hero py-16 md:py-24">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-3xl mx-auto"
              >
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  Profil
                </h1>
              </motion.div>
            </div>
          </section>

          <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Data Profil Belum Tersedia
                </h2>
                <p className="text-muted-foreground">
                  Informasi profil belum dikonfigurasi. Silakan hubungi administrator untuk menambahkan data profil.
                </p>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="gradient-hero py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Profil
              </h1>
              {(settings.site_name || settings.site_tagline) && (
                <p className="text-white/80 text-lg">
                  {settings.site_name}{settings.site_name && settings.site_tagline ? " - " : ""}{settings.site_tagline}
                </p>
              )}
            </motion.div>
          </div>
        </section>

        {/* Info Cards - only show if contact info exists */}
        {hasContactInfo && (
          <section className="py-12 bg-background">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-20">
                {[
                  { icon: MapPin, label: "Alamat", value: settings.contact_address },
                  { icon: Phone, label: "Telepon", value: settings.contact_phone },
                  { icon: Mail, label: "Email", value: settings.contact_email },
                  { icon: Clock, label: "Jam Operasional", value: settings.contact_hours },
                ].filter(item => item.value).map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="bg-card border-none shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <item.icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{item.label}</h3>
                        <p className="text-muted-foreground text-sm">{item.value}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Visi & Misi Section - only show if data exists */}
        {hasVisionMission && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4">
                  Visi & Misi
                </h2>
                <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Visi */}
                {settings.vision && (
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    <Card className="h-full bg-gradient-to-br from-primary to-primary/80 border-none shadow-xl">
                      <CardContent className="p-4 sm:p-6 md:p-8">
                        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl bg-white/20 flex items-center justify-center">
                            <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                          </div>
                          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Visi</h3>
                        </div>
                        <p className="text-white/90 text-base leading-[1.7] text-left md:text-justify break-words">
                          "{settings.vision}"
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Misi */}
                {missionList.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    <Card className="h-full bg-card border-none shadow-xl">
                      <CardContent className="p-4 sm:p-6 md:p-8">
                        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl bg-secondary/10 flex items-center justify-center">
                            <Target className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-secondary" />
                          </div>
                          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Misi</h3>
                        </div>
                        <ul className="space-y-3 md:space-y-4">
                          {missionList.map((misi, index) => (
                            <li key={index} className="flex items-start gap-2 sm:gap-3">
                              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              <span className="text-muted-foreground text-base leading-[1.7] text-left md:text-justify break-words">{misi}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Struktur Organisasi - only show if officials exist */}
        {hasOfficials && (
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
                  <Users className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                    Struktur Organisasi
                  </h2>
                </div>
                {settings.site_name && (
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Aparatur {settings.site_name} yang siap melayani masyarakat dengan profesional
                  </p>
                )}
                <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full mt-4" />
              </motion.div>

              {/* Org Chart */}
              <div className="max-w-5xl mx-auto">
                {/* Lurah - Top */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="flex justify-center mb-8"
                >
                  <Card className="bg-gradient-to-br from-primary to-primary/80 border-none shadow-xl w-full max-w-sm">
                    <CardContent className="p-6 text-center">
                      <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl font-bold text-white">
                          {officials[0]?.name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {officials[0]?.name}
                      </h3>
                      <p className="text-white/80 font-medium">{officials[0]?.position}</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Connector Line */}
                {officials.length > 1 && (
                  <>
                    <div className="flex justify-center mb-8">
                      <div className="w-0.5 h-8 bg-border" />
                    </div>

                    {/* Sekretaris */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="flex justify-center mb-8"
                    >
                      <Card className="bg-secondary/10 border-secondary/20 shadow-lg w-full max-w-sm">
                        <CardContent className="p-6 text-center">
                          <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl font-bold text-secondary">
                              {officials[1]?.name?.charAt(0) || "?"}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-foreground mb-1">
                            {officials[1]?.name}
                          </h3>
                          <p className="text-muted-foreground font-medium">{officials[1]?.position}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </>
                )}

                {/* Kasi Grid */}
                {officials.length > 2 && (
                  <>
                    {/* Connector Line */}
                    <div className="flex justify-center mb-8">
                      <div className="w-0.5 h-8 bg-border" />
                    </div>

                    {/* Horizontal Line */}
                    <div className="hidden md:flex justify-center mb-8">
                      <div className="w-3/4 h-0.5 bg-border" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {officials.slice(2).map((official, index) => (
                        <motion.div
                          key={official.name || index}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                        >
                          <Card className="bg-card border shadow-lg hover:shadow-xl transition-shadow h-full">
                            <CardContent className="p-6 text-center">
                              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <span className="text-xl font-bold text-primary">
                                  {official.name?.charAt(0) || "?"}
                                </span>
                              </div>
                              <h3 className="text-base font-bold text-foreground mb-1">
                                {official.name}
                              </h3>
                              <p className="text-muted-foreground text-sm font-medium">
                                {official.position}
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Sejarah Singkat - only show if history exists */}
        {hasHistory && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                    <Card className="bg-card border-none shadow-xl overflow-hidden">
                      <CardContent className="p-4 sm:p-6 md:p-8 lg:p-12">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4 md:mb-6">
                        Sejarah Singkat
                      </h2>
                      <div className="max-w-none space-y-4">
                        {settings.history
                          ?.replace(/\\n/g, '\n')
                          .split(/\n\n+/)
                          .filter((p: string) => p.trim())
                          .map((paragraph: string, index: number) => (
                            <p key={index} className="text-muted-foreground text-base leading-[1.7] text-left md:text-justify break-words">
                              {paragraph.trim()}
                            </p>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
