import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, Info } from "lucide-react";
import CustomizationSection from "./CustomizationSection";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingTipsSectionProps {
  loadingTips: string[];
  onLoadingTipsUpdate: (tips: string[]) => Promise<void>;
  isLoading: boolean;
}

const LoadingTipsSection = ({ 
  loadingTips, 
  onLoadingTipsUpdate, 
  isLoading 
}: LoadingTipsSectionProps) => {
  const [newTip, setNewTip] = useState("");
  const [localTips, setLocalTips] = useState<string[]>(loadingTips);

  const handleAddTip = () => {
    if (newTip.trim() && localTips.length < 10) {
      const updatedTips = [...localTips, newTip.trim()];
      setLocalTips(updatedTips);
      setNewTip("");
    }
  };

  const handleRemoveTip = (index: number) => {
    const updatedTips = localTips.filter((_, i) => i !== index);
    setLocalTips(updatedTips);
  };

  const handleSaveTips = async () => {
    await onLoadingTipsUpdate(localTips);
  };

  const hasChanges = JSON.stringify(localTips) !== JSON.stringify(loadingTips);

  return (
    <CustomizationSection
      title="نصائح التحميل"
      icon={<Info className="h-5 w-5" />}
    >
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          أضف نصائح مفيدة تظهر للعملاء أثناء تحميل متجرك (الحد الأقصى 10 نصائح)
        </div>

        {/* إضافة نصيحة جديدة */}
        <div className="space-y-2">
          <Label htmlFor="new-tip">نصيحة جديدة</Label>
          <div className="flex gap-2">
            <Input
              id="new-tip"
              value={newTip}
              onChange={(e) => setNewTip(e.target.value)}
              placeholder="اكتب نصيحة مفيدة للعملاء..."
              maxLength={100}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTip()}
            />
            <Button
              onClick={handleAddTip}
              disabled={!newTip.trim() || localTips.length >= 10}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground text-left">
            {newTip.length}/100 حرف
          </div>
        </div>

        {/* عرض النصائح الحالية */}
        {localTips.length > 0 && (
          <div className="space-y-2">
            <Label>النصائح الحالية ({localTips.length}/10)</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <AnimatePresence>
                {localTips.map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="p-3">
                      <CardContent className="p-0">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 text-sm">{tip}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTip(index)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* معاينة النصائح */}
        {localTips.length > 0 && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <div className="text-xs text-muted-foreground mb-2">معاينة:</div>
            <div className="text-sm text-foreground">
              "{localTips[0]}" {localTips.length > 1 && `و ${localTips.length - 1} نصائح أخرى`}
            </div>
          </div>
        )}

        {/* أزرار الحفظ */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSaveTips}
            disabled={isLoading || !hasChanges}
            className="flex-1"
          >
            {isLoading ? "جاري الحفظ..." : "حفظ النصائح"}
          </Button>
          
          {hasChanges && (
            <Button
              variant="outline"
              onClick={() => setLocalTips(loadingTips)}
              disabled={isLoading}
            >
              إلغاء
            </Button>
          )}
        </div>

        {localTips.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            لم تتم إضافة أي نصائح بعد
            <br />
            أضف نصائح مفيدة لتظهر للعملاء أثناء تحميل متجرك
          </div>
        )}
      </div>
    </CustomizationSection>
  );
};

export default LoadingTipsSection;