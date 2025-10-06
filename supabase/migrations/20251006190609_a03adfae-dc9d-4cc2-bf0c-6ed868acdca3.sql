-- حذف الجدولة القديمة لحساب المبيعات
SELECT cron.unschedule('calculate-daily-sales');

-- إنشاء جدولة جديدة فقط لحذف السجلات القديمة
-- تعمل يومياً الساعة 3 صباحاً بتوقيت العراق (12 صباحاً UTC)
SELECT cron.schedule(
  'cleanup-old-sales',
  '0 0 * * *',
  $$
  SELECT
    net.http_post(
        url:='https://zqlckixwpyrwdwrsuhsg.supabase.co/functions/v1/calculate-daily-sales',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbGNraXh3cHlyd2R3cnN1aHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwNjc1ODQsImV4cCI6MjA1MjY0MzU4NH0.d_Exb8JAFhXP0vTmQc9fRGXxRh3H7dtyGUb9pLcai44"}'::jsonb,
        body:='{"cleanup_only": true}'::jsonb
    ) as request_id;
  $$
);