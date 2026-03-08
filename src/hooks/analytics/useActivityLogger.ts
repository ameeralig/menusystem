import { supabase } from "@/integrations/supabase/client";

// أنواع أنشطة المستخدمين (أصحاب المتاجر)
export type UserActionType = 
  | 'product_add' | 'product_edit' | 'product_delete'
  | 'category_add' | 'category_edit' | 'category_delete'
  | 'store_settings_update' | 'banner_update' | 'logo_update'
  | 'employee_add' | 'employee_edit' | 'employee_delete'
  | 'table_add' | 'table_edit' | 'table_delete'
  | 'order_create' | 'order_complete' | 'order_cancel'
  | 'login' | 'logout' | 'profile_update';

export type UserActionCategory = 
  | 'products' | 'categories' | 'store' | 'employees' | 'tables' | 'orders' | 'auth' | 'profile';

// أنواع أنشطة الزوار
export type VisitorActionType = 
  | 'page_view' | 'product_view' | 'product_click'
  | 'category_click' | 'add_to_favorites' | 'remove_from_favorites'
  | 'share_menu' | 'share_product' | 'search'
  | 'contact_click' | 'social_link_click' | 'wheel_spin'
  | 'ai_chat' | 'add_to_cart' | 'checkout'
  | 'feedback_submit' | 'feedback_open'
  | 'game_open' | 'game_play' | 'game_complete'
  | 'menu_download' | 'store_info_view'
  | 'banner_click' | 'logo_click'
  | 'search_open' | 'search_query'
  | 'favorites_open' | 'cart_open';

// تسجيل نشاط المستخدم (صاحب المتجر)
export const logUserActivity = async (
  actionType: UserActionType,
  actionCategory: UserActionCategory,
  details: Record<string, any> = {}
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('user_activity_logs').insert({
      user_id: user.id,
      action_type: actionType,
      action_category: actionCategory,
      details
    });
  } catch (error) {
    console.error('Error logging user activity:', error);
  }
};

// الحصول على session ID للزائر
const getVisitorSessionId = (): string => {
  let sessionId = sessionStorage.getItem('visitor_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('visitor_session_id', sessionId);
  }
  return sessionId;
};

// تسجيل نشاط الزائر
export const logVisitorActivity = async (
  storeOwnerId: string,
  actionType: VisitorActionType,
  actionData: Record<string, any> = {}
) => {
  try {
    const sessionId = getVisitorSessionId();
    
    await supabase.from('visitor_analytics').insert({
      store_owner_id: storeOwnerId,
      session_id: sessionId,
      action_type: actionType,
      action_data: actionData
    });
  } catch (error) {
    console.error('Error logging visitor activity:', error);
  }
};

// Hook لتتبع أنشطة الزائر
export const useVisitorTracker = (storeOwnerId: string | null) => {
  const trackAction = (actionType: VisitorActionType, actionData: Record<string, any> = {}) => {
    if (storeOwnerId) {
      logVisitorActivity(storeOwnerId, actionType, actionData);
    }
  };

  return { trackAction };
};
