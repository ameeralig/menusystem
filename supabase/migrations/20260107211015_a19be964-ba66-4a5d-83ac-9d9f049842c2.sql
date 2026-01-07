-- Drop existing policies
DROP POLICY IF EXISTS "Only admins can insert shared images" ON public.shared_images;
DROP POLICY IF EXISTS "Only admins can update shared images" ON public.shared_images;
DROP POLICY IF EXISTS "Only admins can delete shared images" ON public.shared_images;

-- Recreate policies using has_role function to avoid recursion issues
CREATE POLICY "Only admins can insert shared images" 
ON public.shared_images 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update shared images" 
ON public.shared_images 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete shared images" 
ON public.shared_images 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));