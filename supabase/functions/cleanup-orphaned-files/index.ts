import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrphanedFile {
  bucket: string
  path: string
  size: number
  created_at: string
}

interface CleanupResult {
  success: boolean
  bucket: string
  totalFiles: number
  orphanedFiles: number
  deletedFiles: number
  freedSpace: number
  errors: string[]
  files?: OrphanedFile[]
}

interface BucketStats {
  bucket: string
  totalFiles: number
  totalSize: number
  orphanedCount: number
  orphanedSize: number
}

// استخراج مسار الملف من URL
function extractPathFromUrl(url: string, bucket: string): string | null {
  try {
    const regex = new RegExp(`/storage/v1/object/public/${bucket}/(.+?)(?:\\?|$)`)
    const match = url.match(regex)
    return match ? decodeURIComponent(match[1]) : null
  } catch {
    return null
  }
}

// جلب جميع URLs المستخدمة من قاعدة البيانات
async function getUsedUrls(supabase: any): Promise<Set<string>> {
  const usedUrls = new Set<string>()
  
  // 1. URLs من جدول products (image_url)
  const { data: products } = await supabase
    .from('products')
    .select('image_url')
    .not('image_url', 'is', null)
  
  if (products) {
    products.forEach((p: any) => {
      if (p.image_url) usedUrls.add(p.image_url)
    })
  }
  
  // 2. URLs من جدول category_images
  const { data: categoryImages } = await supabase
    .from('category_images')
    .select('image_url')
    .not('image_url', 'is', null)
  
  if (categoryImages) {
    categoryImages.forEach((c: any) => {
      if (c.image_url) usedUrls.add(c.image_url)
    })
  }
  
  // 3. URLs من جدول store_settings (banner_url, logo_url)
  const { data: storeSettings } = await supabase
    .from('store_settings')
    .select('banner_url, logo_url')
  
  if (storeSettings) {
    storeSettings.forEach((s: any) => {
      if (s.banner_url) usedUrls.add(s.banner_url)
      if (s.logo_url) usedUrls.add(s.logo_url)
    })
  }
  
  // 4. URLs من جدول profiles (avatar_url)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('avatar_url')
    .not('avatar_url', 'is', null)
  
  if (profiles) {
    profiles.forEach((p: any) => {
      if (p.avatar_url) usedUrls.add(p.avatar_url)
    })
  }
  
  // 5. URLs من جدول categories (image_url)
  const { data: categories } = await supabase
    .from('categories')
    .select('image_url')
    .not('image_url', 'is', null)
  
  if (categories) {
    categories.forEach((c: any) => {
      if (c.image_url) usedUrls.add(c.image_url)
    })
  }
  
  // 6. URLs من جدول shared_images (مستودع الصور المشتركة)
  const { data: sharedImages } = await supabase
    .from('shared_images')
    .select('image_url')
    .not('image_url', 'is', null)
  
  if (sharedImages) {
    sharedImages.forEach((s: any) => {
      if (s.image_url) usedUrls.add(s.image_url)
    })
  }
  
  console.log(`📊 تم العثور على ${usedUrls.size} رابط مستخدم في قاعدة البيانات (شامل ${sharedImages?.length || 0} صورة مشتركة)`)
  return usedUrls
}

// تحويل URLs إلى مسارات ملفات لكل bucket
function urlsToPathsByBucket(urls: Set<string>): Map<string, Set<string>> {
  const buckets = ['product-images', 'banners', 'avatars', 'store_assets', 'صور التصنيفات']
  const pathsByBucket = new Map<string, Set<string>>()
  
  buckets.forEach(bucket => pathsByBucket.set(bucket, new Set()))
  
  urls.forEach(url => {
    for (const bucket of buckets) {
      const path = extractPathFromUrl(url, bucket)
      if (path) {
        pathsByBucket.get(bucket)?.add(path)
        break
      }
    }
  })
  
  return pathsByBucket
}

// جلب جميع الملفات من bucket
async function listAllFilesInBucket(supabase: any, bucket: string): Promise<any[]> {
  const allFiles: any[] = []
  let offset = 0
  const limit = 1000
  
  while (true) {
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list('', {
        limit,
        offset,
        sortBy: { column: 'created_at', order: 'asc' }
      })
    
    if (error) {
      console.error(`❌ خطأ في جلب ملفات ${bucket}:`, error)
      break
    }
    
    if (!files || files.length === 0) break
    
    // جلب الملفات من المجلدات الفرعية
    for (const item of files) {
      if (item.id === null) {
        // هذا مجلد، نحتاج جلب محتوياته
        const subFiles = await listFilesRecursively(supabase, bucket, item.name)
        allFiles.push(...subFiles)
      } else {
        allFiles.push({ ...item, fullPath: item.name })
      }
    }
    
    if (files.length < limit) break
    offset += limit
  }
  
  return allFiles
}

// جلب الملفات من مجلد بشكل متكرر
async function listFilesRecursively(supabase: any, bucket: string, folder: string): Promise<any[]> {
  const allFiles: any[] = []
  let offset = 0
  const limit = 1000
  
  while (true) {
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit,
        offset,
        sortBy: { column: 'created_at', order: 'asc' }
      })
    
    if (error || !files || files.length === 0) break
    
    for (const item of files) {
      const fullPath = `${folder}/${item.name}`
      if (item.id === null) {
        // مجلد فرعي
        const subFiles = await listFilesRecursively(supabase, bucket, fullPath)
        allFiles.push(...subFiles)
      } else {
        allFiles.push({ ...item, fullPath })
      }
    }
    
    if (files.length < limit) break
    offset += limit
  }
  
  return allFiles
}

