import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  HardDrive, 
  FileImage, 
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Eye,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BucketStats {
  bucket: string
  totalFiles: number
  totalSize: number
  orphanedCount: number
  orphanedSize: number
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

const bucketNames: Record<string, string> = {
  'product-images': 'صور المنتجات',
  'banners': 'البنرات',
  'avatars': 'الصور الشخصية',
  'store_assets': 'أصول المتجر'
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function StorageManagementTab() {
  const [stats, setStats] = useState<BucketStats[]>([])
  const [loading, setLoading] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [previewResults, setPreviewResults] = useState<CleanupResult[] | null>(null)
  const [lastCleanup, setLastCleanup] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchStats = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('غير مسجل الدخول')

      const { data, error } = await supabase.functions.invoke('cleanup-orphaned-files', {
        body: { action: 'stats' },
        headers: { Authorization: `Bearer ${session.access_token}` }
      })

      if (error) throw error
      if (data.stats) setStats(data.stats)
    } catch (error: any) {
      console.error('خطأ في جلب الإحصائيات:', error)
      toast({
        title: "خطأ",
        description: error.message || "فشل في جلب إحصائيات التخزين",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const previewOrphaned = async () => {
    setPreviewing(true)
    setPreviewResults(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('غير مسجل الدخول')

      const { data, error } = await supabase.functions.invoke('cleanup-orphaned-files', {
        body: { action: 'cleanup', dryRun: true },
        headers: { Authorization: `Bearer ${session.access_token}` }
      })

      if (error) throw error
      setPreviewResults(data.results)
      
      toast({
        title: "تم المعاينة",
        description: `تم العثور على ${data.totalOrphaned} ملف يتيم (${formatBytes(data.totalFreedSpace)})`,
      })
    } catch (error: any) {
      console.error('خطأ في المعاينة:', error)
      toast({
        title: "خطأ",
        description: error.message || "فشل في معاينة الملفات اليتيمة",
        variant: "destructive"
      })
    } finally {
      setPreviewing(false)
    }
  }

  const performCleanup = async () => {
    setCleaning(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('غير مسجل الدخول')

      const { data, error } = await supabase.functions.invoke('cleanup-orphaned-files', {
        body: { action: 'cleanup', dryRun: false },
        headers: { Authorization: `Bearer ${session.access_token}` }
      })

      if (error) throw error
      
      setLastCleanup(new Date().toISOString())
      setPreviewResults(null)
      
      toast({
        title: "تم التنظيف بنجاح",
        description: `تم حذف ${data.totalDeleted} ملف وتحرير ${formatBytes(data.totalFreedSpace)}`,
      })
      
      // تحديث الإحصائيات
      await fetchStats()
    } catch (error: any) {
      console.error('خطأ في التنظيف:', error)
      toast({
        title: "خطأ",
        description: error.message || "فشل في تنظيف الملفات اليتيمة",
        variant: "destructive"
      })
    } finally {
      setCleaning(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const totalFiles = stats.reduce((sum, s) => sum + s.totalFiles, 0)
  const totalSize = stats.reduce((sum, s) => sum + s.totalSize, 0)
  const totalOrphaned = stats.reduce((sum, s) => sum + s.orphanedCount, 0)
  const totalOrphanedSize = stats.reduce((sum, s) => sum + s.orphanedSize, 0)

  return (
    <div className="space-y-6">
      {/* ملخص عام */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" />
              إجمالي التخزين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(totalSize)}</div>
            <p className="text-xs text-muted-foreground">{totalFiles} ملف</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileImage className="h-4 w-4 text-blue-500" />
              الملفات المستخدمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFiles - totalOrphaned}</div>
            <p className="text-xs text-muted-foreground">{formatBytes(totalSize - totalOrphanedSize)}</p>
          </CardContent>
        </Card>

        <Card className={totalOrphaned > 0 ? "border-destructive/50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 ${totalOrphaned > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
              ملفات يتيمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalOrphaned > 0 ? 'text-destructive' : ''}`}>
              {totalOrphaned}
            </div>
            <p className="text-xs text-muted-foreground">{formatBytes(totalOrphanedSize)} يمكن تحريرها</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              آخر تنظيف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {lastCleanup 
                ? new Date(lastCleanup).toLocaleDateString('ar-SA', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'لم يتم بعد'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أزرار الإجراءات */}
      <div className="flex flex-wrap gap-3">
        <Button 
          variant="outline" 
          onClick={fetchStats}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <RefreshCw className="h-4 w-4 ml-2" />}
          تحديث الإحصائيات
        </Button>

        <Button 
          variant="outline" 
          onClick={previewOrphaned}
          disabled={previewing || loading}
        >
          {previewing ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Eye className="h-4 w-4 ml-2" />}
          معاينة الملفات اليتيمة
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              disabled={totalOrphaned === 0 || cleaning}
            >
              {cleaning ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Trash2 className="h-4 w-4 ml-2" />}
              حذف الملفات اليتيمة
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد حذف الملفات اليتيمة</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>هل أنت متأكد من حذف جميع الملفات اليتيمة؟</p>
                <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                  <p className="font-semibold text-destructive">سيتم حذف:</p>
                  <ul className="list-disc list-inside text-sm mt-1">
                    <li>{totalOrphaned} ملف</li>
                    <li>{formatBytes(totalOrphanedSize)} من المساحة</li>
                  </ul>
                </div>
                <p className="text-xs text-muted-foreground">
                  ⚠️ هذا الإجراء لا يمكن التراجع عنه
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={performCleanup} className="bg-destructive hover:bg-destructive/90">
                حذف نهائي
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Separator />

      {/* تفاصيل كل bucket */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((bucket) => {
          const usagePercent = bucket.totalSize > 0 
            ? ((bucket.totalSize - bucket.orphanedSize) / bucket.totalSize) * 100 
            : 0
          
          return (
            <motion.div
              key={bucket.bucket}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      {bucketNames[bucket.bucket] || bucket.bucket}
                    </CardTitle>
                    {bucket.orphanedCount > 0 ? (
                      <Badge variant="destructive" className="text-xs">
                        {bucket.orphanedCount} يتيم
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                        <CheckCircle2 className="h-3 w-3 ml-1" />
                        نظيف
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs">
                    {bucket.totalFiles} ملف • {formatBytes(bucket.totalSize)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>المستخدم</span>
                      <span>{formatBytes(bucket.totalSize - bucket.orphanedSize)}</span>
                    </div>
                    <Progress value={usagePercent} className="h-2" />
                  </div>
                  
                  {bucket.orphanedCount > 0 && (
                    <div className="text-xs text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {formatBytes(bucket.orphanedSize)} يمكن تحريرها
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* نتائج المعاينة */}
      <AnimatePresence>
        {previewResults && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  معاينة الملفات اليتيمة
                </CardTitle>
                <CardDescription>
                  قائمة الملفات التي سيتم حذفها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-auto space-y-2">
                  {previewResults.map((result) => (
                    result.files && result.files.length > 0 && (
                      <div key={result.bucket} className="space-y-1">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <Database className="h-3 w-3" />
                          {bucketNames[result.bucket] || result.bucket}
                          <Badge variant="outline" className="text-xs">
                            {result.files.length} ملف
                          </Badge>
                        </h4>
                        <div className="grid gap-1 pr-4">
                          {result.files.slice(0, 10).map((file, idx) => (
                            <div 
                              key={idx} 
                              className="text-xs text-muted-foreground flex justify-between bg-muted/50 p-1.5 rounded"
                            >
                              <span className="truncate max-w-[70%]">{file.path}</span>
                              <span>{formatBytes(file.size)}</span>
                            </div>
                          ))}
                          {result.files.length > 10 && (
                            <div className="text-xs text-muted-foreground text-center">
                              و {result.files.length - 10} ملف آخر...
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
