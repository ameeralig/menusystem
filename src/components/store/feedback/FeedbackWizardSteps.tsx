import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Phone, MessageSquare, FileText } from "lucide-react";

interface FeedbackWizardStepsProps {
  currentStep: number;
  formData: {
    visitorName: string;
    visitorPhone: string;
    feedbackType: string;
    description: string;
  };
  onFormDataChange: (field: string, value: string) => void;
  colorTheme?: string;
}

const FeedbackWizardSteps = ({
  currentStep,
  formData,
  onFormDataChange,
  colorTheme = "default",
}: FeedbackWizardStepsProps) => {
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

  const accentColor = getAccentColor(colorTheme);

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className="min-h-[300px]">
      {/* الخطوة 1: الاسم */}
      {currentStep === 1 && (
        <motion.div
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <User className="w-8 h-8" style={{ color: accentColor }} />
            </motion.div>
            <h3 className="text-xl font-bold" style={{ color: accentColor }}>
              ما هو اسمك؟
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              نود معرفة من يشاركنا رأيه القيم
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visitorName" className="text-right">الاسم *</Label>
            <Input
              id="visitorName"
              value={formData.visitorName}
              onChange={(e) => onFormDataChange('visitorName', e.target.value)}
              placeholder="أدخل اسمك الكريم..."
              maxLength={100}
              className="text-right h-12 text-lg"
              autoFocus
            />
            <div className="text-xs text-muted-foreground text-left">
              {formData.visitorName.length}/100 حرف
            </div>
          </div>
        </motion.div>
      )}

      {/* الخطوة 2: رقم الهاتف */}
      {currentStep === 2 && (
        <motion.div
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <Phone className="w-8 h-8" style={{ color: accentColor }} />
            </motion.div>
            <h3 className="text-xl font-bold" style={{ color: accentColor }}>
              كيف نتواصل معك؟
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              رقم الهاتف اختياري للتواصل معك (8-20 رقم)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visitorPhone" className="text-right">رقم الهاتف (اختياري)</Label>
            <Input
              id="visitorPhone"
              type="tel"
              value={formData.visitorPhone}
              onChange={(e) => onFormDataChange('visitorPhone', e.target.value)}
              placeholder="رقم الهاتف للتواصل معك..."
              maxLength={20}
              className="text-right h-12 text-lg"
              dir="ltr"
              autoFocus
            />
            {formData.visitorPhone && (
              <div className="text-xs text-muted-foreground text-left">
                {formData.visitorPhone.length}/20 رقم
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* الخطوة 3: نوع الملاحظات */}
      {currentStep === 3 && (
        <motion.div
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <MessageSquare className="w-8 h-8" style={{ color: accentColor }} />
            </motion.div>
            <h3 className="text-xl font-bold" style={{ color: accentColor }}>
              ما نوع ملاحظتك؟
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              اختر النوع المناسب لملاحظتك
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedbackType" className="text-right">نوع الملاحظات *</Label>
            <Select
              value={formData.feedbackType}
              onValueChange={(value) => onFormDataChange('feedbackType', value)}
            >
              <SelectTrigger className="text-right h-12 text-lg">
                <SelectValue placeholder="اختر نوع الملاحظات..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="complaint" className="text-right">
                  <span className="text-lg">💢 شكوى</span>
                </SelectItem>
                <SelectItem value="suggestion" className="text-right">
                  <span className="text-lg">💡 اقتراح</span>
                </SelectItem>
                <SelectItem value="question" className="text-right">
                  <span className="text-lg">❓ استفسار</span>
                </SelectItem>
                <SelectItem value="compliment" className="text-right">
                  <span className="text-lg">👏 مدح وإعجاب</span>
                </SelectItem>
                <SelectItem value="other" className="text-right">
                  <span className="text-lg">📝 أخرى</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      )}

      {/* الخطوة 4: الوصف */}
      {currentStep === 4 && (
        <motion.div
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <FileText className="w-8 h-8" style={{ color: accentColor }} />
            </motion.div>
            <h3 className="text-xl font-bold" style={{ color: accentColor }}>
              شاركنا التفاصيل
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              اكتب ملاحظاتك بالتفصيل (حد أقصى 1000 حرف)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-right">الوصف التفصيلي *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onFormDataChange('description', e.target.value)}
              placeholder="شاركنا تفاصيل ملاحظاتك أو اقتراحاتك بكل صراحة..."
              maxLength={1000}
              className="text-right min-h-[150px] text-lg resize-none"
              autoFocus
            />
            <div className="text-xs text-muted-foreground text-left">
              {formData.description.length}/1000 حرف
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FeedbackWizardSteps;