// تنظيف bucket واحد
async function cleanupBucket(
  supabase: any,
  bucket: string,
  usedPaths: Set<string>,
  dryRun: boolean
): Promise<CleanupResult> {
  const result: CleanupResult = {
    success: true,
    bucket,
    totalFiles: 0,
    orphanedFiles: 0,
    deletedFiles: 0,
    freedSpace: 0,
    errors: [],
    files: dryRun ? [] : undefined
  }
  
  try {
    const files = await listAllFilesInBucket(supabase, bucket)
    result.totalFiles = files.length
    
    console.log(`📁 ${bucket}: تم العثور على ${files.length} ملف`)
    
    const orphanedFiles: OrphanedFile[] = []
    
    for (const file of files) {
      if (!file.fullPath) continue
      
      // التحقق مما إذا كان الملف مستخدماً
      if (!usedPaths.has(file.fullPath)) {
        orphanedFiles.push({
          bucket,
          path: file.fullPath,
          size: file.metadata?.size || 0,
          created_at: file.created_at || ''
        })
      }
    }
    
    result.orphanedFiles = orphanedFiles.length
    result.freedSpace = orphanedFiles.reduce((sum, f) => sum + f.size, 0)
    
    console.log(`🗑️ ${bucket}: ${orphanedFiles.length} ملف يتيم (${(result.freedSpace / 1024 / 1024).toFixed(2)} MB)`)
    
    if (dryRun) {
      result.files = orphanedFiles
      return result
    }
    
    // حذف الملفات اليتيمة على دفعات
    const batchSize = 100
    for (let i = 0; i < orphanedFiles.length; i += batchSize) {
      const batch = orphanedFiles.slice(i, i + batchSize)
      const paths = batch.map(f => f.path)
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove(paths)
      
      if (error) {
        console.error(`❌ خطأ في حذف دفعة من ${bucket}:`, error)
        result.errors.push(`فشل حذف ${paths.length} ملف: ${error.message}`)
      } else {
        result.deletedFiles += paths.length
      }
    }
    
    console.log(`✅ ${bucket}: تم حذف ${result.deletedFiles} ملف`)
    
  } catch (error: any) {
    console.error(`❌ خطأ في معالجة ${bucket}:`, error)
    result.success = false
    result.errors.push(error.message)
  }
  
  return result
}

// الحصول على إحصائيات التخزين
async function getStorageStats(supabase: any, usedPathsByBucket: Map<string, Set<string>>): Promise<BucketStats[]> {
  const buckets = ['product-images', 'banners', 'avatars', 'store_assets']
  const stats: BucketStats[] = []
  
  for (const bucket of buckets) {
    const files = await listAllFilesInBucket(supabase, bucket)
    const usedPaths = usedPathsByBucket.get(bucket) || new Set()
    
    let totalSize = 0
    let orphanedCount = 0
    let orphanedSize = 0
    
    for (const file of files) {
      const size = file.metadata?.size || 0
      totalSize += size
      
      if (file.fullPath && !usedPaths.has(file.fullPath)) {
        orphanedCount++
        orphanedSize += size
      }
    }
    
    stats.push({
      bucket,
      totalFiles: files.length,
      totalSize,
      orphanedCount,
      orphanedSize
    })
  }
  
  return stats
}

Deno.serve(async (req) => {
  // التعامل مع طلبات CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // التحقق من المصادقة
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'غير مصرح' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // إنشاء عميل للتحقق من صلاحيات المستخدم
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey)
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'جلسة غير صالحة' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // التحقق من صلاحية Admin
    const { data: roleData } = await supabaseAuth
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()
    
    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'صلاحيات غير كافية' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // إنشاء عميل مع Service Role للوصول الكامل
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { action, dryRun = true, bucket } = await req.json()
    
    console.log(`🚀 بدء عملية: ${action}, dryRun: ${dryRun}, bucket: ${bucket || 'all'}`)
    
    // جلب جميع URLs المستخدمة
    const usedUrls = await getUsedUrls(supabase)
    const usedPathsByBucket = urlsToPathsByBucket(usedUrls)
    
    if (action === 'stats') {
      // إرجاع إحصائيات التخزين فقط
      const stats = await getStorageStats(supabase, usedPathsByBucket)
      
      return new Response(
        JSON.stringify({ success: true, stats }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (action === 'cleanup') {
      const buckets = bucket 
        ? [bucket] 
        : ['product-images', 'banners', 'avatars', 'store_assets']
      
      const results: CleanupResult[] = []
      
      for (const b of buckets) {
        const usedPaths = usedPathsByBucket.get(b) || new Set()
        const result = await cleanupBucket(supabase, b, usedPaths, dryRun)
        results.push(result)
      }
      
      const summary = {
        success: results.every(r => r.success),
        totalOrphaned: results.reduce((sum, r) => sum + r.orphanedFiles, 0),
        totalDeleted: results.reduce((sum, r) => sum + r.deletedFiles, 0),
        totalFreedSpace: results.reduce((sum, r) => sum + r.freedSpace, 0),
        dryRun,
        results
      }
      
      console.log(`✅ اكتملت العملية:`, summary)
      
      return new Response(
        JSON.stringify(summary),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify({ error: 'إجراء غير معروف' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error: any) {
    console.error('❌ خطأ:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
