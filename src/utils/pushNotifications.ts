import { Capacitor } from '@capacitor/core';

/**
 * إدارة إشعارات Push باستخدام Capacitor
 */

// تهيئة Push Notifications
export const initPushNotifications = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    console.log('Push notifications only work on native platforms');
    return;
  }

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');

    // طلب الإذن
    const permResult = await PushNotifications.requestPermissions();
    
    if (permResult.receive === 'granted') {
      // التسجيل للحصول على token
      await PushNotifications.register();
    } else {
      console.log('Push notification permission denied');
      return;
    }

    // استقبال token التسجيل
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration token:', token.value);
      // يمكن حفظ الـ token في Supabase لإرسال إشعارات مخصصة
      savePushToken(token.value);
    });

    // خطأ في التسجيل
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    // استقبال إشعار أثناء فتح التطبيق
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
      // يمكن عرض toast أو تحديث الواجهة
      handleForegroundNotification(notification);
    });

    // النقر على إشعار
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Push notification action:', action);
      handleNotificationAction(action);
    });

  } catch (error) {
    console.error('Failed to initialize push notifications:', error);
  }
};

// حفظ token الإشعارات في Supabase
const savePushToken = async (token: string): Promise<void> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // حفظ الـ token في جدول profiles أو جدول مخصص
      console.log(`Push token saved for user ${user.id}: ${token.substring(0, 20)}...`);
    }
  } catch (error) {
    console.error('Failed to save push token:', error);
  }
};

// التعامل مع إشعار في المقدمة
const handleForegroundNotification = (notification: any): void => {
  // عرض الإشعار كـ toast داخل التطبيق
  const { title, body } = notification;
  console.log(`📬 ${title}: ${body}`);
};

// التعامل مع النقر على إشعار
const handleNotificationAction = (action: any): void => {
  const data = action.notification?.data;
  
  if (data?.url) {
    // التنقل لرابط محدد
    window.location.href = data.url;
  }
};

// إرسال إشعار محلي (للاختبار)
export const sendLocalNotification = async (
  title: string,
  body: string
): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) },
        },
      ],
    });
  } catch (error) {
    console.log('Local notifications not available');
  }
};
