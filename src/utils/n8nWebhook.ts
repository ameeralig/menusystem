import { supabase } from "@/integrations/supabase/client";

interface ProductData {
  id?: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  is_new?: boolean;
  is_popular?: boolean;
}

interface WebhookPayload {
  event: "product_added" | "product_updated";
  timestamp: string;
  product: ProductData;
  store_info?: {
    store_name?: string;
    slug?: string;
  };
}

/**
 * إرسال webhook إلى n8n عند إضافة أو تعديل منتج
 */
export const sendN8nWebhook = async (
  eventType: "product_added" | "product_updated",
  productData: ProductData,
  userId: string
): Promise<boolean> => {
  try {
    // جلب webhook URL من إعدادات المتجر
    const { data: settings, error: settingsError } = await supabase
      .from("store_settings")
      .select("n8n_webhook_url, store_name, slug")
      .eq("user_id", userId)
      .maybeSingle();

    if (settingsError) {
      console.error("خطأ في جلب إعدادات المتجر:", settingsError);
      return false;
    }

    // إذا لم يكن هناك webhook URL، لا نفعل شيء
    if (!settings?.n8n_webhook_url) {
      console.log("لا يوجد webhook URL محفوظ");
      return false;
    }

    // إعداد البيانات المرسلة
    const payload: WebhookPayload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      product: productData,
      store_info: {
        store_name: settings.store_name || undefined,
        slug: settings.slug || undefined,
      },
    };

    console.log("إرسال webhook إلى n8n:", payload);

    // إرسال الطلب إلى n8n
    const response = await fetch(settings.n8n_webhook_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // للتعامل مع CORS
      body: JSON.stringify(payload),
    });

    console.log("تم إرسال webhook بنجاح");
    return true;
  } catch (error) {
    console.error("خطأ في إرسال webhook:", error);
    return false;
  }
};