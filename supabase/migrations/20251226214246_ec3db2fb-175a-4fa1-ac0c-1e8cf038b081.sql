-- جدول سجل أنشطة المستخدمين (أصحاب المتاجر)
CREATE TABLE public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  action_category TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول تحليلات الزوار
CREATE TABLE public.visitor_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_owner_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء فهارس للأداء
CREATE INDEX idx_user_activity_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_created_at ON public.user_activity_logs(created_at DESC);
CREATE INDEX idx_user_activity_action_type ON public.user_activity_logs(action_type);

CREATE INDEX idx_visitor_analytics_store_owner ON public.visitor_analytics(store_owner_id);
CREATE INDEX idx_visitor_analytics_created_at ON public.visitor_analytics(created_at DESC);
CREATE INDEX idx_visitor_analytics_action_type ON public.visitor_analytics(action_type);
CREATE INDEX idx_visitor_analytics_session ON public.visitor_analytics(session_id);

-- تفعيل RLS
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;

-- سياسات user_activity_logs
CREATE POLICY "Users can view their own activity logs"
ON public.user_activity_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs"
ON public.user_activity_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity logs"
ON public.user_activity_logs FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- سياسات visitor_analytics
CREATE POLICY "Anyone can insert visitor analytics"
ON public.visitor_analytics FOR INSERT
WITH CHECK (true);

CREATE POLICY "Store owners can view their visitor analytics"
ON public.visitor_analytics FOR SELECT
TO authenticated
USING (auth.uid() = store_owner_id);

CREATE POLICY "Admins can view all visitor analytics"
ON public.visitor_analytics FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));