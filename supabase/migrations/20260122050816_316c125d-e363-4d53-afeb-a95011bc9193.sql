-- Add location column to menus table for filtering menus by placement
ALTER TABLE public.menus ADD COLUMN IF NOT EXISTS location text DEFAULT 'header';

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_menus_location ON public.menus(location);
CREATE INDEX IF NOT EXISTS idx_menus_is_active ON public.menus(is_active);

-- Update existing RLS policy to allow viewing all active menus (not just by admin)
DROP POLICY IF EXISTS "Anyone can view active menus" ON public.menus;
CREATE POLICY "Anyone can view active menus" 
ON public.menus 
FOR SELECT 
USING (is_active = true);