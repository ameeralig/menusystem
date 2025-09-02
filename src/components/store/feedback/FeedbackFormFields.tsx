import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { User, Phone, MessageSquare, FileText } from "lucide-react";

interface FeedbackFormFieldsProps {
  formData: {
    visitorName: string;
    visitorPhone: string;
    feedbackType: string;
    description: string;
  };
  onFormDataChange: (field: string, value: string) => void;
  colorTheme?: string;
}

const FeedbackFormFields = ({ 
  formData, 
  onFormDataChange, 
  colorTheme = "default" 
}: FeedbackFormFieldsProps) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Stable event handlers to prevent re-renders
  const handleFocus = useCallback((fieldName: string) => {
    setFocusedField(fieldName);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  const handleInputChange = useCallback((field: string, value: string, maxLength?: number) => {
    const trimmedValue = maxLength ? value.slice(0, maxLength) : value;
    onFormDataChange(field, trimmedValue);
  }, [onFormDataChange]);

  const getAccentColor = (theme: string) => {
    const colors = {
      coral: "#ff9178",
      purple: "#8b5cf6",
      blue: "#3b82f6",
      green: "#10b981",
      pink: "#ec4899",
      teal: "#14b8a6",
      amber: "#f59e0b",
      indigo: "#6366f1",
      rose: "#f43f5e",
      default: "#6b7280"
    };
    return colors[theme as keyof typeof colors] || colors.default;
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const FormField = ({ 
    children, 
    label, 
    icon: Icon, 
    required = false 
  }: { 
    children: React.ReactNode; 
    label: string; 
    icon: any; 
    required?: boolean; 
  }) => (
    <motion.div
      variants={fieldVariants}
      className="space-y-2"
    >
      <Label className="text-right text-sm font-medium text-foreground flex items-center gap-2 justify-end">
        <span>{label} {required && <span className="text-destructive">*</span>}</span>
        <Icon className="w-4 h-4" style={{ color: getAccentColor(colorTheme) }} />
      </Label>
      {children}
    </motion.div>
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="space-y-4"
      transition={{ staggerChildren: 0.1 }}
    >
      {/* حقل الاسم */}
      <FormField label="الاسم (حد أقصى 100 حرف)" icon={User} required>
        <div className="space-y-1">
          <Input
            value={formData.visitorName}
            onChange={(e) => handleInputChange('visitorName', e.target.value, 100)}
            onFocus={() => handleFocus('name')}
            onBlur={handleBlur}
            className="text-right h-11 bg-background text-foreground border-2 border-border hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200"
            placeholder="أدخل اسمك الكريم..."
            maxLength={100}
            required
          />
          <div className="text-xs text-muted-foreground text-left">
            {formData.visitorName.length}/100 حرف
          </div>
        </div>
      </FormField>

      {/* حقل رقم الهاتف */}
      <FormField label="رقم الهاتف (اختياري - 8-20 رقم)" icon={Phone}>
        <div className="space-y-1">
          <Input
            type="tel"
            value={formData.visitorPhone}
            onChange={(e) => handleInputChange('visitorPhone', e.target.value, 20)}
            onFocus={() => handleFocus('phone')}
            onBlur={handleBlur}
            className="text-right h-11 bg-background text-foreground border-2 border-border hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200"
            placeholder="رقم الهاتف للتواصل معك..."
            dir="ltr"
            minLength={8}
            maxLength={20}
          />
          {formData.visitorPhone && (
            <div className="text-xs text-muted-foreground text-left">
              {formData.visitorPhone.length}/20 رقم
            </div>
          )}
        </div>
      </FormField>

      {/* نوع الملاحظات */}
      <FormField label="نوع الملاحظات" icon={MessageSquare} required>
        <Select 
          value={formData.feedbackType} 
          onValueChange={(value) => handleInputChange('feedbackType', value)}
          onOpenChange={(open) => handleFocus(open ? 'type' : '')}
        >
          <SelectTrigger className="text-right h-11 bg-background text-foreground border-2 border-border hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200">
            <SelectValue placeholder="اختر نوع الملاحظات..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="شكوى">💢 شكوى</SelectItem>
            <SelectItem value="اقتراح">💡 اقتراح</SelectItem>
            <SelectItem value="استفسار">❓ استفسار</SelectItem>
            <SelectItem value="مدح">👏 مدح وإعجاب</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      {/* الوصف */}
      <FormField label="الوصف التفصيلي (حد أقصى 1000 حرف)" icon={FileText} required>
        <div className="space-y-1">
          <Textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value, 1000)}
            onFocus={() => handleFocus('description')}
            onBlur={handleBlur}
            className="text-right min-h-[120px] bg-background text-foreground border-2 border-border hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200 resize-none"
            placeholder="شاركنا تفاصيل ملاحظاتك أو اقتراحاتك بكل صراحة..."
            maxLength={1000}
            required
          />
          <div className="text-xs text-muted-foreground text-left">
            {formData.description.length}/1000 حرف
          </div>
        </div>
      </FormField>
    </motion.div>
  );
};

export default FeedbackFormFields;