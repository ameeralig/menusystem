
-- جدول نتائج الألعاب
CREATE TABLE public.game_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_owner_id uuid NOT NULL,
  game_type text NOT NULL, -- 'memory', 'price_guess', 'bill_payer', 'wheel'
  player_name text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- فهرس للبحث السريع
CREATE INDEX idx_game_scores_store_game ON public.game_scores (store_owner_id, game_type, score DESC);

-- تفعيل RLS
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

-- أي شخص يمكنه إضافة نتيجة
CREATE POLICY "Anyone can insert game scores"
  ON public.game_scores
  FOR INSERT
  WITH CHECK (true);

-- أي شخص يمكنه رؤية النتائج
CREATE POLICY "Anyone can view game scores"
  ON public.game_scores
  FOR SELECT
  USING (true);

-- صاحب المتجر يمكنه حذف نتائج متجره
CREATE POLICY "Store owners can delete their game scores"
  ON public.game_scores
  FOR DELETE
  USING (auth.uid() = store_owner_id);

-- الأدمن يمكنه إدارة كل النتائج
CREATE POLICY "Admins can manage all game scores"
  ON public.game_scores
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));
