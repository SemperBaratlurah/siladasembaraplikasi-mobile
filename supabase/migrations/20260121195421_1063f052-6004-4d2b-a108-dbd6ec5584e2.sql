-- Fix RLS policies for statistics_daily and activities_log
-- These need to use security definer functions instead of permissive policies

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can insert activities" ON public.activities_log;
DROP POLICY IF EXISTS "Anyone can insert/update statistics" ON public.statistics_daily;
DROP POLICY IF EXISTS "Anyone can update statistics" ON public.statistics_daily;

-- Create more restrictive policies
-- Activities can only be inserted via the increment_service_click function (security definer)
-- So we don't need a direct insert policy for anonymous users

-- For statistics, only allow reading - inserts/updates happen via security definer functions
CREATE POLICY "Statistics are read-only for public"
ON public.statistics_daily FOR SELECT
USING (true);

-- Admins can directly manage statistics if needed
CREATE POLICY "Admins can manage statistics"
ON public.statistics_daily FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));