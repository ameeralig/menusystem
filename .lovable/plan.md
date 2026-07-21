
# خطة: ربط Telegram وإدارة المنيو الكامله

## نظرة عامة
النظام الحالي يدعم الربط الأساسي فقط (رمز + كلمة مرور). سنُوسّعه ليصبح لوحة تحكم كاملة داخل Telegram لإدارة المنتجات والتصنيفات مع تحسين تجربة الربط.

---

## 1. تحسينات تدفق الربط (`telegram-webhook`)

- إضافة أزرار Inline Keyboard:
  - `/start` → زر "📤 إرسال رمز الربط"
  - بعد الرمز → زر "🔑 إرسال كلمة السر"
- رسائل ترحيب أوضح مع خطوات مرقمة
- بعد النجاح → عرض القائمة الرئيسية مباشرةً (Reply Keyboard دائم)
- ضمان الرد على أي رساله (fallback مع قائمة الأوامر)

---

## 2. القائمة الرئيسية (Reply Keyboard)

يظهر دائماً بعد الربط:
```
📦 المنتجات   |  📂 التصنيفات
➕ إضافة منتج |  📊 الإحصائيات
⚙️ الإعدادات  |  👤 الحساب
❌ تسجيل الخروج
```

---

## 3. إدارة المنتجات

**FSM (Finite State Machine)** يُخزّن في `telegram_bot_sessions.state` + `data JSONB`:

| Feature | Flow |
|---|---|
| عرض | قائمه مقسمة (Pagination 10/صفحه) مع أزرار Inline لكل منتج |
| بحث | حالة `product_search` → استقبال نص → عرض النتائج |
| فلتره | اختر تصنيف من Inline → عرض منتجاته |
| إضافه | Wizard: اسم → سعر → تصنيف → وصف (اختياري) → صوره (اختياري) → تأكيد |
| تعديل | اختر منتج → أزرار (اسم/سعر/وصف/صوره/تفعيل/حذف/نسخ) |
| صوره | استقبال Photo message → تحميل عبر `getFile` → رفع Cloudflare R2 → تحديث `image_url` |
| حذف/نسخ | تأكيد Inline (نعم/لا) |
| ترتيب | تعديل `display_order` عبر أزرار ⬆️⬇️ |

---

## 4. إدارة التصنيفات

- عرض قائمه
- إضافه (اسم → أيقونه اختياريه)
- إعاده تسميه
- حذف (مع تحذير من فقد المنتجات المرتبطه)
- إعاده ترتيب

---

## 5. الإحصائيات

عرض بطاقه نصيه: عدد المنتجات، التصنيفات، الطلبات اليوم/الشهر، أعلى منتج مبيعاً.

---

## 6. الأمان والجلسات

- كل عمليه تتحقق من `telegram_chat_id` → `profiles.id` (Row-Level Ownership)
- جميع عمليات القاعده تستخدم Service Role مع فلتر `user_id = profile.id` صريح
- `telegram_last_activity` يُحدَّث في كل تفاعل
- Rate limiting موجود بالفعل ⇒ نستفيد منه
- `/logout` يمسح الجلسه (لا الربط) ويعيد الترحيب

---

## 7. الملف الشخصي بالموقع

`TelegramLinkSection` موجود ويعرض الحاله. سنضيف:
- **آخر نشاط Telegram** (من `telegram_last_activity`)
- زر **"إعاده الربط"** (يُلغي الحالي ويُولّد جديد بضغطه واحده)

---

## 8. قاعدة البيانات

Migration واحد:
- إضافه `telegram_last_activity TIMESTAMPTZ` إلى `profiles` (إن لم يكن موجوداً)
- توسيع `telegram_bot_sessions` بحقل `data JSONB DEFAULT '{}'` لتخزين حالة الـ Wizard

---

## Technical Details

### الملفات المعدَّله
- `supabase/functions/telegram-webhook/index.ts` — إعاده هيكله كامله كـ Router + FSM
- `supabase/functions/telegram-webhook/handlers/` — تقسيم إلى:
  - `products.ts` — كل عمليات المنتجات
  - `categories.ts` — كل عمليات التصنيفات
  - `stats.ts` — الإحصائيات
  - `keyboards.ts` — تعريفات الأزرار
  - `telegram.ts` — helpers (`sendMessage`, `editMessage`, `downloadPhoto`, `uploadToR2`)
- `src/components/profile/TelegramLinkSection.tsx` — إضافه آخر نشاط + زر إعاده الربط

### الاعتماديات
- استخدام Cloudflare R2 (بيانات الاعتماد متوفره في Secrets)
- Telegram Gateway عبر `LOVABLE_API_KEY` + `TELEGRAM_API_KEY`

### حجم التنفيذ
تنفيذ كامل في جلسه واحده. الـ webhook سيصبح ~500-700 سطر مقسّم على ملفات.

---

هل أبدأ التنفيذ؟
