import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if menus already exist
    const { data: existingMenus, error: checkError } = await supabase
      .from("menus")
      .select("id")
      .limit(1);

    if (checkError) throw checkError;

    if (existingMenus && existingMenus.length > 0) {
      return new Response(
        JSON.stringify({ message: "Menu sudah ada, tidak perlu seed ulang", count: existingMenus.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Seed header menus
    const headerMenus = [
      { name: "Beranda", slug: "beranda", url: "/", icon: "Home", display_order: 0, is_active: true, target: "_self", location: "header" },
      { name: "Profil", slug: "profil", url: "/profil", icon: "Users", display_order: 1, is_active: true, target: "_self", location: "header" },
      { name: "Berita", slug: "berita", url: "/berita", icon: "Newspaper", display_order: 2, is_active: true, target: "_self", location: "header" },
      { name: "Agenda", slug: "agenda", url: "/agenda", icon: "Calendar", display_order: 3, is_active: true, target: "_self", location: "header" },
      { name: "Galeri", slug: "galeri", url: "/galeri", icon: "Image", display_order: 4, is_active: true, target: "_self", location: "header" },
      { name: "Layanan", slug: "layanan", url: "#layanan", icon: "FileText", display_order: 5, is_active: true, target: "_self", location: "header" },
    ];

    const { data: insertedHeader, error: headerError } = await supabase
      .from("menus")
      .insert(headerMenus)
      .select();

    if (headerError) throw headerError;

    // Get Layanan menu ID for submenu
    const layananMenu = insertedHeader?.find(m => m.slug === "layanan");
    
    // Seed submenu for Layanan (nested menu example)
    if (layananMenu) {
      const subMenus = [
        { name: "PTSP Online", slug: "ptsp-online", url: "https://jakevo.jakarta.go.id", icon: "FileText", display_order: 0, is_active: true, target: "_blank", location: "header", parent_id: layananMenu.id },
        { name: "Adminduk", slug: "adminduk", url: "https://alpukat.jakarta.go.id", icon: "Users", display_order: 1, is_active: true, target: "_blank", location: "header", parent_id: layananMenu.id },
        { name: "Pengaduan", slug: "pengaduan", url: "https://lapor.go.id", icon: "Megaphone", display_order: 2, is_active: true, target: "_blank", location: "header", parent_id: layananMenu.id },
      ];

      const { error: subError } = await supabase.from("menus").insert(subMenus);
      if (subError) throw subError;
    }

    // Seed homepage menus (card layanan)
    const homepageMenus = [
      { name: "PTSP Online", slug: "ptsp-online-card", url: "https://jakevo.jakarta.go.id", icon: "FileText", display_order: 0, is_active: true, target: "_blank", location: "homepage" },
      { name: "Adminduk", slug: "adminduk-card", url: "https://alpukat.jakarta.go.id", icon: "Users", display_order: 1, is_active: true, target: "_blank", location: "homepage" },
      { name: "Info Kependudukan", slug: "info-kependudukan", url: "/info-kependudukan", icon: "Building2", display_order: 2, is_active: true, target: "_self", location: "homepage" },
      { name: "Surat Online", slug: "surat-online", url: "/surat-online", icon: "FileSearch", display_order: 3, is_active: true, target: "_self", location: "homepage" },
      { name: "Pengaduan", slug: "pengaduan-card", url: "https://lapor.go.id", icon: "Megaphone", display_order: 4, is_active: true, target: "_blank", location: "homepage" },
      { name: "Regulasi", slug: "regulasi", url: "/regulasi", icon: "Scale", display_order: 5, is_active: true, target: "_self", location: "homepage" },
    ];

    const { error: homepageError } = await supabase.from("menus").insert(homepageMenus);
    if (homepageError) throw homepageError;

    // Seed sidebar menus
    const sidebarMenus = [
      { name: "Informasi Publik", slug: "informasi-publik", url: "/informasi-publik", icon: "Info", display_order: 0, is_active: true, target: "_self", location: "sidebar" },
      { name: "Kontak Kami", slug: "kontak", url: "/kontak", icon: "Phone", display_order: 1, is_active: true, target: "_self", location: "sidebar" },
      { name: "FAQ", slug: "faq", url: "/faq", icon: "FileText", display_order: 2, is_active: true, target: "_self", location: "sidebar" },
    ];

    const { error: sidebarError } = await supabase.from("menus").insert(sidebarMenus);
    if (sidebarError) throw sidebarError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Seed data berhasil ditambahkan",
        counts: {
          header: headerMenus.length,
          submenus: 3,
          homepage: homepageMenus.length,
          sidebar: sidebarMenus.length
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error seeding menus:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});