import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Clock, 
  Eye, 
  Phone, 
  Trash2, 
  MessageCircle,
  AlertCircle,
  ThumbsUp,
  HelpCircle,
  Sparkles,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FeedbackItem {
  id: string;
  visitor_name: string;
  visitor_phone: string | null;
  type: string;
  description: string;
  created_at: string;
  status: string;
}

interface OwnerFeedbackSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  storeOwnerId: string;
  colorTheme?: string;
}

const OwnerFeedbackSheet: React.FC<OwnerFeedbackSheetProps> = ({
  isOpen,
  onOpenChange,
  storeOwnerId,
  colorTheme,
}) => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [isDeletingResolved, setIsDeletingResolved] = useState(false);

  // جلب التقييمات
  useEffect(() => {
    if (!isOpen || !storeOwnerId) return;

    const fetchFeedback = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("feedback")
          .select("*")
          .eq("store_owner_id", storeOwnerId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // تحديث الشكاوى المعلقة إلى "تمت المراجعة"
        const pendingIds = data
          ?.filter(item => item.status === 'pending')
          .map(item => item.id) || [];

        if (pendingIds.length > 0) {
          await supabase
            .from("feedback")
            .update({ status: 'reviewed' })
            .in('id', pendingIds);

          // تحديث البيانات محلياً
          setFeedback(data?.map(item => 
            pendingIds.includes(item.id) 
              ? { ...item, status: 'reviewed' } 
              : item
          ) || []);
        } else {
          setFeedback(data || []);
        }
      } catch (error) {
        console.error("خطأ في جلب التقييمات:", error);
        toast.error("حدث خطأ في جلب التقييمات");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [isOpen, storeOwnerId]);

  // تحديد كمحلول
  const markAsResolved = async (id: string) => {
    setResolvingId(id);
    try {
      const { error } = await supabase
        .from("feedback")
        .update({ status: 'resolved' })
        .eq('id', id);

      if (error) throw error;

      setFeedback(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status: 'resolved' } : item
        )
      );
      toast.success("تم تحديد الرأي كمحلول");
    } catch (error) {
      console.error("خطأ في تحديث الحالة:", error);
      toast.error("حدث خطأ أثناء التحديث");
    } finally {
      setResolvingId(null);
    }
  };

  // حذف الآراء المحلولة
  const deleteResolvedFeedback = async () => {
    setIsDeletingResolved(true);
    try {
      const { data, error } = await supabase.rpc('delete_resolved_feedback', {
        owner_id: storeOwnerId
      });

      if (error) throw error;

      setFeedback(prev => prev.filter(item => item.status !== "resolved"));
      toast.success(`تم حذف ${data} رأي محلول`);
    } catch (error) {
      console.error("خطأ في حذف الآراء:", error);
      toast.error("حدث خطأ أثناء الحذف");
    } finally {
      setIsDeletingResolved(false);
    }
  };

  // الحصول على لون الثيم
  const getThemeColor = () => {
    if (colorTheme?.startsWith('#')) return colorTheme;
    const themeColors: { [key: string]: string } = {
      coral: '#ff9178',
      purple: '#8b5cf6',
      blue: '#3b82f6',
      green: '#10b981',
      pink: '#ec4899',
      teal: '#14b8a6',
      amber: '#f59e0b',
      indigo: '#6366f1',
      rose: '#f43f5e',
    };
    return themeColors[colorTheme || ''] || '#3b82f6';
  };

  const themeColor = getThemeColor();

  // أيقونة نوع الرأي
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'complaint': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'suggestion': return <Sparkles className="h-4 w-4 text-blue-500" />;
      case 'compliment': return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'question': return <HelpCircle className="h-4 w-4 text-amber-500" />;
      default: return <MessageCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // نص نوع الرأي
  const getTypeText = (type: string) => {
    switch (type) {
      case 'complaint': return 'شكوى';
      case 'suggestion': return 'اقتراح';
      case 'compliment': return 'إعجاب';
      case 'question': return 'استفسار';
      case 'other': return 'أخرى';
      default: return type;
    }
  };

  // الحصول على Badge الحالة
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 ml-1" />
            قيد المراجعة
          </Badge>
        );
      case 'reviewed':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Eye className="h-3 w-3 ml-1" />
            تمت المراجعة
          </Badge>
        );
      case 'resolved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 ml-1" />
            تم الحل
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const resolvedCount = feedback.filter(f => f.status === 'resolved').length;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
        <SheetHeader className="p-4 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-bold flex items-center gap-2">
              <MessageCircle className="h-5 w-5" style={{ color: themeColor }} />
              آراء العملاء
              <Badge variant="secondary" className="mr-2">
                {feedback.length}
              </Badge>
            </SheetTitle>
            
            {resolvedCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={deleteResolvedFeedback}
                disabled={isDeletingResolved}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                {isDeletingResolved ? (
                  <Loader2 className="h-4 w-4 animate-spin ml-1" />
                ) : (
                  <Trash2 className="h-4 w-4 ml-1" />
                )}
                حذف المحلولة ({resolvedCount})
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(85vh-80px)]">
          <div className="p-4 space-y-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground mt-2">جاري تحميل الآراء...</p>
              </div>
            ) : feedback.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="font-medium text-lg">لا توجد آراء حتى الآن</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  ستظهر آراء العملاء هنا عند إرسالها
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {feedback.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.15 }}
                    className="bg-card border rounded-xl p-4 shadow-sm"
                  >
                    {/* رأس البطاقة */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: themeColor }}
                        >
                          {item.visitor_name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{item.visitor_name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString('ar-SA', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>

                    {/* رقم الهاتف */}
                    {item.visitor_phone && (
                      <a 
                        href={`tel:${item.visitor_phone}`}
                        className="flex items-center gap-2 text-sm mb-3 p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                        style={{ color: themeColor }}
                      >
                        <Phone className="h-4 w-4" />
                        <span dir="ltr">{item.visitor_phone}</span>
                      </a>
                    )}

                    {/* نوع الرأي */}
                    <div className="flex items-center gap-2 mb-3">
                      {getTypeIcon(item.type)}
                      <span className="text-sm font-medium">{getTypeText(item.type)}</span>
                    </div>

                    {/* الوصف */}
                    <p className="text-foreground/80 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                      {item.description}
                    </p>

                    {/* زر تحديد كمحلول */}
                    {item.status !== 'resolved' && (
                      <Button
                        size="sm"
                        onClick={() => markAsResolved(item.id)}
                        disabled={resolvingId === item.id}
                        className="w-full"
                        style={{ 
                          backgroundColor: themeColor,
                          color: 'white'
                        }}
                      >
                        {resolvingId === item.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin ml-2" />
                            جاري التحديث...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 ml-2" />
                            تحديد كمحلول
                          </>
                        )}
                      </Button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default OwnerFeedbackSheet;
