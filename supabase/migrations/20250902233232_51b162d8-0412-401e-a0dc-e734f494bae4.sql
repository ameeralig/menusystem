-- جدولة تشغيل دالة تنظيف الملاحظات القديمة يومياً في الساعة 2:00 صباحاً
select
  cron.schedule(
    'cleanup-old-feedback',
    '0 2 * * *', -- يومياً في 2:00 صباحاً
    $$
    select
      net.http_post(
          url:='https://zqlckixwpyrwdwrsuhsg.supabase.co/functions/v1/cleanup-feedback',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbGNraXh3cHlyd2R3cnN1aHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwNjc1ODQsImV4cCI6MjA1MjY0MzU4NH0.d_Exb8JAFhXP0vTmQc9fRGXxRh3H7dtyGUb9pLcai44"}'::jsonb,
          body:='{"scheduled": true}'::jsonb
      ) as request_id;
    $$
  );