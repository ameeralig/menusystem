
-- Admin full access to store_settings
CREATE POLICY "Admins can view all store settings"
ON public.store_settings FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all store settings"
ON public.store_settings FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin full access to products
CREATE POLICY "Admins can manage all products"
ON public.products FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Admin full access to categories
CREATE POLICY "Admins can manage all categories"
ON public.categories FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Admin full access to category_images
CREATE POLICY "Admins can manage all category images"
ON public.category_images FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Admin full access to employees
CREATE POLICY "Admins can manage all employees"
ON public.employees FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Admin full access to orders
CREATE POLICY "Admins can manage all orders"
ON public.orders FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Admin full access to order_items
CREATE POLICY "Admins can manage all order items"
ON public.order_items FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Admin full access to tables
CREATE POLICY "Admins can manage all tables"
ON public.tables FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Admin full access to feedback
CREATE POLICY "Admins can manage all feedback"
ON public.feedback FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Admin full access to profiles
CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Admin full access to page_views
CREATE POLICY "Admins can manage all page views"
ON public.page_views FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Admin full access to notifications
CREATE POLICY "Admins can manage all notifications"
ON public.notifications FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Admin full access to api_keys
CREATE POLICY "Admins can manage all api keys"
ON public.api_keys FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Admin full access to ai_conversations
CREATE POLICY "Admins can manage all ai conversations"
ON public.ai_conversations FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Admin full access to ai_messages
CREATE POLICY "Admins can manage all ai messages"
ON public.ai_messages FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Admin full access to customer_ai_messages
CREATE POLICY "Admins can manage all customer ai messages"
ON public.customer_ai_messages FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Admin full access to employee_daily_sales
CREATE POLICY "Admins can manage all employee daily sales"
ON public.employee_daily_sales FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Admin full access to password_reset_otps
CREATE POLICY "Admins can manage all password reset otps"
ON public.password_reset_otps FOR ALL
USING (public.has_role(auth.uid(), 'admin'));
