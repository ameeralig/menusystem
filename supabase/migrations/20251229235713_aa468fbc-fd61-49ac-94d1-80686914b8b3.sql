-- Enable realtime for visitor_analytics so LiveVisitCounter updates instantly
ALTER TABLE public.visitor_analytics REPLICA IDENTITY FULL;

DO $$
BEGIN
  -- Add to supabase_realtime publication if not already present
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'visitor_analytics'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_analytics;
  END IF;
END $$;