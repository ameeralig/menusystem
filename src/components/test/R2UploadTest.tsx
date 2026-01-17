import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { uploadToCloudflareR2, R2UploadResult } from "@/utils/cloudflareR2Upload";
import { dualUpload, DualUploadResult } from "@/utils/dualUpload";
import { CheckCircle, XCircle, Loader2, Upload, Image } from "lucide-react";

/**
 * مكون اختبار رفع الصور إلى Cloudflare R2
 */
export default function R2UploadTest() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [r2Result, setR2Result] = useState<R2UploadResult | null>(null);
  const [dualResult, setDualResult] = useState<DualUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setR2Result(null);
      setDualResult(null);
      setError(null);
    }
  };

  // اختبار الرفع إلى R2 فقط
  const testR2Upload = async () => {
    if (!file) {
      toast.error("اختر ملفاً أولاً");
      return;
    }

    setUploading(true);
    setError(null);
    setR2Result(null);

    try {
      console.log("[Test] بدء اختبار R2 Upload");
      const result = await uploadToCloudflareR2(file, {
        folder: "test",
        userId: "test-user",
      });
      
      console.log("[Test] نتيجة R2:", result);
      setR2Result(result);
      toast.success("تم الرفع إلى R2 بنجاح!");
    } catch (err) {
      console.error("[Test] خطأ:", err);
      setError(err instanceof Error ? err.message : "خطأ غير معروف");
      toast.error("فشل الرفع إلى R2");
    } finally {
      setUploading(false);
    }
  };

  // اختبار الرفع المزدوج
  const testDualUpload = async () => {
    if (!file) {
      toast.error("اختر ملفاً أولاً");
      return;
    }

    setUploading(true);
    setError(null);
    setDualResult(null);

    try {
      console.log("[Test] بدء اختبار Dual Upload");
      const result = await dualUpload(file, {
        bucket: "product-images",
        folder: "test",
        userId: "test-user",
      });
      
      console.log("[Test] نتيجة Dual Upload:", result);
      setDualResult(result);
      toast.success("تم الرفع المزدوج بنجاح!");
    } catch (err) {
      console.error("[Test] خطأ:", err);
      setError(err instanceof Error ? err.message : "خطأ غير معروف");
      toast.error("فشل الرفع المزدوج");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 dir-rtl" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">اختبار رفع Cloudflare R2</h1>
        
        {/* اختيار الملف */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              اختيار الصورة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                الملف: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </CardContent>
        </Card>

        {/* أزرار الاختبار */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={testR2Upload}
            disabled={!file || uploading}
            className="w-full"
            variant="outline"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
            ) : (
              <Upload className="h-4 w-4 ml-2" />
            )}
            اختبار R2 فقط
          </Button>
          
          <Button
            onClick={testDualUpload}
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
            ) : (
              <Upload className="h-4 w-4 ml-2" />
            )}
            اختبار الرفع المزدوج
          </Button>
        </div>

        {/* عرض الخطأ */}
        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">خطأ:</span>
              </div>
              <p className="mt-2 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* نتيجة R2 */}
        {r2Result && (
          <Card className="border-green-500 bg-green-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                نجح الرفع إلى R2!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm">
                <p><strong>الرابط:</strong> <a href={r2Result.url} target="_blank" className="text-blue-500 underline break-all">{r2Result.url}</a></p>
                <p><strong>المفتاح:</strong> {r2Result.key}</p>
                <p><strong>الحجم:</strong> {(r2Result.size / 1024).toFixed(2)} KB</p>
                <p><strong>النوع:</strong> {r2Result.contentType}</p>
              </div>
              {r2Result.url && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">معاينة الصورة:</p>
                  <img 
                    src={r2Result.url} 
                    alt="Uploaded" 
                    className="max-w-full h-auto rounded-lg border"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* نتيجة الرفع المزدوج */}
        {dualResult && (
          <Card className="border-green-500 bg-green-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                نجح الرفع المزدوج!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm">
                <p><strong>رُفع إلى:</strong> {dualResult.uploadedTo.join(" + ")}</p>
                <p><strong>الرابط الأساسي:</strong> <a href={dualResult.primaryUrl} target="_blank" className="text-blue-500 underline break-all">{dualResult.primaryUrl}</a></p>
                {dualResult.supabaseUrl && (
                  <p><strong>رابط Supabase:</strong> <a href={dualResult.supabaseUrl} target="_blank" className="text-blue-500 underline break-all">{dualResult.supabaseUrl}</a></p>
                )}
                {dualResult.r2Url && (
                  <p><strong>رابط R2:</strong> <a href={dualResult.r2Url} target="_blank" className="text-blue-500 underline break-all">{dualResult.r2Url}</a></p>
                )}
                <p><strong>الحجم:</strong> {(dualResult.fileSize / 1024).toFixed(2)} KB</p>
              </div>
              {dualResult.primaryUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">معاينة الصورة:</p>
                  <img 
                    src={dualResult.primaryUrl} 
                    alt="Uploaded" 
                    className="max-w-full h-auto rounded-lg border"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
