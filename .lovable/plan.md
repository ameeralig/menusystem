

# خطة إضافة خاصية إيقاف/تشغيل المستخدم مؤقتاً

## الفكرة
إضافة زر تبديل (Switch) مباشر على بطاقة كل مستخدم في لوحة الأدمن يتيح إيقاف وتشغيل المستخدم بسرعة بدون الحاجة لفتح نافذة تأكيد. هذا يختلف عن خاصية "الحظر" الحالية التي تحتاج تأكيد.

## كيف ستعمل الخاصية
- زر تبديل (Switch) على كل بطاقة مستخدم يشبه زر "نظام الموظفين" الموجود حالياً
- عند الإيقاف: يتم تعطيل حساب المستخدم فوراً (لن يستطيع تسجيل الدخول ولن يتم فتح صفحة المعاينه للزوار ويظهر اشعار تم يقاف الخمة من قبل QRM )
- عند التشغيل: يعود الحساب للعمل فوراً
- مع تغيير لون شريط البطاقة العلوي حسب حالة المستخدم (برتقالي = موقف مؤقتاً)

## التغييرات المطلوبة

### 1. تحديث نوع المستخدم (userTypes.ts)
- إضافة حالة `"suspended"` إلى `UserStatus` ليصبح: `"active" | "banned" | "pending" | "suspended"`

### 2. تحديث Edge Function (manage-user/index.ts)
- إضافة إجراء `suspend` جديد: يستخدم `supabase.auth.admin.updateUserById` لتعيين `banned_until` إلى 100 سنة مع حفظ علامة `is_suspended: true` في `user_metadata`
- إضافة إجراء `unsuspend`: يزيل `banned_until` ويحذف علامة `is_suspended` من `user_metadata`
- الفرق عن الحظر: الإيقاف المؤقت يحفظ علامة خاصة في metadata للتمييز بينه وبين الحظر الدائم

### 3. تحديث جلب المستخدمين (useUsers.ts)
- إضافة دالة `toggleUserSuspension` جديدة تستدعي Edge Function بإجراء `suspend` أو `unsuspend`
- تحديث منطق تحديد الحالة: إذا كان `banned_until` موجود و `is_suspended` = true في metadata فالحالة = "suspended"
- تصدير الدالة الجديدة

### 4. تحديث بطاقة المستخدم (UserCard.tsx)
- إضافة قسم جديد يشبه "نظام الموظفين" يحتوي على Switch للإيقاف/التشغيل
- أيقونة `Power` مع نص "حالة الحساب" 
- عند الضغط: يتم التبديل مباشرة بدون نافذة تأكيد
- تحديث `getStatusInfo` لعرض حالة "موقف مؤقتاً" بلون برتقالي
- تحديث لون الشريط العلوي للبطاقة (برتقالي عند الإيقاف)

### 5. تحديث AdminUsersTab.tsx
- تمرير دالة `toggleUserSuspension` إلى UserCard
- إضافة StatCard جديد لعرض عدد المستخدمين الموقوفين مؤقتاً
- إضافة فلتر اختياري لعرض الموقوفين فقط

### 6. تحديث صفحة تفاصيل المستخدم (UserDetailsPage.tsx)
- عرض حالة "موقف مؤقتاً" بشكل صحيح مع Badge برتقالي

## التفاصيل التقنية

### منطق التمييز بين الحظر والإيقاف المؤقت
```text
إذا banned_until موجود:
  ├── إذا user_metadata.is_suspended = true  -->  حالة "موقف مؤقتاً" (برتقالي)
  └── غير ذلك                                 -->  حالة "محظور" (أحمر)
إذا banned_until غير موجود:
  └── حالة "نشط" (أخضر)
```

### الملفات المتأثرة
1. `src/components/admin/users/userTypes.ts` - إضافة حالة suspended
2. `supabase/functions/manage-user/index.ts` - إضافة إجراءات suspend/unsuspend
3. `src/components/admin/users/useUsers.ts` - إضافة دالة التبديل وتحديث منطق الحالة
4. `src/components/admin/users/UserCard.tsx` - إضافة Switch للإيقاف/التشغيل
5. `src/components/admin/AdminUsersTab.tsx` - إحصائية جديدة + تمرير الدالة
6. `src/pages/UserDetailsPage.tsx` - عرض الحالة الجديدة
7. `src/components/admin/users/UserActionDialog.tsx` - لا يحتاج تغيير (الإيقاف بدون dialog)

