
# مساعد ذكي شامل لإدارة المنصة عبر Telegram

## الفكرة
تحويل بوت Telegram الحالي من نظام أزرار/FSM إلى **مساعد ذكي يفهم اللغة الطبيعية** (عربي/عراقي/إنجليزي) ويدير كل شيء بالمنصة عن طريق:
- فهم النية (Intent Detection)
- استخراج البيانات (Entity Extraction)
- التحقق من قاعدة البيانات
- طلب فقط الناقص
- تأكيد قبل العمليات الخطرة
- تنفيذ عبر Lovable AI (Gemini) مع Tool Calling

---

## المراحل

### المرحلة 1 — البنية الأساسية للمساعد الذكي
**Edge Function جديد: `telegram-ai-agent`** يستقبل رسائل من `telegram-webhook` ويتعامل معها عبر Lovable AI Gateway + Tool Calling.

- استخدام `google/gemini-2.5-flash` مع `tools` array
- ذاكرة محادثة عبر `telegram_bot_sessions.data` (JSONB)
- توسعة `telegram_bot_sessions` بحقول: `ai_history JSONB`, `pending_action JSONB`

### المرحلة 2 — تعريف الأدوات (Tools) الأساسية
كل قدرة = tool مع JSON Schema:

**المنتجات** (أولوية):
- `search_products(query, category?)`
- `create_product(name, price, category, description?, discount?, is_new?, is_featured?)`
- `update_product(id|name, fields)`
- `delete_product(id|name)` — يتطلب تأكيد
- `toggle_availability(id|name, enabled)`

**التصنيفات**:
- `list_categories()`, `create_category(name)`, `rename_category`, `delete_category` (تأكيد)

**الطلبات**:
- `list_orders(status?, date?)`, `update_order_status(id, status)`, `cancel_order(id)`

**الموظفين**:
- `list_employees()`, `create_employee`, `delete_employee` (تأكيد)

**الإحصائيات**:
- `get_sales(period)`, `get_top_products(limit)`, `get_analytics_summary()`

**الإعدادات**:
- `update_store_setting(key, value)` (اسم، ألوان، ساعات عمل...)

**الصور**:
- عند طلب المنتج صورة، البوت يطلبها ويحفظ الحالة في `pending_action` ثم يرفع لـ R2 عند وصولها.

### المرحلة 3 — منطق التأكيد والتحقق
- كل حذف/تعديل جماعي → رد ذكي "هل تريد التأكيد؟" + أزرار Inline (نعم/لا) وتخزين النية في `pending_action`
- تحقق من الوجود قبل التعديل
- إذا التصنيف غير موجود → يقترح إنشاءه
- تحقق من الخصم (0-100)، السعر (>0)، إلخ

### المرحلة 4 — سير المحادثة متعدد الرسائل
- إذا نقصت معلومة (سعر، تصنيف، صورة) → يسأل عنها فقط
- يتذكر ما تم قوله سابقاً عبر `ai_history` (آخر 20 رسالة)
- يدعم أوامر متعددة برسالة واحدة: "أضف كنافة 10000 حلويات + احذف قهوة عربية" → استدعاء أدوات متعددة

### المرحلة 5 — دمج مع الـ Webhook الحالي
- تحديث `telegram-webhook/index.ts`: عندما تصل رسالة نصية حرة (ليست أمراً محدداً من keyboard) → توجّه لـ `telegram-ai-agent`
- الحفاظ على الأزرار الأساسية (`/start`, `/help`, `/logout`) كـ shortcut
- الصور تُوجّه للمساعد مع `pending_action` النشط

### المرحلة 6 — رسائل ودّية بالعراقي
- system prompt عراقي ودود
- ردود أخطاء بشرية: "التصنيف مو موجود، أسويلك واحد؟"

---

## Technical Details

### ملفات جديدة
- `supabase/functions/telegram-ai-agent/index.ts` — الدماغ (LLM + tools)
- `supabase/functions/telegram-ai-agent/tools.ts` — تعريفات الأدوات + المنفذات
- `supabase/functions/_shared/telegram-helpers.ts` — sendMessage, downloadPhoto, uploadToR2

### ملفات معدلة
- `supabase/functions/telegram-webhook/index.ts` — توجيه الرسائل الحرة والصور للـ agent
- `supabase/config.toml` — إضافة `telegram-ai-agent` (verify_jwt=false)

### قاعدة البيانات
Migration واحد:
- توسعة `telegram_bot_sessions`: `ai_history JSONB DEFAULT '[]'`, `pending_action JSONB`, `updated_at`

### النموذج
`google/gemini-2.5-flash` مع Tool Calling — سريع ورخيص ويدعم عربي ممتاز.

### الأمان
- كل tool ينفّذ باستخدام `user_id` من الجلسة المربوطة فقط (RLS-safe)
- Service Role مع فلتر `user_id` صريح في كل استعلام
- Rate limiting موجود مسبقاً

---

## ملاحظات
- الحجم كبير: ~800-1000 سطر موزعة
- سأنفّذ الأدوات الأساسية (منتجات + تصنيفات + إحصائيات + تأكيد) بالمرحلة الأولى، ثم أوسّع (طلبات + موظفين + إعدادات) بعد تأكيدك.

هل أبدأ التنفيذ؟
