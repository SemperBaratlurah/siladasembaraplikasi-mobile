-- Create storage bucket for posts (berita, pengumuman, agenda)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for services
INSERT INTO storage.buckets (id, name, public) 
VALUES ('services', 'services', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for site assets (logo, etc)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for posts bucket
CREATE POLICY "Posts images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'posts');

CREATE POLICY "Admins can upload posts images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'posts' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update posts images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'posts' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete posts images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'posts' AND public.has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for services bucket
CREATE POLICY "Services images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'services');

CREATE POLICY "Admins can upload services images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'services' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update services images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'services' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete services images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'services' AND public.has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for avatars bucket
CREATE POLICY "Avatars are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS policies for site-assets bucket
CREATE POLICY "Site assets are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'site-assets');

CREATE POLICY "Admins can upload site assets" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site assets" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site assets" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'::app_role));