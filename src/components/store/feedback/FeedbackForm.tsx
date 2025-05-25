
import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface FeedbackFormProps {
  visitorName: string;
  setVisitorName: (value: string) => void;
  visitorPhone: string;
  setVisitorPhone: (value: string) => void;
  feedbackType: string;
  setFeedbackType: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  colorTheme: string;
}

const FeedbackForm = ({
  visitorName,
  setVisitorName,
  visitorPhone,
  setVisitorPhone,
  feedbackType,
  setFeedbackType,
  description,
  setDescription,
  isSubmitting,
  onSubmit,
  colorTheme
}: FeedbackFormProps) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const getThemeGradient = (theme: string) => {
    switch (theme) {
      case 'coral':
        return 'from-[#ff9178]/20 to-[#ff6342]/20';
      case 'purple':
        return 'from-purple-500/20 to-purple-700/20';
      case 'blue':
        return 'from-blue-500/20 to-blue-700/20';
      case 'green':
        return 'from-green-500/20 to-green-700/20';
      case 'pink':
        return 'from-pink-500/20 to-pink-700/20';
      case 'teal':
        return 'from-teal-500/20 to-teal-700/20';
      case 'amber':
        return 'from-amber-500/20 to-amber-700/20';
      case 'indigo':
        return 'from-indigo-500/20 to-indigo-700/20';
      case 'rose':
        return 'from-rose-500/20 to-rose-700/20';
      default:
        return 'from-gray-500/20 to-gray-700/20';
    }
  };

  const getThemeAccent = (theme: string) => {
    switch (theme) {
      case 'coral':
        return '[#ff9178]';
      case 'purple':
        return 'purple-500';
      case 'blue':
        return 'blue-500';
      case 'green':
        return 'green-500';
      case 'pink':
        return 'pink-500';
      case 'teal':
        return 'teal-500';
      case 'amber':
        return 'amber-500';
      case 'indigo':
        return 'indigo-500';
      case 'rose':
        return 'rose-500';
      default:
        return 'gray-500';
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const fieldVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="visible"
      className={`space-y-${isMobile ? '4' : '6'} overflow-y-auto max-h-full`}
    >
      {/* الخلفية المتدرجة */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${getThemeGradient(colorTheme)} rounded-lg opacity-0 transition-opacity duration-300`}
        animate={{
          opacity: focusedField ? 0.5 : 0
        }}
      />

      {/* حقل الاسم */}
      <motion.div variants={fieldVariants} className="relative space-y-2">
        <Label className={`text-right ${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-700 dark:text-gray-300`}>
          الاسم *
        </Label>
        <motion.div
          className="relative"
          whileFocus={{ scale: isMobile ? 1 : 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Input
            value={visitorName}
            onChange={(e) => setVisitorName(e.target.value)}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
            className={`text-right transition-all duration-300 ${isMobile ? 'h-10 text-base' : 'h-11'} ${
              focusedField === 'name'
                ? `border-${getThemeAccent(colorTheme)} shadow-lg shadow-${getThemeAccent(colorTheme)}/20`
                : 'border-gray-200 dark:border-gray-700'
            }`}
            placeholder="أدخل اسمك"
          />
          {focusedField === 'name' && (
            <motion.div
              className={`absolute inset-0 border-2 border-${getThemeAccent(colorTheme)} rounded-md pointer-events-none`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.div>
      </motion.div>

      {/* حقل رقم الهاتف */}
      <motion.div variants={fieldVariants} className="relative space-y-2">
        <Label className={`text-right ${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-700 dark:text-gray-300`}>
          رقم الهاتف (اختياري)
        </Label>
        <motion.div
          className="relative"
          whileFocus={{ scale: isMobile ? 1 : 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Input
            type="tel"
            value={visitorPhone}
            onChange={(e) => setVisitorPhone(e.target.value)}
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField(null)}
            className={`text-right transition-all duration-300 ${isMobile ? 'h-10 text-base' : 'h-11'} ${
              focusedField === 'phone'
                ? `border-${getThemeAccent(colorTheme)} shadow-lg shadow-${getThemeAccent(colorTheme)}/20`
                : 'border-gray-200 dark:border-gray-700'
            }`}
            placeholder="أدخل رقم هاتفك"
            dir="ltr"
          />
          {focusedField === 'phone' && (
            <motion.div
              className={`absolute inset-0 border-2 border-${getThemeAccent(colorTheme)} rounded-md pointer-events-none`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.div>
      </motion.div>

      {/* نوع الملاحظات */}
      <motion.div variants={fieldVariants} className="relative space-y-2">
        <Label className={`text-right ${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-700 dark:text-gray-300`}>
          نوع الملاحظات *
        </Label>
        <Select 
          value={feedbackType} 
          onValueChange={setFeedbackType}
          onOpenChange={(open) => setFocusedField(open ? 'type' : null)}
        >
          <SelectTrigger 
            className={`text-right transition-all duration-300 ${isMobile ? 'h-10 text-base' : 'h-11'} ${
              focusedField === 'type'
                ? `border-${getThemeAccent(colorTheme)} shadow-lg shadow-${getThemeAccent(colorTheme)}/20`
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <SelectValue placeholder="اختر نوع الملاحظات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="complaint">شكوى</SelectItem>
            <SelectItem value="suggestion">اقتراح</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* الوصف */}
      <motion.div variants={fieldVariants} className="relative space-y-2">
        <Label className={`text-right ${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-700 dark:text-gray-300`}>
          الوصف *
        </Label>
        <motion.div
          className="relative"
          whileFocus={{ scale: isMobile ? 1 : 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onFocus={() => setFocusedField('description')}
            onBlur={() => setFocusedField(null)}
            className={`text-right ${isMobile ? 'min-h-[100px] text-base' : 'min-h-[120px]'} transition-all duration-300 resize-none ${
              focusedField === 'description'
                ? `border-${getThemeAccent(colorTheme)} shadow-lg shadow-${getThemeAccent(colorTheme)}/20`
                : 'border-gray-200 dark:border-gray-700'
            }`}
            placeholder="اكتب ملاحظاتك هنا..."
          />
          {focusedField === 'description' && (
            <motion.div
              className={`absolute inset-0 border-2 border-${getThemeAccent(colorTheme)} rounded-md pointer-events-none`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.div>
      </motion.div>

      {/* زر الإرسال */}
      <motion.div
        variants={fieldVariants}
        className={`${isMobile ? 'pt-3' : 'pt-4'}`}
      >
        <motion.div
          whileHover={{ scale: isMobile ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className={`w-full ${isMobile ? 'h-11 text-base' : 'h-12'} bg-gradient-to-r from-${getThemeAccent(colorTheme)} to-${getThemeAccent(colorTheme)}/80 hover:from-${getThemeAccent(colorTheme)}/90 hover:to-${getThemeAccent(colorTheme)}/70 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform`}
          >
            {isSubmitting ? (
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Loader2 className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'} animate-spin`} />
                <span>جاري الإرسال...</span>
              </motion.div>
            ) : (
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Send className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
                <span>إرسال الملاحظات</span>
              </motion.div>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default FeedbackForm;
