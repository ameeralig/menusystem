-- Create shared images repository table
CREATE TABLE public.shared_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'عام',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shared_images ENABLE ROW LEVEL SECURITY;

-- Everyone can view shared images
CREATE POLICY "Anyone can view shared images"
ON public.shared_images
FOR SELECT
USING (true);

-- Only admins can insert shared images
CREATE POLICY "Only admins can insert shared images"
ON public.shared_images
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can update shared images
CREATE POLICY "Only admins can update shared images"
ON public.shared_images
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can delete shared images
CREATE POLICY "Only admins can delete shared images"
ON public.shared_images
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create function to increment usage count
CREATE OR REPLACE FUNCTION public.increment_image_usage(image_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.shared_images
  SET usage_count = usage_count + 1
  WHERE id = image_id;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_shared_images_updated_at
BEFORE UPDATE ON public.shared_images
FOR EACH ROW
EXECUTE FUNCTION public.update_employees_updated_at();