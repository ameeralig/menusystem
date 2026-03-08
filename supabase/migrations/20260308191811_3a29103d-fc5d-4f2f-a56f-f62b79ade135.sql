CREATE POLICY "Anyone can view page views"
ON public.page_views FOR SELECT
USING (true);