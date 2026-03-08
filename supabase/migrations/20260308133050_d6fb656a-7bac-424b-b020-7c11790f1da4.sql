CREATE POLICY "Anyone can update their own game scores by phone"
ON public.game_scores FOR UPDATE
USING (true)
WITH CHECK (true);