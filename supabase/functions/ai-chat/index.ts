import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], stream = false } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch real-time data from Supabase
    const [
      { data: services },
      { data: posts },
      { data: pages },
      { data: menus },
      { data: siteSettings },
      { data: gallery },
    ] = await Promise.all([
      supabase.from("services").select("*").eq("is_active", true),
      supabase.from("posts").select("*").eq("status", "published").order("created_at", { ascending: false }).limit(20),
      supabase.from("pages").select("*").eq("status", "published"),
      supabase.from("menus").select("*").eq("is_active", true),
      supabase.from("site_settings").select("*"),
      supabase.from("gallery").select("*").order("created_at", { ascending: false }).limit(10),
    ]);

    // Build context from Supabase data
    const berita = posts?.filter(p => p.type === "berita") || [];
    const pengumuman = posts?.filter(p => p.type === "pengumuman") || [];
    const agenda = posts?.filter(p => p.type === "agenda") || [];

    // Get site info
    const getSetting = (key: string) => {
      const setting = siteSettings?.find(s => s.key === key);
      return setting?.value || null;
    };

    const siteName = getSetting("site_name") || "Kelurahan Semper Barat";
    const siteAddress = getSetting("address") || "";
    const sitePhone = getSetting("phone") || "";
    const siteEmail = getSetting("email") || "";
    const officeHours = getSetting("office_hours") || "";
    const whatsappNumber = getSetting("whatsapp_number") || "";

    const contextData = `
=== INFORMASI RESMI ${String(siteName).toUpperCase()} ===
(Data real-time dari database - HANYA gunakan informasi ini)

📍 KONTAK & LOKASI:
- Nama: ${siteName}
- Alamat: ${siteAddress || "Tidak tersedia"}
- Telepon: ${sitePhone || "Tidak tersedia"}
- Email: ${siteEmail || "Tidak tersedia"}
- WhatsApp: ${whatsappNumber || "Tidak tersedia"}
- Jam Operasional: ${officeHours || "Tidak tersedia"}

📋 LAYANAN TERSEDIA (${services?.length || 0} layanan):
${services?.map(s => `• ${s.name}${s.description ? `: ${s.description}` : ''}${s.external_url ? ` [Link: ${s.external_url}]` : ''}`).join('\n') || '(Tidak ada layanan terdaftar)'}

📰 BERITA TERBARU (${berita.length} berita):
${berita.slice(0, 5).map(b => `• "${b.title}" (${new Date(b.created_at).toLocaleDateString('id-ID')})${b.excerpt ? `: ${b.excerpt}` : ''}`).join('\n') || '(Tidak ada berita)'}

📢 PENGUMUMAN AKTIF (${pengumuman.length} pengumuman):
${pengumuman.slice(0, 5).map(p => `• "${p.title}" (${new Date(p.created_at).toLocaleDateString('id-ID')})${p.excerpt ? `: ${p.excerpt}` : ''}`).join('\n') || '(Tidak ada pengumuman)'}

📅 AGENDA KEGIATAN (${agenda.length} agenda):
${agenda.slice(0, 5).map(a => `• "${a.title}" - ${a.event_date ? new Date(a.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Tanggal belum ditentukan'}${a.event_time ? ` pukul ${a.event_time}` : ''}${a.event_location ? ` di ${a.event_location}` : ''}`).join('\n') || '(Tidak ada agenda)'}

📄 HALAMAN INFORMASI:
${pages?.map(p => `• ${p.title}: ${p.content?.substring(0, 150) || '(Tidak ada konten)'}...`).join('\n') || '(Tidak ada halaman)'}

🔗 MENU NAVIGASI:
${menus?.map(m => `• ${m.name}${m.url ? ` (${m.url})` : ''}`).join('\n') || '(Tidak ada menu)'}
`;

    const systemPrompt = `Kamu adalah Asisten AI resmi ${siteName}. 

ATURAN KETAT:
1. HANYA jawab berdasarkan data berikut. JANGAN mengarang atau mengasumsikan informasi yang tidak ada.
2. Jika informasi tidak tersedia dalam data, katakan: "Maaf, informasi tersebut tidak tersedia dalam database kami. Silakan hubungi langsung kantor kelurahan untuk informasi lebih lanjut."
3. Jika ditanya tentang prosedur/persyaratan yang tidak ada dalam data, arahkan ke kantor kelurahan.
4. Jawab dalam Bahasa Indonesia yang sopan dan ramah.
5. Gunakan emoji secukupnya untuk keramahan.
6. Berikan jawaban singkat dan langsung ke poin.

DATA RESMI YANG TERSEDIA:
${contextData}

CONTOH JAWABAN BENAR:
- Jika ditanya layanan: Sebutkan dari daftar layanan di atas
- Jika ditanya alamat: Gunakan alamat dari data kontak
- Jika ditanya berita: Sebutkan dari daftar berita di atas
- Jika ditanya sesuatu yang tidak ada: "Maaf, informasi tersebut tidak tersedia dalam database kami."`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: message }
    ];

    console.log("Calling Lovable AI Gateway...", stream ? "(streaming)" : "(non-streaming)");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: stream,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Terlalu banyak permintaan. Silakan coba lagi nanti." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Kredit AI habis. Silakan hubungi admin." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    // Handle streaming response
    if (stream) {
      console.log("Streaming response started");
      
      const streamHeaders = {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      };

      // Pass through the stream from the AI gateway
      return new Response(response.body, { headers: streamHeaders });
    }

    // Non-streaming response
    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "Maaf, terjadi kesalahan.";

    console.log("AI response received successfully");

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
