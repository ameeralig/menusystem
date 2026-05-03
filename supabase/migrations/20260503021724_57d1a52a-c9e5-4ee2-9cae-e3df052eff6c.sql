-- Toggle for stories feature
ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS stories_enabled boolean DEFAULT true;

ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS stories_auto_generate boolean DEFAULT true;

-- Stories table
CREATE TABLE IF NOT EXISTS public.product_stories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_owner_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'product',
  product_id uuid,
  image_url text NOT NULL,
  title text,
  caption text,
  link_url text,
  display_order integer DEFAULT 0,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_stories_owner ON public.product_stories(store_owner_id);
CREATE INDEX IF NOT EXISTS idx_product_stories_expires ON public.product_stories(expires_at);

ALTER TABLE public.product_stories ENABLE ROW LEVEL SECURITY;

-- Public can view non-expired
CREATE POLICY "Anyone can view active stories"
ON public.product_stories FOR SELECT
USING (expires_at > now());

-- Owner can manage their own
CREATE POLICY "Store owners can manage their stories"
ON public.product_stories FOR ALL
TO authenticated
USING (auth.uid() = store_owner_id)
WITH CHECK (auth.uid() = store_owner_id);

-- Employees with edit permission can manage stories
CREATE POLICY "Edit-permission employees can manage stories"
ON public.product_stories FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.employees e
  WHERE e.user_id = auth.uid()
    AND e.store_owner_id = product_stories.store_owner_id
    AND e.is_active = true
    AND e.can_edit_products = true
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.employees e
  WHERE e.user_id = auth.uid()
    AND e.store_owner_id = product_stories.store_owner_id
    AND e.is_active = true
    AND e.can_edit_products = true
));

-- Admins
CREATE POLICY "Admins manage all stories"
ON public.product_stories FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- updated_at trigger
CREATE TRIGGER product_stories_updated_at
BEFORE UPDATE ON public.product_stories
FOR EACH ROW EXECUTE FUNCTION public.update_orders_updated_at();

-- Cleanup function for expired stories
CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.product_stories
  WHERE expires_at < now() - interval '1 day';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;