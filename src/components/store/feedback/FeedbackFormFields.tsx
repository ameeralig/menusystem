import { useState } from "react";
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
      <Label className="text-right text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 justify-end">
        <span>{label} {required && <span className="text-red-500">*</span>}</span>
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
        <motion.div
          whileFocus={{ scale: isMobile ? 1 : 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Input
            value={formData.visitorName}
            onChange={(e) => onFormDataChange('visitorName', e.target.value.slice(0, 100))}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
            className={`
              text-right h-11 transition-all duration-300 border-2
              ${focusedField === 'name' 
                ? `border-[${getAccentColor(colorTheme)}] shadow-lg ring-2 ring-[${getAccentColor(colorTheme)}]/20` 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }
            `}
            placeholder="أدخل اسمك الكريم..."
            maxLength={100}
            required
            style={{
              borderColor: focusedField === 'name' ? getAccentColor(colorTheme) : undefined
            }}
          />
        </motion.div>
        <div className="text-xs text-gray-500 text-left">
          {formData.visitorName.length}/100 حرف
        </div>
      </FormField>

      {/* حقل رقم الهاتف */}
      <FormField label="رقم الهاتف (اختياري - 8-20 رقم)" icon={Phone}>
        <motion.div
          whileFocus={{ scale: isMobile ? 1 : 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Input
            type="tel"
            value={formData.visitorPhone}
            onChange={(e) => onFormDataChange('visitorPhone', e.target.value.slice(0, 20))}
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField(null)}
            className={`
              text-right h-11 transition-all duration-300 border-2
              ${focusedField === 'phone' 
                ? `border-[${getAccentColor(colorTheme)}] shadow-lg ring-2 ring-[${getAccentColor(colorTheme)}]/20` 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }
            `}
            placeholder="رقم الهاتف للتواصل معك..."
            dir="ltr"
            minLength={8}
            maxLength={20}
            style={{
              borderColor: focusedField === 'phone' ? getAccentColor(colorTheme) : undefined
            }}
          />
        </motion.div>
        {formData.visitorPhone && (
          <div className="text-xs text-gray-500 text-left">
            {formData.visitorPhone.length}/20 رقم
          </div>
        )}
      </FormField>

      {/* نوع الملاحظات */}
      <FormField label="نوع الملاحظات" icon={MessageSquare} required>
        <Select 
          value={formData.feedbackType} 
          onValueChange={(value) => onFormDataChange('feedbackType', value)}
          onOpenChange={(open) => setFocusedField(open ? 'type' : null)}
        >
          <SelectTrigger 
            className={`
              text-right h-11 transition-all duration-300 border-2
              ${focusedField === 'type' 
                ? `border-[${getAccentColor(colorTheme)}] shadow-lg ring-2 ring-[${getAccentColor(colorTheme)}]/20` 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }
            `}
            style={{
              borderColor: focusedField === 'type' ? getAccentColor(colorTheme) : undefined
            }}
          >
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
        <motion.div
          whileFocus={{ scale: isMobile ? 1 : 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Textarea
            value={formData.description}
            onChange={(e) => onFormDataChange('description', e.target.value.slice(0, 1000))}
            onFocus={() => setFocusedField('description')}
            onBlur={() => setFocusedField(null)}
            className={`
              text-right min-h-[120px] transition-all duration-300 resize-none border-2
              ${focusedField === 'description' 
                ? `border-[${getAccentColor(colorTheme)}] shadow-lg ring-2 ring-[${getAccentColor(colorTheme)}]/20` 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }
            `}
            placeholder="شاركنا تفاصيل ملاحظاتك أو اقتراحاتك بكل صراحة..."
            maxLength={1000}
            required
            style={{
              borderColor: focusedField === 'description' ? getAccentColor(colorTheme) : undefined
            }}
          />
        </motion.div>
        <div className="text-xs text-gray-500 text-left">
          {formData.description.length}/1000 حرف
        </div>
      </FormField>
    </motion.div>
  );
};

export default FeedbackFormFields;