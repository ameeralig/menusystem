
-- السماح للجميع بقراءة إحصائيات النظام (للصفحة الرئيسية)
CREATE POLICY "Anyone can view system stats"
ON public.system_stats
FOR SELECT
USING (true);
