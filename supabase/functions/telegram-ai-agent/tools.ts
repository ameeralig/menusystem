// تعريفات الأدوات (Tools) ومنفّذاتها للمساعد الذكي
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
export const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

type Ctx = { userId: string };
type ToolResult = Record<string, unknown>;

// ============ مساعدات داخلية ============
const ok = (data: ToolResult = {}) => ({ ok: true, ...data });
const fail = (error: string, hint?: string) => ({ ok: false, error, ...(hint ? { hint } : {}) });

async function findProduct(userId: string, ref: string) {
  const isUuid = /^[0-9a-f-]{36}$/i.test(ref);
  let q = db.from("products").select("*").eq("user_id", userId);
  q = isUuid ? q.eq("id", ref) : q.ilike("name", `%${ref}%`);
  const { data } = await q.limit(5);
  return data ?? [];
}

async function findCategory(userId: string, ref: string) {
  const isUuid = /^[0-9a-f-]{36}$/i.test(ref);
  let q = db.from("categories").select("*").eq("user_id", userId);
  q = isUuid ? q.eq("id", ref) : q.ilike("name", `%${ref}%`);
  const { data } = await q.limit(5);
  return data ?? [];
}

function startOf(period: string) {
  const now = new Date();
  if (period === "today") return new Date(now.setHours(0, 0, 0, 0));
  if (period === "week") return new Date(Date.now() - 7 * 864e5);
  if (period === "month") return new Date(Date.now() - 30 * 864e5);
  return new Date(0);
}

