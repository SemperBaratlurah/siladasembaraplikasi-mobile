-- Add unique constraint on key column for site_settings upsert
ALTER TABLE public.site_settings ADD CONSTRAINT site_settings_key_unique UNIQUE (key);

-- Insert missing default settings
INSERT INTO public.site_settings (key, value, description) 
VALUES 
  ('theme_mode', '"light"', 'Mode tema (light/dark)'),
  ('theme_font_family', '"Inter"', 'Font family website'),
  ('contact_address', '""', 'Alamat kantor')
ON CONFLICT (key) DO NOTHING;

-- Ensure RLS policies for site_settings allow admin INSERT
DROP POLICY IF EXISTS "Admins can manage settings" ON public.site_settings;
CREATE POLICY "Admins can manage settings" 
ON public.site_settings 
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));