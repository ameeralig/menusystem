-- Create table for tracking AI assistant messages
CREATE TABLE IF NOT EXISTS public.customer_ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_owner_id UUID NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_ai_messages ENABLE ROW LEVEL SECURITY;

-- Store owners can view their AI messages
CREATE POLICY "Store owners can view their AI messages"
  ON public.customer_ai_messages
  FOR SELECT
  USING (auth.uid() = store_owner_id);

-- Allow edge function to insert messages
CREATE POLICY "Service role can insert AI messages"
  ON public.customer_ai_messages
  FOR INSERT
  WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX idx_customer_ai_messages_store_owner ON public.customer_ai_messages(store_owner_id);
CREATE INDEX idx_customer_ai_messages_created_at ON public.customer_ai_messages(created_at DESC);