-- First, consolidate existing duplicate statistics into single rows per date
-- Create a temp table with aggregated data
CREATE TEMP TABLE temp_stats AS
SELECT 
  date,
  service_id,
  SUM(total_visits) as total_visits,
  SUM(total_clicks) as total_clicks,
  MIN(created_at) as created_at
FROM public.statistics_daily
GROUP BY date, service_id;

-- Delete all existing data
DELETE FROM public.statistics_daily;

-- Re-insert the aggregated data
INSERT INTO public.statistics_daily (date, service_id, total_visits, total_clicks, created_at)
SELECT date, service_id, total_visits, total_clicks, created_at FROM temp_stats;

-- Drop temp table
DROP TABLE temp_stats;

-- Now we need to add a proper unique constraint
-- First drop any existing constraint if it exists
ALTER TABLE public.statistics_daily DROP CONSTRAINT IF EXISTS statistics_daily_date_service_id_key;

-- Add proper unique constraint that handles NULL service_id
CREATE UNIQUE INDEX IF NOT EXISTS statistics_daily_unique_date_service 
ON public.statistics_daily (date, COALESCE(service_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- Update the record_visit function to use proper UPSERT
CREATE OR REPLACE FUNCTION public.record_visit()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.statistics_daily (date, total_visits, total_clicks, service_id)
    VALUES (CURRENT_DATE, 1, 0, NULL)
    ON CONFLICT (date, COALESCE(service_id, '00000000-0000-0000-0000-000000000000'::uuid))
    DO UPDATE SET total_visits = statistics_daily.total_visits + 1;
    
    -- Also log the visit activity
    INSERT INTO public.activities_log (actor_type, action, target_type)
    VALUES ('public', 'visit', 'page');
END;
$$;

-- Update the increment_service_click function to use proper UPSERT
CREATE OR REPLACE FUNCTION public.increment_service_click(service_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    service_name TEXT;
BEGIN
    -- Get service name for activity log
    SELECT name INTO service_name FROM public.services WHERE id = service_id;
    
    -- Update click count on service
    UPDATE public.services SET click_count = click_count + 1 WHERE id = increment_service_click.service_id;
    
    -- Insert or update daily statistics for the service
    INSERT INTO public.statistics_daily (date, total_clicks, total_visits, service_id)
    VALUES (CURRENT_DATE, 1, 0, increment_service_click.service_id)
    ON CONFLICT (date, COALESCE(statistics_daily.service_id, '00000000-0000-0000-0000-000000000000'::uuid))
    DO UPDATE SET total_clicks = statistics_daily.total_clicks + 1;
    
    -- Also update the global daily statistics (service_id = NULL)
    INSERT INTO public.statistics_daily (date, total_clicks, total_visits, service_id)
    VALUES (CURRENT_DATE, 1, 0, NULL)
    ON CONFLICT (date, COALESCE(statistics_daily.service_id, '00000000-0000-0000-0000-000000000000'::uuid))
    DO UPDATE SET total_clicks = statistics_daily.total_clicks + 1;
    
    -- Log the activity
    INSERT INTO public.activities_log (actor_type, action, target_type, target_id, target_title)
    VALUES ('public', 'click', 'service', increment_service_click.service_id, service_name);
END;
$$;