import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Globe, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface SubdomainSetupDialogProps {
  open: boolean;
  onComplete: () => void;
  userId: string;
}

const SubdomainSetupDialog = ({ open, onComplete, userId }: SubdomainSetupDialogProps) => {
  const [slug, setSlug] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // التحقق من توفر النطاق
  const checkSlugAvailability = async (value: string) => {
    if (!value || value.length < 3) {
      setIsAvailable(null);
      setError(value.length > 0 ? "يجب أن يكون النطاق 3 أحرف على الأقل" : null);
      return;
    }

    // التحقق من صحة الأحرف
    const validPattern = /^[a-z0-9-]+$/;
    if (!validPattern.test(value)) {
      setIsAvailable(false);
      setError("يُسمح فقط بالأحرف الإنجليزية الصغيرة والأرقام والشرطة (-)");
      return;
    }

    if (value.includes("--")) {
      setIsAvailable(false);
      setError("لا يُسمح بشرطتين متتاليتين");
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("store_settings")
        .select("slug")
        .eq("slug", value)
        .maybeSingle();

      if (error) throw error;
      
      setIsAvailable(!data);
      if (data) {
        setError("هذا النطاق مستخدم بالفعل");
      }
    } catch (err) {
      console.error("Error checking slug:", err);
      setError("حدث خطأ أثناء التحقق");
    } finally {
      setIsChecking(false);
    }
  };

  // debounce للتحقق
  useEffect(() => {
    const timer = setTimeout(() => {
      if (slug) {
        checkSlugAvailability(slug);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [slug]);

  const handleSave = async () => {
    if (!isAvailable || !slug) return;

    setIsSaving(true);
    try {
      // التحقق من وجود سجل store_settings
      const { data: existingSettings } = await supabase
        .from("store_settings")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingSettings) {
        // تحديث السجل الموجود
        const { error } = await supabase
          .from("store_settings")
          .update({ slug })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // إنشاء سجل جديد
        const { error } = await supabase
          .from("store_settings")
          .insert({ user_id: userId, slug });

        if (error) throw error;
      }

      toast.success("تم حفظ النطاق الفرعي بنجاح!");
      onComplete();
    } catch (err: any) {
      console.error("Error saving slug:", err);
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">إعداد النطاق الفرعي</DialogTitle>
          <DialogDescription className="text-base">
            اختر نطاقًا فرعيًا فريدًا لصفحة متجرك
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* تحذير مهم */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg"
          >
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-600 dark:text-amber-400">تنبيه مهم!</p>
              <p className="text-muted-foreground">النطاق الفرعي لا يمكن تغييره لاحقًا، اختر بعناية.</p>
            </div>
          </motion.div>

          {/* حقل الإدخال */}
          <div className="space-y-2">
            <Label htmlFor="slug">النطاق الفرعي</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  placeholder="my-store"
                  className="pr-10 text-left ltr"
                  dir="ltr"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AnimatePresence mode="wait">
                    {isChecking && (
                      <motion.div
                        key="checking"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </motion.div>
                    )}
                    {!isChecking && isAvailable === true && (
                      <motion.div
                        key="available"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <span className="text-muted-foreground text-sm">.qrmenuc.com</span>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-destructive"
              >
                {error}
              </motion.p>
            )}
            {isAvailable && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-green-500"
              >
                النطاق متاح ✓
              </motion.p>
            )}
          </div>

          {/* معاينة الرابط */}
          {slug && isAvailable && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-muted/50 rounded-lg"
            >
              <p className="text-sm text-muted-foreground mb-1">رابط متجرك سيكون:</p>
              <p className="text-primary font-medium" dir="ltr">
                https://{slug}.qrmenuc.com
              </p>
            </motion.div>
          )}

          <Button
            onClick={handleSave}
            disabled={!isAvailable || isSaving || !slug}
            className="w-full"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                جاري الحفظ...
              </>
            ) : (
              "حفظ والمتابعة"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubdomainSetupDialog;