// ============ مخطط الأدوات المُرسل للنموذج ============
export const TOOL_SCHEMAS = [
  // ----- المنتجات -----
  {
    type: "function",
    function: {
      name: "search_products",
      description: "بحث عن منتجات المستخدم بالاسم أو عرض قائمة المنتجات. استخدمها للتحقق من وجود منتج قبل التعديل أو الحذف.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "نص البحث في اسم المنتج. اتركه فارغاً لعرض الكل" },
          category: { type: "string", description: "اسم التصنيف للفلترة" },
          limit: { type: "number", description: "عدد النتائج (افتراضي 15)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_product",
      description: "إنشاء منتج جديد. لا تستدعِها إلا بعد التأكد من الاسم والسعر.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          price: { type: "number" },
          category: { type: "string", description: "اسم التصنيف" },
          description: { type: "string" },
          discount_percentage: { type: "number", description: "نسبة الخصم 0-100" },
          is_new: { type: "boolean" },
          is_popular: { type: "boolean" },
          image_url: { type: "string" },
        },
        required: ["name", "price"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_product",
      description: "تعديل منتج موجود. مرّر فقط الحقول المراد تغييرها.",
      parameters: {
        type: "object",
        properties: {
          product: { type: "string", description: "اسم المنتج أو معرّفه" },
          name: { type: "string" },
          price: { type: "number" },
          description: { type: "string" },
          category: { type: "string" },
          discount_percentage: { type: "number" },
          original_price: { type: "number" },
          is_new: { type: "boolean" },
          is_popular: { type: "boolean" },
          is_available: { type: "boolean" },
        },
        required: ["product"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_product",
      description: "حذف منتج نهائياً. عملية خطرة: يجب أن يؤكد المستخدم أولاً ثم مرّر confirmed=true.",
      parameters: {
        type: "object",
        properties: {
          product: { type: "string" },
          confirmed: { type: "boolean" },
        },
        required: ["product"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "duplicate_product",
      description: "نسخ منتج موجود باسم جديد.",
      parameters: {
        type: "object",
        properties: { product: { type: "string" }, new_name: { type: "string" } },
        required: ["product"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "request_product_image",
      description: "اطلب من المستخدم إرسال صورة لمنتج معيّن. تُفعّل وضع انتظار الصورة.",
      parameters: {
        type: "object",
        properties: { product: { type: "string" } },
        required: ["product"],
      },
    },
  },

  // ----- التصنيفات -----
  {
    type: "function",
    function: {
      name: "list_categories",
      description: "عرض كل تصنيفات المتجر.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "create_category",
      description: "إنشاء تصنيف جديد.",
      parameters: { type: "object", properties: { name: { type: "string" } }, required: ["name"] },
    },
  },
  {
    type: "function",
    function: {
      name: "rename_category",
      description: "إعادة تسمية تصنيف.",
      parameters: {
        type: "object",
        properties: { category: { type: "string" }, new_name: { type: "string" } },
        required: ["category", "new_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_category",
      description: "حذف تصنيف. عملية خطرة: تتطلب confirmed=true بعد موافقة المستخدم.",
      parameters: {
        type: "object",
        properties: { category: { type: "string" }, confirmed: { type: "boolean" } },
        required: ["category"],
      },
    },
  },

  // ----- الطلبات -----
  {
    type: "function",
    function: {
      name: "list_orders",
      description: "عرض آخر الطلبات مع الإجماليات.",
      parameters: {
        type: "object",
        properties: {
          period: { type: "string", enum: ["today", "week", "month", "all"] },
          limit: { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "complete_order",
      description: "وضع علامة اكتمال على طلب معيّن برقم معرّفه.",
      parameters: { type: "object", properties: { order_id: { type: "string" } }, required: ["order_id"] },
    },
  },
  {
    type: "function",
    function: {
      name: "cancel_order",
      description: "إلغاء (حذف) طلب. عملية خطرة: تتطلب confirmed=true.",
      parameters: {
        type: "object",
        properties: { order_id: { type: "string" }, confirmed: { type: "boolean" } },
        required: ["order_id"],
      },
    },
  },

  // ----- الموظفين -----
  {
    type: "function",
    function: {
      name: "list_employees",
      description: "عرض موظفي المتجر.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "set_employee_status",
      description: "تفعيل أو تعطيل موظف.",
      parameters: {
        type: "object",
        properties: { employee: { type: "string" }, is_active: { type: "boolean" } },
        required: ["employee", "is_active"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_employee_permissions",
      description: "تعديل صلاحيات موظف (إضافة/تعديل/حذف المنتجات).",
      parameters: {
        type: "object",
        properties: {
          employee: { type: "string" },
          can_add_products: { type: "boolean" },
          can_edit_products: { type: "boolean" },
          can_delete_products: { type: "boolean" },
        },
        required: ["employee"],
      },
    },
  },

  // ----- الإحصائيات -----
  {
    type: "function",
    function: {
      name: "get_analytics",
      description: "ملخص إحصائيات المتجر: المبيعات، عدد الطلبات، أفضل المنتجات، عدد الزبائن.",
      parameters: {
        type: "object",
        properties: { period: { type: "string", enum: ["today", "week", "month", "all"] } },
      },
    },
  },

  // ----- الإعدادات -----
  {
    type: "function",
    function: {
      name: "get_store_settings",
      description: "قراءة إعدادات المتجر الحالية.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "update_store_settings",
      description: "تعديل إعدادات المتجر (الاسم، الوضع الليلي، القالب، رسوم التوصيل، تفعيل الطلبات الخارجية...).",
      parameters: {
        type: "object",
        properties: {
          store_name: { type: "string" },
          dark_mode: { type: "boolean" },
          template: { type: "string" },
          delivery_fee: { type: "number" },
          external_orders_enabled: { type: "boolean" },
          employee_system_enabled: { type: "boolean" },
          stories_enabled: { type: "boolean" },
          ai_assistant_name: { type: "string" },
        },
      },
    },
  },
];

// ============ المنفّذات ============
export async function runTool(name: string, args: any, ctx: Ctx): Promise<ToolResult> {
  const uid = ctx.userId;
  try {
    switch (name) {
      // ---------- المنتجات ----------
      case "search_products": {
        let q = db.from("products")
          .select("id,name,price,category,is_available,discount_percentage,image_url")
          .eq("user_id", uid)
          .limit(Math.min(args?.limit ?? 15, 30));
        if (args?.query) q = q.ilike("name", `%${args.query}%`);
        if (args?.category) q = q.ilike("category", `%${args.category}%`);
        const { data, error } = await q;
        if (error) return fail(error.message);
        return ok({ count: data?.length ?? 0, products: data });
      }

      case "create_product": {
        if (!args?.name || args?.price == null) return fail("MissingFields", "الاسم والسعر مطلوبان");
        if (Number(args.price) <= 0) return fail("InvalidPrice", "السعر يجب أن يكون أكبر من صفر");
        const disc = args.discount_percentage;
        if (disc != null && (disc < 0 || disc > 100)) return fail("InvalidDiscount", "الخصم بين 0 و 100");

        const dup = await findProduct(uid, args.name);
        if (dup.some((p: any) => p.name.trim().toLowerCase() === String(args.name).trim().toLowerCase()))
          return fail("DuplicateProduct", "منتج بنفس الاسم موجود مسبقاً — هل تريد تعديله؟");

        let categoryId: string | null = null;
        let categoryName: string | null = null;
        if (args.category) {
          const cats = await findCategory(uid, args.category);
          if (cats.length === 0) return fail("CategoryNotFound", `التصنيف "${args.category}" غير موجود — هل أنشئه؟`);
          categoryId = cats[0].id;
          categoryName = cats[0].name;
        }

        const { data, error } = await db.from("products").insert({
          user_id: uid,
          name: args.name,
          price: args.price,
          description: args.description ?? null,
          category_id: categoryId,
          category: categoryName,
          discount_percentage: disc ?? null,
          is_new: args.is_new ?? false,
          is_popular: args.is_popular ?? false,
          image_url: args.image_url ?? null,
          is_available: true,
        }).select("id,name,price,category").single();
        if (error) return fail(error.message);
        return ok({ product: data, message: "تم إنشاء المنتج" });
      }

      case "update_product": {
        const found = await findProduct(uid, args.product);
        if (found.length === 0) return fail("ProductNotFound", `لا يوجد منتج باسم "${args.product}"`);
        if (found.length > 1) return fail("AmbiguousProduct", `وجدت عدة منتجات: ${found.map((p: any) => p.name).join("، ")}`);
        const p = found[0];

        const patch: Record<string, unknown> = {};
        if (args.name != null) patch.name = args.name;
        if (args.price != null) {
          if (args.price <= 0) return fail("InvalidPrice", "السعر يجب أن يكون أكبر من صفر");
          patch.price = args.price;
        }
        if (args.description != null) patch.description = args.description;
        if (args.discount_percentage != null) {
          if (args.discount_percentage < 0 || args.discount_percentage > 100)
            return fail("InvalidDiscount", "الخصم بين 0 و 100");
          patch.discount_percentage = args.discount_percentage;
        }
        if (args.original_price != null) patch.original_price = args.original_price;
        if (args.is_new != null) patch.is_new = args.is_new;
        if (args.is_popular != null) patch.is_popular = args.is_popular;
        if (args.is_available != null) patch.is_available = args.is_available;
        if (args.category != null) {
          const cats = await findCategory(uid, args.category);
          if (cats.length === 0) return fail("CategoryNotFound", `التصنيف "${args.category}" غير موجود — هل أنشئه؟`);
          patch.category_id = cats[0].id;
          patch.category = cats[0].name;
        }
        if (Object.keys(patch).length === 0) return fail("NothingToUpdate", "لم تحدد أي حقل للتعديل");

        const { data, error } = await db.from("products").update(patch)
          .eq("id", p.id).eq("user_id", uid)
          .select("id,name,price,category,is_available,discount_percentage").single();
        if (error) return fail(error.message);
        return ok({ product: data, message: "تم التعديل" });
      }

      case "delete_product": {
        const found = await findProduct(uid, args.product);
        if (found.length === 0) return fail("ProductNotFound", `لا يوجد منتج باسم "${args.product}"`);
        if (found.length > 1) return fail("AmbiguousProduct", `وجدت: ${found.map((p: any) => p.name).join("، ")} — حدّد أيهم`);
        if (!args.confirmed)
          return { ok: false, needs_confirmation: true, action: "delete_product", target: found[0].name, id: found[0].id };
        const { error } = await db.from("products").delete().eq("id", found[0].id).eq("user_id", uid);
        if (error) return fail(error.message);
        return ok({ message: `تم حذف "${found[0].name}"` });
      }

      case "duplicate_product": {
        const found = await findProduct(uid, args.product);
        if (found.length === 0) return fail("ProductNotFound");
        const p = found[0];
        const { data, error } = await db.from("products").insert({
          user_id: uid,
          name: args.new_name ?? `${p.name} (نسخة)`,
          price: p.price,
          description: p.description,
          category: p.category,
          category_id: p.category_id,
          image_url: p.image_url,
          discount_percentage: p.discount_percentage,
          is_available: true,
        }).select("id,name,price").single();
        if (error) return fail(error.message);
        return ok({ product: data, message: "تم النسخ" });
      }

      case "request_product_image": {
        const found = await findProduct(uid, args.product);
        if (found.length === 0) return fail("ProductNotFound", `لا يوجد منتج باسم "${args.product}"`);
        return ok({ awaiting_image_for: found[0].id, product_name: found[0].name, message: "بانتظار الصورة" });
      }

      // ---------- التصنيفات ----------
      case "list_categories": {
        const { data } = await db.from("categories").select("id,name").eq("user_id", uid).order("name");
        return ok({ count: data?.length ?? 0, categories: data });
      }

      case "create_category": {
        const exists = await findCategory(uid, args.name);
        if (exists.some((c: any) => c.name.trim().toLowerCase() === String(args.name).trim().toLowerCase()))
          return fail("DuplicateCategory", "التصنيف موجود مسبقاً");
        const { data, error } = await db.from("categories")
          .insert({ user_id: uid, name: args.name, image_url: args.image_url ?? "" }).select("id,name").single();
        if (error) return fail(error.message);
        return ok({ category: data, message: "تم إنشاء التصنيف" });
      }

      case "rename_category": {
        const cats = await findCategory(uid, args.category);
        if (cats.length === 0) return fail("CategoryNotFound");
        const { error } = await db.from("categories").update({ name: args.new_name })
          .eq("id", cats[0].id).eq("user_id", uid);
        if (error) return fail(error.message);
        await db.from("products").update({ category: args.new_name })
          .eq("category_id", cats[0].id).eq("user_id", uid);
        return ok({ message: `تم تغيير الاسم إلى "${args.new_name}"` });
      }

      case "delete_category": {
        const cats = await findCategory(uid, args.category);
        if (cats.length === 0) return fail("CategoryNotFound");
        const { count } = await db.from("products")
          .select("id", { count: "exact", head: true })
          .eq("user_id", uid).eq("category_id", cats[0].id);
        if (!args.confirmed)
          return {
            ok: false, needs_confirmation: true, action: "delete_category",
            target: cats[0].name, id: cats[0].id, products_affected: count ?? 0,
          };
        await db.from("products").update({ category_id: null, category: null })
          .eq("category_id", cats[0].id).eq("user_id", uid);
        const { error } = await db.from("categories").delete().eq("id", cats[0].id).eq("user_id", uid);
        if (error) return fail(error.message);
        return ok({ message: `تم حذف التصنيف "${cats[0].name}"` });
      }

      // ---------- الطلبات ----------
      case "list_orders": {
        const since = startOf(args?.period ?? "today").toISOString();
        const { data, error } = await db.from("orders")
          .select("id,customer_name,table_number,final_amount,completed_at,created_at")
          .eq("store_owner_id", uid)
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(Math.min(args?.limit ?? 10, 25));
        if (error) return fail(error.message);
        const total = (data ?? []).reduce((s: number, o: any) => s + Number(o.final_amount ?? 0), 0);
        return ok({ count: data?.length ?? 0, total_amount: total, orders: data });
      }

      case "complete_order": {
        const { data, error } = await db.from("orders")
          .update({ completed_at: new Date().toISOString() })
          .eq("id", args.order_id).eq("store_owner_id", uid).select("id").maybeSingle();
        if (error) return fail(error.message);
        if (!data) return fail("OrderNotFound");
        return ok({ message: "تم إكمال الطلب" });
      }

      case "cancel_order": {
        if (!args.confirmed)
          return { ok: false, needs_confirmation: true, action: "cancel_order", target: args.order_id };
        const { error } = await db.from("orders").delete()
          .eq("id", args.order_id).eq("store_owner_id", uid);
        if (error) return fail(error.message);
        return ok({ message: "تم إلغاء الطلب" });
      }

      // ---------- الموظفين ----------
      case "list_employees": {
        const { data } = await db.from("employees")
          .select("id,full_name,phone,is_active,can_add_products,can_edit_products,can_delete_products")
          .eq("store_owner_id", uid);
        return ok({ count: data?.length ?? 0, employees: data });
      }

      case "set_employee_status":
      case "set_employee_permissions": {
        const { data: emps } = await db.from("employees").select("id,full_name")
          .eq("store_owner_id", uid).ilike("full_name", `%${args.employee}%`).limit(5);
        if (!emps || emps.length === 0) return fail("EmployeeNotFound");
        if (emps.length > 1) return fail("AmbiguousEmployee", emps.map((e: any) => e.full_name).join("، "));
        const patch: Record<string, unknown> = {};
        for (const k of ["is_active", "can_add_products", "can_edit_products", "can_delete_products"]) {
          if (args[k] != null) patch[k] = args[k];
        }
        if (Object.keys(patch).length === 0) return fail("NothingToUpdate");
        const { error } = await db.from("employees").update(patch)
          .eq("id", emps[0].id).eq("store_owner_id", uid);
        if (error) return fail(error.message);
        return ok({ message: `تم تحديث ${emps[0].full_name}` });
      }

      // ---------- الإحصائيات ----------
      case "get_analytics": {
        const period = args?.period ?? "today";
        const since = startOf(period).toISOString();
        const [prodRes, catRes, ordRes, viewRes] = await Promise.all([
          db.from("products").select("id", { count: "exact", head: true }).eq("user_id", uid),
          db.from("categories").select("id", { count: "exact", head: true }).eq("user_id", uid),
          db.from("orders").select("id,final_amount,created_at").eq("store_owner_id", uid).gte("created_at", since),
          db.from("page_views").select("view_count").eq("user_id", uid).maybeSingle(),
        ]);
        const orders = ordRes.data ?? [];
        const sales = orders.reduce((s: number, o: any) => s + Number(o.final_amount ?? 0), 0);
        // أفضل المنتجات — مقيّدة بطلبات هذا المتجر فقط
        const orderIds = orders.map((o: any) => o.id).slice(0, 300);
        const { data: items } = orderIds.length
          ? await db.from("order_items").select("product_name,quantity").in("order_id", orderIds).limit(1000)
          : { data: [] as any[] };
        const tally: Record<string, number> = {};
        for (const it of items ?? []) {
          if (!it?.product_name) continue;
          tally[it.product_name] = (tally[it.product_name] ?? 0) + Number(it.quantity ?? 1);
        }
        const top = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 5)
          .map(([name, qty]) => ({ name, qty }));
        return ok({
          period,
          products_count: prodRes.count ?? 0,
          categories_count: catRes.count ?? 0,
          orders_count: orders.length,
          total_sales: sales,
          average_order_value: orders.length ? Math.round(sales / orders.length) : 0,
          page_views: viewRes.data?.view_count ?? 0,
          best_selling: top,
        });
      }

      // ---------- الإعدادات ----------
      case "get_store_settings": {
        const { data } = await db.from("store_settings").select("*").eq("user_id", uid).maybeSingle();
        if (!data) return fail("SettingsNotFound");
        const { id: _i, user_id: _u, ...rest } = data as any;
        return ok({ settings: rest });
      }

      case "update_store_settings": {
        const allowed = [
          "store_name", "dark_mode", "template", "delivery_fee",
          "external_orders_enabled", "employee_system_enabled", "stories_enabled", "ai_assistant_name",
        ];
        const patch: Record<string, unknown> = {};
        for (const k of allowed) if (args?.[k] != null) patch[k] = args[k];
        if (Object.keys(patch).length === 0) return fail("NothingToUpdate");
        const { error } = await db.from("store_settings").update(patch).eq("user_id", uid);
        if (error) return fail(error.message);
        return ok({ updated: patch, message: "تم تحديث الإعدادات" });
      }

      default:
        return fail("UnknownTool", name);
    }
  } catch (e: any) {
    console.error("runTool error", name, e);
    return fail(e?.message ?? "UnexpectedError");
  }
}
