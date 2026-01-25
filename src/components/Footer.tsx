import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import logo from "@/assets/kelurahan-icon.png";
import { usePublicSiteSettings } from "@/hooks/usePublicSiteSettings";

const Footer = () => {
  const { settings, isLoading } = usePublicSiteSettings();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { key: "social_facebook", url: settings.social_facebook, icon: Facebook, label: "Facebook" },
    { key: "social_instagram", url: settings.social_instagram, icon: Instagram, label: "Instagram" },
    { key: "social_twitter", url: settings.social_twitter, icon: Twitter, label: "Twitter" },
    { key: "social_youtube", url: settings.social_youtube, icon: Youtube, label: "YouTube" },
    { key: "social_whatsapp", url: settings.social_whatsapp, icon: MessageCircle, label: "WhatsApp" },
  ].filter((link) => link.url && link.url.trim());

  return (
    <footer className="w-full gradient-header py-8 md:py-12">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8 xl:gap-12">
          {/* Logo & Description */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img 
                src={logo} 
                alt="Logo" 
                className="w-10 h-10 object-contain"
              />
              {isLoading ? (
                <Skeleton className="h-6 w-32 bg-white/20" />
              ) : settings.site_name ? (
                <span className="text-white font-bold text-lg">
                  {settings.site_name}
                </span>
              ) : null}
            </Link>
            {isLoading ? (
              <Skeleton className="h-4 w-48 bg-white/20" />
            ) : settings.site_tagline ? (
              <p className="text-white/70 text-sm">
                {settings.site_tagline}
              </p>
            ) : null}

            {/* Social Media Icons */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3 mt-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.key}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4 text-white" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Tautan Cepat</h4>
            <ul className="space-y-2">
              <li>
                <a href="#layanan" className="text-white/70 hover:text-white text-sm transition-colors">
                  Layanan Publik
                </a>
              </li>
              <li>
                <a href="#informasi" className="text-white/70 hover:text-white text-sm transition-colors">
                  Informasi Publik
                </a>
              </li>
              <li>
                <Link to="/login" className="text-white/70 hover:text-white text-sm transition-colors">
                  Login Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Kontak</h4>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-40 bg-white/20" />
                <Skeleton className="h-4 w-32 bg-white/20" />
                <Skeleton className="h-4 w-36 bg-white/20" />
              </div>
            ) : (
              <div className="space-y-3">
                {settings.contact_address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
                    <p className="text-white/70 text-sm whitespace-pre-line">
                      {settings.contact_address}
                    </p>
                  </div>
                )}
                {settings.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-white/60 flex-shrink-0" />
                    <a 
                      href={`tel:${settings.contact_phone.replace(/\s/g, "")}`}
                      className="text-white/70 text-sm hover:text-white transition-colors"
                    >
                      {settings.contact_phone}
                    </a>
                  </div>
                )}
                {settings.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-white/60 flex-shrink-0" />
                    <a 
                      href={`mailto:${settings.contact_email}`}
                      className="text-white/70 text-sm hover:text-white transition-colors"
                    >
                      {settings.contact_email}
                    </a>
                  </div>
                )}
                {!settings.contact_address && !settings.contact_phone && !settings.contact_email && (
                  <p className="text-white/50 text-sm italic">
                    Kontak belum diatur
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-center">
          <p className="text-white/60 text-sm">
            © {currentYear} {settings.site_name || "Portal Digital"}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
