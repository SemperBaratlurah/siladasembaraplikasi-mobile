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
    const { message, conversationHistory = [] } = await req.json();

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

    const contextData = `
DATA KELURAHAN SEMPER BARAT (Real-time dari Database):

=== LAYANAN TERSEDIA ===
${services?.map(s => `- ${s.name}: ${s.description || 'Tidak ada deskripsi'} ${s.external_url ? `(Link: ${s.external_url})` : ''}`).join('\n') || 'Tidak ada layanan'}

=== BERITA TERBARU ===
${berita.slice(0, 5).map(b => `- ${b.title} (${new Date(b.created_at).toLocaleDateString('id-ID')}): ${b.excerpt || ''}`).join('\n') || 'Tidak ada berita'}

=== PENGUMUMAN TERBARU ===
${pengumuman.slice(0, 5).map(p => `- ${p.title} (${new Date(p.created_at).toLocaleDateString('id-ID')}): ${p.excerpt || ''}`).join('\n') || 'Tidak ada pengumuman'}

=== AGENDA KEGIATAN ===
${agenda.slice(0, 5).map(a => `- ${a.title} - ${a.event_date ? new Date(a.event_date).toLocaleDateString('id-ID') : 'TBA'} ${a.event_location ? `di ${a.event_location}` : ''}`).join('\n') || 'Tidak ada agenda'}

=== HALAMAN INFORMASI ===
${pages?.map(p => `- ${p.title}: ${p.content?.substring(0, 100) || 'Tidak ada konten'}...`).join('\n') || 'Tidak ada halaman'}

=== PENGATURAN SITUS ===
${siteSettings?.map(s => `- ${s.key}: ${typeof s.value === 'string' ? s.value : JSON.stringify(s.value)}`).join('\n') || 'Tidak ada pengaturan'}
`;

    const systemPrompt = `Kamu adalah Asisten AI Kelurahan Semper Barat yang ramah dan membantu. Kamu memiliki akses ke data real-time kelurahan berikut:

${contextData}

Panduan menjawab:
1. Jawab dalam Bahasa Indonesia yang sopan dan ramah
2. Berikan informasi akurat berdasarkan data yang tersedia
3. Jika tidak ada informasi, katakan dengan sopan dan sarankan untuk menghubungi kantor kelurahan
4. Untuk layanan, jelaskan cara mengaksesnya jika ada link
5. Untuk agenda, berikan detail tanggal dan lokasi jika tersedia
6. Jawab singkat, padat, dan jelas
7. Gunakan emoji sesekali untuk keramahan 😊`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: message }
    ];

    console.log("Calling Lovable AI Gateway...");

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
