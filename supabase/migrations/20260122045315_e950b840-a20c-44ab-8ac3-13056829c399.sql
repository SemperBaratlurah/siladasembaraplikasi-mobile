-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create menus table for CMS menu management
CREATE TABLE IF NOT EXISTS public.menus (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    parent_id UUID REFERENCES public.menus(id) ON DELETE SET NULL,
    url TEXT,
    icon TEXT DEFAULT 'Link',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    target TEXT DEFAULT '_self',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active menus" 
ON public.menus 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage menus" 
ON public.menus 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_menus_updated_at
BEFORE UPDATE ON public.menus
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create site_settings table for system settings
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage settings" 
ON public.site_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.site_settings (key, value, description)
VALUES 
    ('site_name', '"SILADA-SEMBAR"', 'Nama website'),
    ('site_description', '"Sistem Layanan Digital SEMBAR"', 'Deskripsi website'),
    ('contact_email', '"admin@silada.go.id"', 'Email kontak'),
    ('contact_phone', '"+62 xxx xxxx xxxx"', 'Nomor telepon'),
    ('social_facebook', '""', 'Link Facebook'),
    ('social_instagram', '""', 'Link Instagram'),
    ('social_twitter', '""', 'Link Twitter'),
    ('theme_primary_color', '"#006666"', 'Warna utama'),
    ('theme_secondary_color', '"#00A19D"', 'Warna sekunder')
ON CONFLICT (key) DO NOTHING;