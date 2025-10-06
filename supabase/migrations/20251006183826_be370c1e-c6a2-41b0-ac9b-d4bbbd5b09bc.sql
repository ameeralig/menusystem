-- تفعيل الامتدادات المطلوبة
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- جدولة المهمة لتشغيلها يومياً الساعة 12 صباحاً بتوقيت UTC (3 صباحاً بتوقيت العراق UTC+3)
SELECT cron.schedule(
  'calculate-daily-sales',
  '0 0 * * *', -- كل يوم الساعة 12 صباحاً UTC (3 صباحاً بتوقيت العراق)
  $$
  SELECT
    net.http_post(
        url:='https://zqlckixwpyrwdwrsuhsg.supabase.co/functions/v1/calculate-daily-sales',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbGNraXh3cHlyd2R3cnN1aHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwNjc1ODQsImV4cCI6MjA1MjY0MzU4NH0.d_Exb8JAFhXP0vTmQc9fRGXxRh3H7dtyGUb9pLcai44"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
